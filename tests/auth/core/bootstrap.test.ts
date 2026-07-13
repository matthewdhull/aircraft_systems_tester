import { afterEach, describe, expect, it } from 'vitest';

import { bootstrapFirstAdministrator } from '../../../src/lib/server/auth/index.js';
import { seedBaselineAuthorization } from '../../../src/lib/server/authorization/index.js';
import type { DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { MutableClock, openTestDatabase, recordAuditEvent, syntheticPassword } from './helpers.js';

let handle: DatabaseHandle | undefined;
afterEach(() => handle?.close());

describe('first administrator bootstrap', () => {
	it('creates one UUID identity and administrator grant with an audit event', () => {
		handle = openTestDatabase();
		handle.transaction((tx) => seedBaselineAuthorization(tx, '2040-01-01T00:00:00.000Z'));
		const result = bootstrapFirstAdministrator(
			handle,
			{
				employeeNumber: '00001',
				firstName: 'Synthetic',
				lastName: 'Administrator',
				password: syntheticPassword()
			},
			recordAuditEvent,
			new MutableClock()
		);
		expect(result).toMatchObject({ ok: true });
		expect(handle.sqlite.prepare('SELECT employee_number FROM users').pluck().get()).toBe('00001');
		expect(handle.sqlite.prepare('SELECT count(*) FROM user_roles').pluck().get()).toBe(1);
		expect(
			handle.sqlite
				.prepare(
					"SELECT count(*) FROM audit_events WHERE action = 'bootstrap.administrator.created'"
				)
				.pluck()
				.get()
		).toBe(1);
	});

	it('refuses every non-empty or duplicate bootstrap state without adding an identity', () => {
		handle = openTestDatabase();
		handle.transaction((tx) => seedBaselineAuthorization(tx, '2040-01-01T00:00:00.000Z'));
		const input = {
			employeeNumber: '00002',
			firstName: 'Synthetic',
			lastName: 'Administrator',
			password: syntheticPassword()
		};
		expect(bootstrapFirstAdministrator(handle, input, recordAuditEvent).ok).toBe(true);
		expect(bootstrapFirstAdministrator(handle, input, recordAuditEvent)).toMatchObject({
			ok: false,
			error: 'conflict'
		});
		expect(handle.sqlite.prepare('SELECT count(*) FROM users').pluck().get()).toBe(1);
	});
});
