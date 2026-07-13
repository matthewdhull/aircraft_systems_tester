import { createHash, randomBytes } from 'node:crypto';

import type { DatabaseHandle } from '$lib/server/db';

import { hashPassword, validatePassword } from './password.js';
import { SessionService } from './session.js';
import { systemClock, type AuditRecorder, type Clock } from './types.js';

export const PASSWORD_ACTION_TOKEN_BYTES = 32;
export const PASSWORD_ACTION_LIFETIME_MS = 60 * 60 * 1_000;

export type PasswordActionPurpose = 'initialize' | 'reset';

export type PasswordActionResult =
	| { ok: true }
	| { ok: false; error: 'invalid_input' | 'not_found' | 'unavailable'; message?: string };

function hashActionToken(token: string): string {
	return createHash('sha256').update(token, 'utf8').digest('hex');
}

export class PasswordActionService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly sessions: SessionService,
		private readonly audit: AuditRecorder,
		private readonly clock: Clock = systemClock
	) {}

	issue(
		userId: string,
		purpose: PasswordActionPurpose,
		createdByUserId: string
	): { ok: true; rawToken: string; expiresAt: Date } | { ok: false; error: 'not_found' } {
		return this.database.transaction((tx) => {
			const user = tx.$client
				.prepare('SELECT id FROM users WHERE id = ? AND status <> ?')
				.get(userId, 'retired');
			if (!user) return { ok: false, error: 'not_found' } as const;
			const now = this.clock.now();
			const expiresAt = new Date(now.getTime() + PASSWORD_ACTION_LIFETIME_MS);
			const rawToken = randomBytes(PASSWORD_ACTION_TOKEN_BYTES).toString('base64url');
			const idHash = hashActionToken(rawToken);
			tx.$client
				.prepare(
					`UPDATE password_action_tokens SET revoked_at = ?
					 WHERE user_id = ? AND purpose = ? AND used_at IS NULL AND revoked_at IS NULL`
				)
				.run(now.toISOString(), userId, purpose);
			tx.$client
				.prepare(
					`INSERT INTO password_action_tokens
					 (id_hash, user_id, purpose, created_at, expires_at, created_by_user_id)
					 VALUES (?, ?, ?, ?, ?, ?)`
				)
				.run(idHash, userId, purpose, now.toISOString(), expiresAt.toISOString(), createdByUserId);
			this.audit(tx, {
				actorUserId: createdByUserId,
				action:
					purpose === 'initialize' ? 'password.initialization.issued' : 'password.reset.issued',
				entityType: 'user',
				entityId: userId,
				occurredAt: now,
				before: null,
				after: null
			});
			return { ok: true, rawToken, expiresAt } as const;
		});
	}

	consume(rawToken: string, password: string): PasswordActionResult {
		const validation = validatePassword(password);
		if (!validation.ok) return validation;
		if (rawToken.length < 32 || rawToken.length > 256) return { ok: false, error: 'not_found' };
		const idHash = hashActionToken(rawToken);
		return this.database.transaction((tx) => {
			const row = tx.$client
				.prepare(
					`SELECT user_id, purpose, expires_at FROM password_action_tokens
					 WHERE id_hash = ? AND used_at IS NULL AND revoked_at IS NULL`
				)
				.get(idHash) as
				{ user_id: string; purpose: PasswordActionPurpose; expires_at: string } | undefined;
			const now = this.clock.now();
			if (!row || now >= new Date(row.expires_at))
				return { ok: false, error: 'not_found' } as const;
			tx.$client
				.prepare(
					`UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ?,
					 status = CASE WHEN status = 'pending' THEN 'active' ELSE status END WHERE id = ?`
				)
				.run(hashPassword(password), now.toISOString(), now.toISOString(), row.user_id);
			tx.$client
				.prepare('UPDATE password_action_tokens SET used_at = ?, revoked_at = ? WHERE id_hash = ?')
				.run(now.toISOString(), now.toISOString(), idHash);
			this.sessions.revokeAllForUser(row.user_id, 'password_changed', tx);
			this.audit(tx, {
				actorUserId: row.user_id,
				action: row.purpose === 'initialize' ? 'password.initialized' : 'password.reset',
				entityType: 'user',
				entityId: row.user_id,
				occurredAt: now,
				before: null,
				after: null
			});
			return { ok: true } as const;
		});
	}
}
