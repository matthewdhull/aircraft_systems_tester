import { afterEach, describe, expect, it } from 'vitest';

import {
	PASSWORD_ACTION_LIFETIME_MS,
	PasswordActionService,
	SessionService,
	verifyPassword
} from '../../../src/lib/server/auth/index.js';
import type { DatabaseHandle } from '../../../src/lib/server/db/index.js';
import {
	insertUser,
	MutableClock,
	openTestDatabase,
	recordAuditEvent,
	syntheticPassword
} from '../core/helpers.js';

let handle: DatabaseHandle | undefined;
afterEach(() => handle?.close());

describe('password initialization and reset tokens', () => {
	it('stores only a token hash, consumes once, activates pending users, and revokes sessions', () => {
		handle = openTestDatabase();
		const clock = new MutableClock();
		const actorId = insertUser(handle);
		const userId = insertUser(handle);
		const sessions = new SessionService(handle, recordAuditEvent, clock);
		const existing = sessions.create(userId);
		handle.sqlite.prepare("UPDATE users SET status = 'pending' WHERE id = ?").run(userId);
		const service = new PasswordActionService(handle, sessions, recordAuditEvent, clock);
		const issued = service.issue(userId, 'initialize', actorId);
		expect(issued.ok).toBe(true);
		if (!issued.ok) return;
		const stored = handle.sqlite.prepare('SELECT * FROM password_action_tokens').get();
		expect(JSON.stringify(stored)).not.toContain(issued.rawToken);
		const newPassword = syntheticPassword();
		expect(service.consume(issued.rawToken, newPassword)).toEqual({ ok: true });
		expect(service.consume(issued.rawToken, syntheticPassword())).toMatchObject({
			ok: false,
			error: 'not_found'
		});
		const user = handle.sqlite
			.prepare('SELECT status, password_hash FROM users WHERE id = ?')
			.get(userId) as {
			status: string;
			password_hash: string;
		};
		expect(user.status).toBe('active');
		expect(verifyPassword(newPassword, user.password_hash)).toBe(true);
		expect(sessions.resolve(existing.rawToken).ok).toBe(false);
	});

	it('expires deterministically and supersedes earlier outstanding tokens', () => {
		handle = openTestDatabase();
		const clock = new MutableClock();
		const actorId = insertUser(handle);
		const userId = insertUser(handle);
		const sessions = new SessionService(handle, recordAuditEvent, clock);
		const service = new PasswordActionService(handle, sessions, recordAuditEvent, clock);
		const first = service.issue(userId, 'reset', actorId);
		const second = service.issue(userId, 'reset', actorId);
		if (!first.ok || !second.ok) throw new Error('Synthetic token issue failed.');
		expect(service.consume(first.rawToken, syntheticPassword())).toMatchObject({
			ok: false,
			error: 'not_found'
		});
		clock.advance(PASSWORD_ACTION_LIFETIME_MS);
		expect(service.consume(second.rawToken, syntheticPassword())).toMatchObject({
			ok: false,
			error: 'not_found'
		});
	});
});
