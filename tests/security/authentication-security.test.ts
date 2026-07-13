import { randomBytes, randomUUID } from 'node:crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import {
	AuthenticationService,
	hashPassword,
	SessionService
} from '../../src/lib/server/auth/index.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/index.js';
import { createLoginRateLimiter } from '../../src/lib/server/security/index.js';

const handles: DatabaseHandle[] = [];

function ephemeralPassword(): string {
	return randomBytes(24).toString('base64url');
}

function fixture() {
	const database = openDatabase({ path: ':memory:' });
	handles.push(database);
	const now = new Date('2030-01-01T00:00:00.000Z');
	const clock = { now: () => new Date(now) };
	const password = ephemeralPassword();
	const incorrectPassword = ephemeralPassword();
	const passwordHash = hashPassword(password);
	const insert = database.sqlite.prepare(
		`INSERT INTO users
		 (id, employee_number, first_name, last_name, password_hash, status, created_at, updated_at)
		 VALUES (?, ?, 'Synthetic', 'Instructor', ?, ?, ?, ?)`
	);
	for (const [employeeNumber, status] of [
		['000001', 'active'],
		['000002', 'pending'],
		['000003', 'suspended'],
		['000004', 'retired']
	] as const) {
		insert.run(
			randomUUID(),
			employeeNumber,
			passwordHash,
			status,
			now.toISOString(),
			now.toISOString()
		);
	}
	const sessions = new SessionService(database, recordAuditEvent, clock);
	const service = new AuthenticationService(
		database,
		sessions,
		recordAuditEvent,
		createLoginRateLimiter({ clock }),
		hashPassword(ephemeralPassword()),
		clock
	);
	return { database, service, password, incorrectPassword };
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('authentication security integration', () => {
	it('returns one generic response for wrong, unknown, and ineligible accounts', () => {
		const { database, service, password, incorrectPassword } = fixture();
		const networkKey = 'synthetic-network-a';
		const results = [
			service.login('000001', incorrectPassword, { networkKey }),
			service.login('009999', password, { networkKey }),
			service.login('000002', password, { networkKey }),
			service.login('000003', password, { networkKey }),
			service.login('000004', password, { networkKey })
		];

		for (const result of results) {
			expect(result).toEqual({ ok: false, error: 'authentication_failed' });
		}
		expect(database.sqlite.prepare('SELECT count(*) FROM sessions').pluck().get()).toBe(0);
	});

	it('creates a digest-only session for correct active credentials', () => {
		const { database, service, password } = fixture();
		const result = service.login('000001', password, {
			networkKey: 'synthetic-network-b'
		});
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('Synthetic authentication failed.');

		const stored = database.sqlite.prepare('SELECT id_hash FROM sessions').pluck().get() as string;
		expect(stored).toMatch(/^[a-f0-9]{64}$/);
		expect(database.sqlite.prepare('SELECT count(*) FROM sessions').pluck().get()).toBe(1);
		expect(
			database.sqlite
				.prepare(
					"SELECT count(*) FROM audit_events WHERE action = 'authentication.login.succeeded'"
				)
				.pluck()
				.get()
		).toBe(1);
	});

	it('rate limits repeated attempts with generic retry metadata', () => {
		const { service, incorrectPassword } = fixture();
		for (let attempt = 0; attempt < 5; attempt += 1) {
			expect(
				service.login('009998', incorrectPassword, { networkKey: 'synthetic-network-c' })
			).toEqual({ ok: false, error: 'authentication_failed' });
		}
		const limited = service.login('009998', incorrectPassword, {
			networkKey: 'synthetic-network-c'
		});
		expect(limited).toEqual({ ok: false, error: 'rate_limited', retryAfterSeconds: 900 });
	});
});
