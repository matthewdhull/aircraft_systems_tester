import { randomBytes } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import {
	SESSION_COOKIE_MAX_AGE_SECONDS,
	SESSION_COOKIE_NAME,
	clearSessionCookie,
	setSessionCookie
} from '../../src/lib/server/authorization';

describe('session cookie policy', () => {
	it('sets production cookie flags and caps the absolute lifetime', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-07-12T00:00:00.000Z'));
		const calls: unknown[][] = [];
		const cookies = { set: (...args: unknown[]) => calls.push(args) };
		const ephemeralToken = randomBytes(32).toString('base64url');

		setSessionCookie(cookies as never, ephemeralToken, new Date('2026-07-13T00:00:00.000Z'), true);

		expect(calls).toHaveLength(1);
		expect(calls[0]?.[0]).toBe(SESSION_COOKIE_NAME);
		expect(calls[0]?.[1] === ephemeralToken).toBe(true);
		expect(calls[0]?.[2]).toEqual({
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: SESSION_COOKIE_MAX_AGE_SECONDS
		});
		vi.useRealTimers();
	});

	it('clears with the same scope and non-production secure policy', () => {
		const calls: unknown[][] = [];
		const cookies = { delete: (...args: unknown[]) => calls.push(args) };
		clearSessionCookie(cookies as never, false);
		expect(calls).toEqual([
			[SESSION_COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax', secure: false }]
		]);
	});
});
