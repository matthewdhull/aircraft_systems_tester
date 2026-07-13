import { randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import { SessionService, hashSessionToken } from '../../src/lib/server/auth/index.js';
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

function fixture() {
	const database = openDatabase({ path: ':memory:' });
	handles.push(database);
	const clock = new TestClock(Date.UTC(2030, 0, 1));
	const userId = randomUUID();
	const timestamp = clock.now().toISOString();
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 'active', ?, ?)`
		)
		.run(userId, '000042', 'Synthetic', 'Instructor', timestamp, timestamp);
	return {
		database,
		clock,
		userId,
		sessions: new SessionService(database, recordAuditEvent, clock)
	};
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('session security integration', () => {
	it('stores only a one-way token digest and supports concurrent sessions', () => {
		const { database, sessions, userId } = fixture();
		const first = sessions.create(userId);
		const second = sessions.create(userId);

		const stored = database.sqlite
			.prepare('SELECT id_hash FROM sessions ORDER BY id_hash')
			.pluck()
			.all() as string[];
		expect(stored).toHaveLength(2);
		expect(stored.every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
		expect(stored).toContain(hashSessionToken(first.rawToken));
		expect(stored).toContain(hashSessionToken(second.rawToken));
		expect(sessions.resolve(first.rawToken).ok).toBe(true);
		expect(sessions.resolve(second.rawToken).ok).toBe(true);
	});

	it('expires at the 30-minute idle boundary and records revocation safely', () => {
		const { clock, database, sessions, userId } = fixture();
		const created = sessions.create(userId);

		clock.advance(29 * 60 * 1_000);
		expect(sessions.resolve(created.rawToken).ok).toBe(true);
		clock.advance(30 * 60 * 1_000);
		expect(sessions.resolve(created.rawToken)).toEqual({
			ok: false,
			error: 'unauthenticated'
		});
		const row = database.sqlite
			.prepare('SELECT revoked_at, revocation_reason FROM sessions WHERE id_hash = ?')
			.get(created.tokenHash) as { revoked_at: string | null; revocation_reason: string | null };
		expect(row.revoked_at).not.toBeNull();
		expect(row.revocation_reason).toBe('expired');
		const actions = database.sqlite
			.prepare('SELECT action FROM audit_events ORDER BY occurred_at, rowid')
			.pluck()
			.all();
		expect(actions).toEqual(['session.created', 'session.revoked']);
	});

	it('never extends the 12-hour absolute deadline with activity', () => {
		const { clock, sessions, userId } = fixture();
		const created = sessions.create(userId);

		for (let interval = 1; interval < 36; interval += 1) {
			clock.advance(20 * 60 * 1_000);
			expect(sessions.resolve(created.rawToken).ok).toBe(true);
		}
		clock.advance(20 * 60 * 1_000);
		expect(sessions.resolve(created.rawToken)).toEqual({
			ok: false,
			error: 'unauthenticated'
		});
	});

	it('rotates atomically and rejects the superseded session', () => {
		const { database, sessions, userId } = fixture();
		const original = sessions.create(userId);
		const rotated = sessions.rotate(original.rawToken);
		expect(rotated).not.toBeNull();
		if (!rotated) throw new Error('Synthetic rotation failed.');

		expect(sessions.resolve(original.rawToken).ok).toBe(false);
		expect(sessions.resolve(rotated.rawToken).ok).toBe(true);
		const originalRow = database.sqlite
			.prepare('SELECT revoked_at, revocation_reason FROM sessions WHERE id_hash = ?')
			.get(original.tokenHash) as { revoked_at: string | null; revocation_reason: string | null };
		expect(originalRow.revoked_at).not.toBeNull();
		expect(originalRow.revocation_reason).toBe('rotation');
	});

	it('supports explicit revocation and rejects inactive users with valid-looking sessions', () => {
		const { database, sessions, userId } = fixture();
		const explicitlyRevoked = sessions.create(userId);
		sessions.revoke(explicitlyRevoked.rawToken, 'administrator_revocation');
		expect(sessions.resolve(explicitlyRevoked.rawToken).ok).toBe(false);

		const inactive = sessions.create(userId);
		database.sqlite.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(userId);
		expect(sessions.resolve(inactive.rawToken)).toEqual({
			ok: false,
			error: 'unauthenticated'
		});
	});
});
