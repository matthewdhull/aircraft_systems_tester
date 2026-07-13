import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import {
	hashPassword,
	PasswordActionService,
	SessionService,
	verifyPassword
} from '../../src/lib/server/auth/index.js';
import { seedBaselineAuthorization } from '../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/index.js';

class TestClock {
	constructor(private milliseconds: number) {}
	now(): Date {
		return new Date(this.milliseconds);
	}
	advance(milliseconds: number): void {
		this.milliseconds += milliseconds;
	}
}

const handles: DatabaseHandle[] = [];

function ephemeralPassword(): string {
	return randomBytes(24).toString('base64url');
}

function fixture(status: 'active' | 'pending' = 'active') {
	const database = openDatabase({ path: ':memory:' });
	handles.push(database);
	const clock = new TestClock(Date.UTC(2030, 0, 1));
	const now = clock.now().toISOString();
	const userId = randomUUID();
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, password_hash, status, created_at, updated_at)
			 VALUES (?, '000042', 'Synthetic', 'Instructor', ?, ?, ?, ?)`
		)
		.run(userId, status === 'active' ? hashPassword(ephemeralPassword()) : null, status, now, now);
	const sessions = new SessionService(database, recordAuditEvent, clock);
	return {
		database,
		clock,
		userId,
		sessions,
		actions: new PasswordActionService(database, sessions, recordAuditEvent, clock)
	};
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('password action security integration', () => {
	it('stores only a one-way, expiring action-token digest', () => {
		const { actions, database, userId } = fixture();
		const issued = actions.issue(userId, 'reset', userId);
		expect(issued.ok).toBe(true);
		if (!issued.ok) throw new Error('Synthetic password action was not issued.');

		const row = database.sqlite
			.prepare('SELECT id_hash, expires_at FROM password_action_tokens')
			.get() as { id_hash: string; expires_at: string };
		expect(row.id_hash).toMatch(/^[a-f0-9]{64}$/);
		expect(row.id_hash).toBe(createHash('sha256').update(issued.rawToken).digest('hex'));
		expect(row.expires_at).toBe(issued.expiresAt.toISOString());
	});

	it('consumes a token once, updates only the hash, and revokes active sessions', () => {
		const { actions, database, sessions, userId } = fixture();
		const replacementPassword = ephemeralPassword();
		const session = sessions.create(userId);
		const issued = actions.issue(userId, 'reset', userId);
		if (!issued.ok) throw new Error('Synthetic password action was not issued.');

		expect(actions.consume(issued.rawToken, replacementPassword)).toEqual({ ok: true });
		expect(actions.consume(issued.rawToken, replacementPassword)).toEqual({
			ok: false,
			error: 'not_found'
		});
		expect(sessions.resolve(session.rawToken).ok).toBe(false);
		const passwordHash = database.sqlite
			.prepare('SELECT password_hash FROM users WHERE id = ?')
			.pluck()
			.get(userId) as string;
		expect(passwordHash.startsWith('$argon2id$')).toBe(true);
		expect(verifyPassword(replacementPassword, passwordHash)).toBe(true);
		const tokenState = database.sqlite
			.prepare('SELECT used_at, revoked_at FROM password_action_tokens')
			.get() as { used_at: string | null; revoked_at: string | null };
		expect(tokenState.used_at).not.toBeNull();
		expect(tokenState.revoked_at).not.toBeNull();
	});

	it('rejects an action at the exact expiry boundary', () => {
		const { actions, clock, userId } = fixture();
		const replacementPassword = ephemeralPassword();
		const issued = actions.issue(userId, 'reset', userId);
		if (!issued.ok) throw new Error('Synthetic password action was not issued.');
		clock.advance(60 * 60 * 1_000);

		expect(actions.consume(issued.rawToken, replacementPassword)).toEqual({
			ok: false,
			error: 'not_found'
		});
	});

	it('activates a pending user after one-time initialization', () => {
		const { actions, database, userId } = fixture('pending');
		const replacementPassword = ephemeralPassword();
		const issued = actions.issue(userId, 'initialize', userId);
		if (!issued.ok) throw new Error('Synthetic password action was not issued.');

		expect(actions.consume(issued.rawToken, replacementPassword)).toEqual({ ok: true });
		expect(
			database.sqlite.prepare('SELECT status FROM users WHERE id = ?').pluck().get(userId)
		).toBe('active');
	});

	it('bootstrap requires an empty identity store and records the new administrator', async () => {
		const { bootstrapFirstAdministrator } = await import('../../src/lib/server/auth/index.js');
		const { database, clock } = fixture();
		database.sqlite.exec('DELETE FROM audit_events; DELETE FROM user_roles; DELETE FROM users;');
		database.transaction((tx) => seedBaselineAuthorization(tx, clock.now().toISOString()));
		const input = {
			employeeNumber: '000001',
			firstName: 'Synthetic',
			lastName: 'Administrator',
			password: ephemeralPassword()
		};

		const first = bootstrapFirstAdministrator(database, input, recordAuditEvent, clock);
		expect(first.ok).toBe(true);
		expect(bootstrapFirstAdministrator(database, input, recordAuditEvent, clock)).toMatchObject({
			ok: false,
			error: 'conflict'
		});
		expect(database.sqlite.prepare('SELECT count(*) FROM users').pluck().get()).toBe(1);
		expect(
			database.sqlite
				.prepare(
					"SELECT count(*) FROM audit_events WHERE action = 'bootstrap.administrator.created'"
				)
				.pluck()
				.get()
		).toBe(1);
	});
});
