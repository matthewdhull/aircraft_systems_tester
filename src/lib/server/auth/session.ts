import { createHash, randomBytes } from 'node:crypto';

import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db';

import { systemClock, type AuditRecorder, type Clock } from './types.js';

export const SESSION_IDLE_LIMIT_MS = 30 * 60 * 1_000;
export const SESSION_ABSOLUTE_LIMIT_MS = 12 * 60 * 60 * 1_000;
export const SESSION_TOKEN_BYTES = 32;

export type SessionRevocationReason =
	| 'logout'
	| 'rotation'
	| 'account_deactivated'
	| 'password_changed'
	| 'administrator_revocation'
	| 'expired';

export interface CreatedSession {
	rawToken: string;
	tokenHash: string;
	createdAt: Date;
	expiresAt: Date;
}

export type ResolvedSession =
	| {
			ok: true;
			value: {
				userId: string;
				employeeNumber: string;
				firstName: string;
				lastName: string;
				sessionIdHash: string;
				expiresAt: Date;
			};
	  }
	| { ok: false; error: 'unauthenticated' };

export function hashSessionToken(rawToken: string): string {
	return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

export class SessionService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly audit: AuditRecorder,
		private readonly clock: Clock = systemClock
	) {}

	create(userId: string): CreatedSession {
		return this.database.transaction((tx) => this.createInTransaction(tx, userId));
	}

	createInTransaction(
		tx: FoundationDatabase,
		userId: string,
		rotatedFromHash: string | null = null
	): CreatedSession {
		const now = this.clock.now();
		const active = Number(
			tx.$client
				.prepare("SELECT EXISTS(SELECT 1 FROM users WHERE id = ? AND status = 'active')")
				.pluck()
				.get(userId)
		);
		if (active !== 1) throw new Error('Session could not be created.');
		const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_LIMIT_MS);
		const rawToken = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
		const tokenHash = hashSessionToken(rawToken);
		tx.$client
			.prepare(
				`INSERT INTO sessions
				 (id_hash, user_id, created_at, last_seen_at, expires_at, rotated_from_hash)
				 VALUES (?, ?, ?, ?, ?, ?)`
			)
			.run(
				tokenHash,
				userId,
				now.toISOString(),
				now.toISOString(),
				expiresAt.toISOString(),
				rotatedFromHash
			);
		this.audit(tx, {
			actorUserId: userId,
			action: 'session.created',
			entityType: 'user',
			entityId: userId,
			occurredAt: now,
			before: null,
			after: null
		});
		return { rawToken, tokenHash, createdAt: now, expiresAt };
	}

	resolve(rawToken: string): ResolvedSession {
		if (rawToken.length < 32 || rawToken.length > 256)
			return { ok: false, error: 'unauthenticated' };
		const tokenHash = hashSessionToken(rawToken);
		return this.database.transaction((tx) => {
			const row = tx.$client
				.prepare(
					`SELECT s.user_id, s.created_at, s.last_seen_at, s.expires_at, s.revoked_at,
					        u.employee_number, u.first_name, u.last_name, u.status
					 FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id_hash = ?`
				)
				.get(tokenHash) as
				| {
						user_id: string;
						created_at: string;
						last_seen_at: string;
						expires_at: string;
						revoked_at: string | null;
						employee_number: string;
						first_name: string;
						last_name: string;
						status: string;
				  }
				| undefined;
			if (!row || row.revoked_at !== null || row.status !== 'active') {
				return { ok: false, error: 'unauthenticated' } as const;
			}
			const now = this.clock.now();
			const absoluteExpiry = new Date(row.expires_at);
			const idleExpiry = new Date(new Date(row.last_seen_at).getTime() + SESSION_IDLE_LIMIT_MS);
			if (now >= absoluteExpiry || now >= idleExpiry) {
				this.revokeHashInTransaction(tx, tokenHash, row.user_id, 'expired', now);
				return { ok: false, error: 'unauthenticated' } as const;
			}
			tx.$client
				.prepare('UPDATE sessions SET last_seen_at = ? WHERE id_hash = ?')
				.run(now.toISOString(), tokenHash);
			return {
				ok: true,
				value: {
					userId: row.user_id,
					employeeNumber: row.employee_number,
					firstName: row.first_name,
					lastName: row.last_name,
					sessionIdHash: tokenHash,
					expiresAt: absoluteExpiry
				}
			} as const;
		});
	}

	rotate(rawToken: string): CreatedSession | null {
		const tokenHash = hashSessionToken(rawToken);
		return this.database.transaction((tx) => {
			const row = tx.$client
				.prepare(
					`SELECT s.user_id, s.last_seen_at, s.expires_at, u.status
					 FROM sessions s JOIN users u ON u.id = s.user_id
					 WHERE s.id_hash = ? AND s.revoked_at IS NULL`
				)
				.get(tokenHash) as
				{ user_id: string; last_seen_at: string; expires_at: string; status: string } | undefined;
			if (!row || row.status !== 'active') return null;
			const now = this.clock.now();
			if (
				now >= new Date(row.expires_at) ||
				now.getTime() >= new Date(row.last_seen_at).getTime() + SESSION_IDLE_LIMIT_MS
			) {
				this.revokeHashInTransaction(tx, tokenHash, row.user_id, 'expired', now);
				return null;
			}
			this.revokeHashInTransaction(tx, tokenHash, row.user_id, 'rotation', now);
			return this.createInTransaction(tx, row.user_id, tokenHash);
		});
	}

	revoke(rawToken: string, reason: SessionRevocationReason): void {
		const tokenHash = hashSessionToken(rawToken);
		this.database.transaction((tx) => {
			const row = tx.$client
				.prepare('SELECT user_id FROM sessions WHERE id_hash = ?')
				.get(tokenHash) as { user_id: string } | undefined;
			if (row) this.revokeHashInTransaction(tx, tokenHash, row.user_id, reason, this.clock.now());
		});
	}

	revokeInTransaction(
		rawToken: string,
		reason: SessionRevocationReason,
		tx: FoundationDatabase
	): void {
		const tokenHash = hashSessionToken(rawToken);
		const row = tx.$client
			.prepare('SELECT user_id FROM sessions WHERE id_hash = ?')
			.get(tokenHash) as { user_id: string } | undefined;
		if (row) this.revokeHashInTransaction(tx, tokenHash, row.user_id, reason, this.clock.now());
	}

	revokeAllForUser(
		userId: string,
		reason: SessionRevocationReason,
		tx: FoundationDatabase
	): number {
		const now = this.clock.now();
		const result = tx.$client
			.prepare(
				'UPDATE sessions SET revoked_at = ?, revocation_reason = ? WHERE user_id = ? AND revoked_at IS NULL'
			)
			.run(now.toISOString(), reason, userId);
		if (result.changes > 0) {
			this.audit(tx, {
				actorUserId: null,
				action: 'session.revoked',
				entityType: 'user',
				entityId: userId,
				occurredAt: now,
				before: null,
				after: { reason }
			});
		}
		return result.changes;
	}

	private revokeHashInTransaction(
		tx: FoundationDatabase,
		tokenHash: string,
		userId: string,
		reason: SessionRevocationReason,
		now: Date
	): void {
		const result = tx.$client
			.prepare(
				'UPDATE sessions SET revoked_at = ?, revocation_reason = ? WHERE id_hash = ? AND revoked_at IS NULL'
			)
			.run(now.toISOString(), reason, tokenHash);
		if (result.changes > 0) {
			this.audit(tx, {
				actorUserId: userId,
				action: 'session.revoked',
				entityType: 'user',
				entityId: userId,
				occurredAt: now,
				before: null,
				after: { reason }
			});
		}
	}
}
