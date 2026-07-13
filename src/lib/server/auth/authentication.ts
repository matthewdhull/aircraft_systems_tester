import type { DatabaseHandle } from '$lib/server/db';

import { hashPassword, passwordNeedsRehash, verifyPassword } from './password.js';
import { SessionService, type CreatedSession } from './session.js';
import {
	systemClock,
	type AuditRecorder,
	type AuthenticationFailure,
	type Clock,
	type LoginRateLimit
} from './types.js';

export interface AuthenticatedLogin {
	ok: true;
	value: {
		userId: string;
		employeeNumber: string;
		displayName: string;
		session: CreatedSession;
	};
}

export type LoginResult = AuthenticatedLogin | AuthenticationFailure;

interface UserCredentialRow {
	id: string;
	employee_number: string;
	first_name: string;
	last_name: string;
	password_hash: string | null;
	status: string;
}

export class AuthenticationService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly sessions: SessionService,
		private readonly audit: AuditRecorder,
		private readonly rateLimit: LoginRateLimit,
		private readonly dummyPasswordHash: string,
		private readonly clock: Clock = systemClock
	) {}

	login(
		employeeNumberInput: string,
		password: string,
		context: { networkKey: string; existingSessionToken?: string }
	): LoginResult {
		const employeeNumber = employeeNumberInput.trim();
		const now = this.clock.now();
		const limit = this.rateLimit.consume({
			networkKey: context.networkKey,
			accountKey: employeeNumber || '(blank)'
		});
		if (!limit.allowed) {
			return { ok: false, error: 'rate_limited', retryAfterSeconds: limit.retryAfterSeconds };
		}

		const row = this.database.sqlite
			.prepare(
				`SELECT id, employee_number, first_name, last_name, password_hash, status
				 FROM users WHERE employee_number = ?`
			)
			.get(employeeNumber) as UserCredentialRow | undefined;
		const candidateHash = row?.password_hash ?? this.dummyPasswordHash;
		const passwordMatches = verifyPassword(password, candidateHash);
		if (!row || row.status !== 'active' || row.password_hash === null || !passwordMatches) {
			return { ok: false, error: 'authentication_failed' };
		}

		const session = this.database.transaction((tx) => {
			if (context.existingSessionToken) {
				this.sessions.revokeInTransaction(context.existingSessionToken, 'rotation', tx);
			}
			if (passwordNeedsRehash(row.password_hash!)) {
				tx.$client
					.prepare(
						'UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?'
					)
					.run(hashPassword(password), now.toISOString(), now.toISOString(), row.id);
			}
			const created = this.sessions.createInTransaction(tx, row.id);
			this.audit(tx, {
				actorUserId: row.id,
				action: 'authentication.login.succeeded',
				entityType: 'user',
				entityId: row.id,
				occurredAt: now,
				before: null,
				after: null
			});
			return created;
		});
		return {
			ok: true,
			value: {
				userId: row.id,
				employeeNumber: row.employee_number,
				displayName: `${row.first_name} ${row.last_name}`.trim(),
				session
			}
		};
	}
}
