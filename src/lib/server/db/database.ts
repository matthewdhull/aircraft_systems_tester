import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { DatabaseInitializationError, DatabaseVerificationError } from './errors.js';
import { foundationSchema } from './schema.js';

export const DEFAULT_BUSY_TIMEOUT_MS = 5_000;

export type DatabasePathKind = 'memory' | 'temporary' | 'persistent';
export type FoundationDatabase = BetterSQLite3Database<typeof foundationSchema> & {
	$client: Database.Database;
};

export interface OpenDatabaseOptions {
	path: string;
	busyTimeoutMs?: number;
	migrationsFolder?: string;
	createParentDirectory?: boolean;
}

export interface DatabaseVerification {
	ok: true;
	foreignKeys: true;
	journalMode: 'wal' | 'memory' | 'delete';
	busyTimeoutMs: number;
	integrity: 'ok';
}

export interface DatabaseHandle {
	readonly db: FoundationDatabase;
	readonly sqlite: Database.Database;
	readonly pathKind: DatabasePathKind;
	readonly busyTimeoutMs: number;
	verify(): DatabaseVerification;
	transaction<T>(work: (db: FoundationDatabase) => T): T;
	close(): void;
}

function classifyPath(path: string): DatabasePathKind {
	if (path === ':memory:') return 'memory';
	if (path === '') return 'temporary';
	return 'persistent';
}

function validateOptions(options: OpenDatabaseOptions): Required<OpenDatabaseOptions> {
	if (typeof options.path !== 'string' || options.path.includes('\0')) {
		throw new DatabaseInitializationError();
	}

	const busyTimeoutMs = options.busyTimeoutMs ?? DEFAULT_BUSY_TIMEOUT_MS;
	if (!Number.isSafeInteger(busyTimeoutMs) || busyTimeoutMs < 0 || busyTimeoutMs > 60_000) {
		throw new DatabaseInitializationError();
	}

	return {
		path: options.path,
		busyTimeoutMs,
		migrationsFolder: options.migrationsFolder ?? resolve(process.cwd(), 'drizzle'),
		createParentDirectory: options.createParentDirectory ?? true
	};
}

function preparePersistentParent(path: string, create: boolean): void {
	const parent = dirname(resolve(path));
	if (create) mkdirSync(parent, { recursive: true, mode: 0o700 });
	if (!statSync(parent).isDirectory()) throw new Error('Database parent is not a directory.');
}

function getPragmaNumber(sqlite: Database.Database, pragma: string): number {
	return Number(sqlite.pragma(pragma, { simple: true }));
}

function getPragmaString(sqlite: Database.Database, pragma: string): string {
	return String(sqlite.pragma(pragma, { simple: true })).toLowerCase();
}

export function verifyDatabase(
	handle: Pick<DatabaseHandle, 'sqlite' | 'pathKind' | 'busyTimeoutMs'>
): DatabaseVerification {
	try {
		const foreignKeys = getPragmaNumber(handle.sqlite, 'foreign_keys');
		if (foreignKeys !== 1)
			throw new DatabaseVerificationError('foreign-key enforcement is disabled');

		const busyTimeoutMs = getPragmaNumber(handle.sqlite, 'busy_timeout');
		if (busyTimeoutMs !== handle.busyTimeoutMs) {
			throw new DatabaseVerificationError('busy timeout differs from the configured value');
		}

		const journalMode = getPragmaString(handle.sqlite, 'journal_mode');
		const expectedJournalMode =
			handle.pathKind === 'persistent' ? 'wal' : handle.pathKind === 'memory' ? 'memory' : 'delete';
		if (journalMode !== expectedJournalMode) {
			throw new DatabaseVerificationError('journal mode is not safe for the configured storage');
		}

		const integrity = getPragmaString(handle.sqlite, 'quick_check');
		if (integrity !== 'ok') throw new DatabaseVerificationError('SQLite quick check did not pass');

		handle.sqlite.prepare('SELECT 1').pluck().get();
		return {
			ok: true,
			foreignKeys: true,
			journalMode: expectedJournalMode,
			busyTimeoutMs,
			integrity: 'ok'
		};
	} catch (error) {
		if (error instanceof DatabaseVerificationError) throw error;
		throw new DatabaseVerificationError('database is unavailable');
	}
}

export function openDatabase(rawOptions: OpenDatabaseOptions): DatabaseHandle {
	let sqlite: Database.Database | undefined;
	try {
		const options = validateOptions(rawOptions);
		const pathKind = classifyPath(options.path);
		if (pathKind === 'persistent') {
			preparePersistentParent(options.path, options.createParentDirectory);
		}

		sqlite = new Database(options.path, { timeout: options.busyTimeoutMs });
		sqlite.pragma(`busy_timeout = ${options.busyTimeoutMs}`);
		if (pathKind === 'persistent') sqlite.pragma('journal_mode = WAL');

		const db = drizzle(sqlite, { schema: foundationSchema });
		// SQLite cannot disable foreign keys from inside the transaction owned by
		// Drizzle's table-rebuild migrations. Disable them before migration, then
		// fail verification if the committed schema contains any broken reference.
		sqlite.pragma('foreign_keys = OFF');
		try {
			migrate(db, { migrationsFolder: options.migrationsFolder });
		} finally {
			sqlite.pragma('foreign_keys = ON');
		}

		let closed = false;
		const handle: DatabaseHandle = {
			db,
			sqlite,
			pathKind,
			busyTimeoutMs: options.busyTimeoutMs,
			verify() {
				return verifyDatabase(handle);
			},
			transaction<T>(work: (database: FoundationDatabase) => T): T {
				const run = sqlite!.transaction(() => {
					const result = work(db);
					if (result instanceof Promise) {
						throw new TypeError('Database transactions must be synchronous.');
					}
					return result;
				});
				return run.immediate();
			},
			close() {
				if (!closed && sqlite!.open) sqlite!.close();
				closed = true;
			}
		};

		handle.verify();
		return handle;
	} catch (error) {
		if (sqlite?.open) sqlite.close();
		if (error instanceof DatabaseInitializationError) throw error;
		throw new DatabaseInitializationError();
	}
}
