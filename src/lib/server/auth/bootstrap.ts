import { randomUUID } from 'node:crypto';

import type { DatabaseHandle } from '$lib/server/db';

import { hashPassword, validatePassword } from './password.js';
import { systemClock, type AuditRecorder, type Clock } from './types.js';

export interface BootstrapAdministratorInput {
	employeeNumber: string;
	firstName: string;
	lastName: string;
	password: string;
}

export type BootstrapResult =
	| { ok: true; userId: string }
	| { ok: false; error: 'invalid_input' | 'conflict' | 'unavailable'; message: string };

export function bootstrapFirstAdministrator(
	database: DatabaseHandle,
	input: BootstrapAdministratorInput,
	audit: AuditRecorder,
	clock: Clock = systemClock
): BootstrapResult {
	const employeeNumber = input.employeeNumber.trim();
	const firstName = input.firstName.trim();
	const lastName = input.lastName.trim();
	const passwordValidation = validatePassword(input.password);
	if (!employeeNumber || !firstName || !lastName || !passwordValidation.ok) {
		return {
			ok: false,
			error: 'invalid_input',
			message: passwordValidation.ok
				? 'All identity fields are required.'
				: passwordValidation.message
		};
	}

	try {
		return database.transaction((tx) => {
			const userCount = Number(tx.$client.prepare('SELECT count(*) FROM users').pluck().get());
			const grantCount = Number(
				tx.$client.prepare('SELECT count(*) FROM user_roles WHERE revoked_at IS NULL').pluck().get()
			);
			if (userCount !== 0 || grantCount !== 0) {
				return {
					ok: false,
					error: 'conflict',
					message: 'Bootstrap is only allowed for an empty identity store.'
				} as const;
			}
			const administratorRole = tx.$client
				.prepare("SELECT id FROM roles WHERE code = 'administrator'")
				.get() as { id: string } | undefined;
			if (!administratorRole) {
				return {
					ok: false,
					error: 'unavailable',
					message: 'Authorization roles must be seeded before bootstrap.'
				} as const;
			}
			const now = clock.now();
			const userId = randomUUID();
			tx.$client
				.prepare(
					`INSERT INTO users
					 (id, employee_number, first_name, last_name, password_hash, status, created_at, updated_at, password_changed_at)
					 VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`
				)
				.run(
					userId,
					employeeNumber,
					firstName,
					lastName,
					hashPassword(input.password),
					now.toISOString(),
					now.toISOString(),
					now.toISOString()
				);
			tx.$client
				.prepare(
					'INSERT INTO user_roles (user_id, role_id, granted_by_user_id, granted_at) VALUES (?, ?, ?, ?)'
				)
				.run(userId, administratorRole.id, userId, now.toISOString());
			audit(tx, {
				actorUserId: userId,
				action: 'bootstrap.administrator.created',
				entityType: 'user',
				entityId: userId,
				occurredAt: now,
				before: null,
				after: { employeeNumber, status: 'active', roles: ['administrator'] }
			});
			return { ok: true, userId } as const;
		});
	} catch {
		return { ok: false, error: 'unavailable', message: 'Bootstrap could not be completed.' };
	}
}
