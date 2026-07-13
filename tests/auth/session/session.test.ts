import { afterEach, describe, expect, it } from 'vitest';

import {
	hashSessionToken,
	SESSION_ABSOLUTE_LIMIT_MS,
	SESSION_IDLE_LIMIT_MS,
	SESSION_TOKEN_BYTES,
	SessionService
} from '../../../src/lib/server/auth/index.js';
import type { DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { insertUser, MutableClock, openTestDatabase, recordAuditEvent } from '../core/helpers.js';

let handle: DatabaseHandle | undefined;
afterEach(() => handle?.close());

function setup() {
	handle = openTestDatabase();
	const clock = new MutableClock();
	const userId = insertUser(handle);
	const service = new SessionService(handle, recordAuditEvent, clock);
	return { handle, clock, userId, service };
}

describe('session lifecycle', () => {
	it('stores only a SHA-256 hash of a cryptographically random token', () => {
		const { handle, userId, service } = setup();
		const created = service.create(userId);
		const row = handle.sqlite.prepare('SELECT * FROM sessions').get() as { id_hash: string };
		expect(Buffer.from(created.rawToken, 'base64url')).toHaveLength(SESSION_TOKEN_BYTES);
		expect(row.id_hash).toBe(hashSessionToken(created.rawToken));
		expect(JSON.stringify(row)).not.toContain(created.rawToken);
	});

	it('enforces idle expiry exactly at 30 minutes', () => {
		const { clock, userId, service } = setup();
		const session = service.create(userId);
		clock.advance(SESSION_IDLE_LIMIT_MS - 1);
		expect(service.resolve(session.rawToken).ok).toBe(true);

		const second = service.create(userId);
		clock.advance(SESSION_IDLE_LIMIT_MS);
		expect(service.resolve(second.rawToken)).toEqual({ ok: false, error: 'unauthenticated' });
	});

	it('updates last seen without extending the 12-hour absolute expiry', () => {
		const { clock, userId, service } = setup();
		const session = service.create(userId);
		for (
			let elapsed = 0;
			elapsed < SESSION_ABSOLUTE_LIMIT_MS;
			elapsed += SESSION_IDLE_LIMIT_MS - 1
		) {
			clock.advance(Math.min(SESSION_IDLE_LIMIT_MS - 1, SESSION_ABSOLUTE_LIMIT_MS - elapsed - 1));
			expect(service.resolve(session.rawToken).ok).toBe(true);
		}
		clock.current = new Date(session.expiresAt);
		expect(service.resolve(session.rawToken)).toEqual({ ok: false, error: 'unauthenticated' });
	});

	it('rotates atomically, revokes the old token, and supports concurrent sessions', () => {
		const { handle, userId, service } = setup();
		const first = service.create(userId);
		const concurrent = service.create(userId);
		const rotated = service.rotate(first.rawToken);
		expect(rotated).not.toBeNull();
		expect(service.resolve(first.rawToken).ok).toBe(false);
		expect(service.resolve(rotated!.rawToken).ok).toBe(true);
		expect(service.resolve(concurrent.rawToken).ok).toBe(true);
		expect(
			handle.sqlite
				.prepare('SELECT revocation_reason FROM sessions WHERE id_hash = ?')
				.pluck()
				.get(first.tokenHash)
		).toBe('rotation');
	});

	it('does not rotate an expired session into a new active session', () => {
		const { handle, clock, userId, service } = setup();
		const expired = service.create(userId);
		clock.advance(SESSION_IDLE_LIMIT_MS);
		expect(service.rotate(expired.rawToken)).toBeNull();
		expect(handle.sqlite.prepare('SELECT count(*) FROM sessions').pluck().get()).toBe(1);
	});

	it('revokes one token or every active token idempotently', () => {
		const { handle, userId, service } = setup();
		const first = service.create(userId);
		const second = service.create(userId);
		service.revoke(first.rawToken, 'logout');
		service.revoke(first.rawToken, 'logout');
		const count = handle.transaction((tx) =>
			service.revokeAllForUser(userId, 'account_deactivated', tx)
		);
		expect(count).toBe(1);
		expect(service.resolve(first.rawToken).ok).toBe(false);
		expect(service.resolve(second.rawToken).ok).toBe(false);
	});
});
