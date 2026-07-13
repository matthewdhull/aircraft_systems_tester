import { randomBytes, randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import {
	hashPassword,
	PasswordActionService,
	SessionService
} from '../../src/lib/server/auth/index.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/index.js';

const handles: DatabaseHandle[] = [];

function allPersistedValues(database: DatabaseHandle): string {
	const tables = database.sqlite
		.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
		.pluck()
		.all() as string[];
	const values: unknown[] = [];
	for (const table of tables) {
		if (!/^[a-z0-9_]+$/i.test(table)) throw new Error('Unexpected synthetic table name.');
		values.push(...database.sqlite.prepare(`SELECT * FROM "${table}"`).all());
	}
	return JSON.stringify(values);
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('sensitive persistence scan', () => {
	it('finds no raw password, session value, or password-action value anywhere in SQLite', () => {
		const database = openDatabase({ path: ':memory:' });
		handles.push(database);
		const userId = randomUUID();
		const password = randomBytes(24).toString('base64url');
		const timestamp = '2030-01-01T00:00:00.000Z';
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, password_hash, status, created_at, updated_at)
				 VALUES (?, '000042', 'Synthetic', 'Instructor', ?, 'active', ?, ?)`
			)
			.run(userId, hashPassword(password), timestamp, timestamp);

		const sessions = new SessionService(database, recordAuditEvent, {
			now: () => new Date(timestamp)
		});
		const session = sessions.create(userId);
		const passwordAction = new PasswordActionService(database, sessions, recordAuditEvent, {
			now: () => new Date(timestamp)
		}).issue(userId, 'reset', userId);
		if (!passwordAction.ok) throw new Error('Synthetic password action was not issued.');

		const persisted = allPersistedValues(database);
		expect(persisted.includes(password)).toBe(false);
		expect(persisted.includes(session.rawToken)).toBe(false);
		expect(persisted.includes(passwordAction.rawToken)).toBe(false);
		expect(
			database.sqlite
				.prepare(
					`SELECT count(*) FROM users
					 WHERE password_hash IS NOT NULL AND password_hash NOT LIKE '$argon2id$%'`
				)
				.pluck()
				.get()
		).toBe(0);
		expect(
			database.sqlite
				.prepare(
					"SELECT count(*) FROM sessions WHERE length(id_hash) <> 64 OR id_hash GLOB '*[^0-9a-f]*'"
				)
				.pluck()
				.get()
		).toBe(0);
	});
});
