import { afterEach, describe, expect, it } from 'vitest';

import {
	AuthenticationService,
	hashPassword,
	SessionService,
	type LoginRateLimit
} from '../../../src/lib/server/auth/index.js';
import type { DatabaseHandle } from '../../../src/lib/server/db/index.js';
import {
	insertUser,
	MutableClock,
	openTestDatabase,
	recordAuditEvent,
	syntheticPassword
} from './helpers.js';

let handle: DatabaseHandle | undefined;
afterEach(() => handle?.close());

class AllowingLimiter implements LoginRateLimit {
	count = 0;
	consume(): { allowed: true } {
		this.count += 1;
		return { allowed: true };
	}
}

describe('authentication service', () => {
	it('logs in an active account and returns a revocable session', () => {
		handle = openTestDatabase();
		const clock = new MutableClock();
		const password = syntheticPassword();
		const employeeNumber = '00127';
		const userId = insertUser(handle, { employeeNumber, passwordHash: hashPassword(password) });
		const sessions = new SessionService(handle, recordAuditEvent, clock);
		const limiter = new AllowingLimiter();
		const auth = new AuthenticationService(
			handle,
			sessions,
			recordAuditEvent,
			limiter,
			hashPassword(syntheticPassword()),
			clock
		);
		const result = auth.login(employeeNumber, password, { networkKey: 'synthetic-network' });
		expect(result).toMatchObject({ ok: true, value: { userId, employeeNumber } });
		expect(limiter.count).toBe(1);
		if (result.ok) {
			expect(sessions.resolve(result.value.session.rawToken).ok).toBe(true);
		}
	});

	it.each(['pending', 'suspended', 'retired'] as const)(
		'uses the same external failure for a %s account',
		(status) => {
			handle = openTestDatabase();
			const password = syntheticPassword();
			const employeeNumber = '00991';
			insertUser(handle, { employeeNumber, passwordHash: hashPassword(password), status });
			const sessions = new SessionService(handle, recordAuditEvent);
			const auth = new AuthenticationService(
				handle,
				sessions,
				recordAuditEvent,
				new AllowingLimiter(),
				hashPassword(syntheticPassword())
			);
			expect(auth.login(employeeNumber, password, { networkKey: 'synthetic-network' })).toEqual({
				ok: false,
				error: 'authentication_failed'
			});
		}
	);

	it('makes wrong-password, unknown-account, and missing-hash failures indistinguishable', () => {
		handle = openTestDatabase();
		const password = syntheticPassword();
		insertUser(handle, { employeeNumber: '00017', passwordHash: hashPassword(password) });
		insertUser(handle, { employeeNumber: '00018', passwordHash: null });
		const sessions = new SessionService(handle, recordAuditEvent);
		const auth = new AuthenticationService(
			handle,
			sessions,
			recordAuditEvent,
			new AllowingLimiter(),
			hashPassword(syntheticPassword())
		);
		const context = { networkKey: 'synthetic-network' };
		const expected = { ok: false, error: 'authentication_failed' };
		expect(auth.login('00017', syntheticPassword(), context)).toEqual(expected);
		expect(auth.login('does-not-match', password, context)).toEqual(expected);
		expect(auth.login('00018', password, context)).toEqual(expected);
	});

	it('rate-limits and generically rejects a blank submitted credential attempt', () => {
		handle = openTestDatabase();
		const sessions = new SessionService(handle, recordAuditEvent);
		const limiter = new AllowingLimiter();
		const auth = new AuthenticationService(
			handle,
			sessions,
			recordAuditEvent,
			limiter,
			hashPassword(syntheticPassword())
		);
		expect(auth.login('', '', { networkKey: 'synthetic-network' })).toEqual({
			ok: false,
			error: 'authentication_failed'
		});
		expect(limiter.count).toBe(1);
	});

	it('returns a generic rate-limited response before lookup', () => {
		handle = openTestDatabase();
		const sessions = new SessionService(handle, recordAuditEvent);
		const limiter: LoginRateLimit = {
			consume: () => ({ allowed: false, retryAfterSeconds: 30 })
		};
		const auth = new AuthenticationService(
			handle,
			sessions,
			recordAuditEvent,
			limiter,
			hashPassword(syntheticPassword())
		);
		expect(
			auth.login('synthetic', syntheticPassword(), { networkKey: 'synthetic-network' })
		).toEqual({
			ok: false,
			error: 'rate_limited',
			retryAfterSeconds: 30
		});
	});
});
