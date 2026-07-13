import { describe, expect, it } from 'vitest';

import { LoginRateLimiter } from '../../src/lib/server/security/rate-limiter.js';

class TestClock {
	constructor(private time: number) {}
	now(): Date {
		return new Date(this.time);
	}
	advance(milliseconds: number): void {
		this.time += milliseconds;
	}
}

describe('login rate limiter', () => {
	it('limits an account with deterministic retry metadata', () => {
		const clock = new TestClock(Date.UTC(2030, 0, 1));
		const limiter = new LoginRateLimiter({
			clock,
			windowMs: 60_000,
			maxAttemptsPerAccount: 2,
			maxAttemptsPerNetwork: 10
		});
		const attempt = { accountKey: '000042', networkKey: '192.0.2.1' };

		expect(limiter.consume(attempt)).toEqual({ allowed: true });
		expect(limiter.consume(attempt)).toEqual({ allowed: true });
		expect(limiter.consume(attempt)).toEqual({ allowed: false, retryAfterSeconds: 60 });
		clock.advance(30_000);
		expect(limiter.consume(attempt)).toEqual({ allowed: false, retryAfterSeconds: 30 });
		clock.advance(30_001);
		expect(limiter.consume(attempt)).toEqual({ allowed: true });
	});

	it('limits a network independently across account identifiers', () => {
		const clock = new TestClock(Date.UTC(2030, 0, 1));
		const limiter = new LoginRateLimiter({
			clock,
			maxAttemptsPerAccount: 10,
			maxAttemptsPerNetwork: 2
		});

		expect(limiter.consume({ accountKey: '000001', networkKey: '198.51.100.2' })).toEqual({
			allowed: true
		});
		expect(limiter.consume({ accountKey: '000002', networkKey: '198.51.100.2' })).toEqual({
			allowed: true
		});
		expect(limiter.consume({ accountKey: '000003', networkKey: '198.51.100.2' }).allowed).toBe(
			false
		);
	});

	it('normalizes keys without retaining their plaintext values', () => {
		const limiter = new LoginRateLimiter({ maxAttemptsPerAccount: 1 });

		expect(limiter.consume({ accountKey: ' 000077 ', networkKey: 'Example-Network' })).toEqual({
			allowed: true
		});
		expect(limiter.consume({ accountKey: '000077', networkKey: 'other-network' }).allowed).toBe(
			false
		);
		expect(JSON.stringify(limiter)).not.toContain('000077');
	});

	it('fails closed at its configured storage bound and recovers after expiry', () => {
		const clock = new TestClock(Date.UTC(2030, 0, 1));
		const limiter = new LoginRateLimiter({
			clock,
			windowMs: 1_000,
			maxTrackedKeys: 2
		});

		expect(limiter.consume({ accountKey: 'one', networkKey: 'network-one' }).allowed).toBe(true);
		expect(limiter.trackedKeyCount).toBe(2);
		expect(limiter.consume({ accountKey: 'two', networkKey: 'network-two' })).toEqual({
			allowed: false,
			retryAfterSeconds: 1
		});
		expect(limiter.trackedKeyCount).toBe(2);

		clock.advance(1_001);
		expect(limiter.consume({ accountKey: 'two', networkKey: 'network-two' }).allowed).toBe(true);
	});

	it('rejects invalid configuration, keys, and clocks', () => {
		expect(() => new LoginRateLimiter({ maxTrackedKeys: 0 })).toThrow(TypeError);
		const limiter = new LoginRateLimiter();
		expect(() => limiter.consume({ accountKey: '', networkKey: 'network' })).toThrow(TypeError);
		const invalidClock = new LoginRateLimiter({ clock: { now: () => new Date(Number.NaN) } });
		expect(() => invalidClock.consume({ accountKey: 'account', networkKey: 'network' })).toThrow(
			TypeError
		);
	});
});
