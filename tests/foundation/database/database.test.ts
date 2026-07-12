import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
	DatabaseInitializationError,
	DEFAULT_BUSY_TIMEOUT_MS,
	openDatabase,
	type DatabaseHandle
} from '../../../src/lib/server/db/index.js';

const handles: DatabaseHandle[] = [];
const temporaryDirectories: string[] = [];

function temporaryDatabase(name = 'foundation.sqlite'): { directory: string; path: string } {
	const directory = mkdtempSync(join(tmpdir(), 'aircraft-systems-tester-db-'));
	temporaryDirectories.push(directory);
	return { directory, path: join(directory, name) };
}

function open(path: string, options: Partial<Parameters<typeof openDatabase>[0]> = {}) {
	const handle = openDatabase({ path, ...options });
	handles.push(handle);
	return handle;
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe('database foundation', () => {
	it('creates a persistent database and applies the foundation migration', () => {
		const target = temporaryDatabase();
		const handle = open(target.path);

		expect(existsSync(target.path)).toBe(true);
		const tables = handle.sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
			.pluck()
			.all();
		expect(tables).toContain('_foundation_metadata');
		expect(tables).toContain('__drizzle_migrations');
	});

	it('does not reapply an already recorded migration', () => {
		const target = temporaryDatabase();
		const first = open(target.path);
		expect(first.sqlite.prepare('SELECT count(*) FROM __drizzle_migrations').pluck().get()).toBe(1);
		first.close();

		const reopened = open(target.path);
		expect(reopened.sqlite.prepare('SELECT count(*) FROM __drizzle_migrations').pluck().get()).toBe(
			1
		);
	});

	it('enforces required pragmas and verifies availability', () => {
		const handle = open(temporaryDatabase().path);

		expect(handle.verify()).toEqual({
			ok: true,
			foreignKeys: true,
			journalMode: 'wal',
			busyTimeoutMs: DEFAULT_BUSY_TIMEOUT_MS,
			integrity: 'ok'
		});
		expect(handle.sqlite.pragma('foreign_keys', { simple: true })).toBe(1);
		expect(handle.sqlite.pragma('journal_mode', { simple: true })).toBe('wal');
		expect(handle.sqlite.pragma('busy_timeout', { simple: true })).toBe(DEFAULT_BUSY_TIMEOUT_MS);
	});

	it('uses SQLite delete journaling for an anonymous temporary database', () => {
		const handle = open('');

		expect(handle.pathKind).toBe('temporary');
		expect(handle.verify()).toMatchObject({
			ok: true,
			journalMode: 'delete'
		});
		expect(handle.sqlite.pragma('journal_mode', { simple: true })).toBe('delete');
	});

	it('commits a successful explicit transaction', () => {
		const handle = open(':memory:');

		const result = handle.transaction((db) => {
			db.$client
				.prepare(
					'INSERT INTO _foundation_metadata (id, foundation_version, applied_at) VALUES (?, ?, ?)'
				)
				.run(1, 'phase-2-test', '2000-01-01T00:00:00.000Z');
			return 'committed';
		});

		expect(result).toBe('committed');
		expect(handle.sqlite.prepare('SELECT count(*) FROM _foundation_metadata').pluck().get()).toBe(
			1
		);
	});

	it('rolls back an explicit transaction when work throws', () => {
		const handle = open(':memory:');

		expect(() =>
			handle.transaction((db) => {
				db.$client
					.prepare(
						'INSERT INTO _foundation_metadata (id, foundation_version, applied_at) VALUES (?, ?, ?)'
					)
					.run(1, 'phase-2-test', '2000-01-01T00:00:00.000Z');
				throw new Error('synthetic rollback');
			})
		).toThrow('synthetic rollback');
		expect(handle.sqlite.prepare('SELECT count(*) FROM _foundation_metadata').pluck().get()).toBe(
			0
		);
	});

	it('keeps separate test databases isolated', () => {
		const first = open(temporaryDatabase('first.sqlite').path);
		const second = open(temporaryDatabase('second.sqlite').path);

		first.sqlite
			.prepare(
				'INSERT INTO _foundation_metadata (id, foundation_version, applied_at) VALUES (?, ?, ?)'
			)
			.run(1, 'first-only', '2000-01-01T00:00:00.000Z');

		expect(first.sqlite.prepare('SELECT count(*) FROM _foundation_metadata').pluck().get()).toBe(1);
		expect(second.sqlite.prepare('SELECT count(*) FROM _foundation_metadata').pluck().get()).toBe(
			0
		);
	});

	it('fails safely when the database parent is not a directory', () => {
		const target = temporaryDatabase();
		const parentFile = join(target.directory, 'not-a-directory');
		writeFileSync(parentFile, 'synthetic non-sensitive test marker');

		expect(() => openDatabase({ path: join(parentFile, 'database.sqlite') })).toThrow(
			DatabaseInitializationError
		);
		expect(() => openDatabase({ path: join(parentFile, 'database.sqlite') })).toThrow(
			'Database initialization failed.'
		);
	});

	it('supports idempotent graceful close', () => {
		const handle = open(':memory:');
		handle.close();
		handle.close();

		expect(handle.sqlite.open).toBe(false);
	});
});
