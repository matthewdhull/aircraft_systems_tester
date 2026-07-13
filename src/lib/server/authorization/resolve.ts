import type { FoundationDatabase } from '$lib/server/db';

import { BASELINE_ROLES, type PermissionCode } from './policy.js';
import type { AuthenticatedPrincipal } from './types.js';

interface UserRow {
	id: string;
	employee_number: string;
	first_name: string;
	last_name: string;
	status: string;
}

export function resolveEffectivePrincipal(
	db: FoundationDatabase,
	userId: string,
	sessionIdHash: string
): AuthenticatedPrincipal | null {
	const user = db.$client
		.prepare('SELECT id, employee_number, first_name, last_name, status FROM users WHERE id = ?')
		.get(userId) as UserRow | undefined;
	if (user?.status !== 'active') return null;

	const roles = db.$client
		.prepare(
			`SELECT DISTINCT r.code
			 FROM user_roles ur
			 JOIN roles r ON r.id = ur.role_id
			 WHERE ur.user_id = ? AND ur.revoked_at IS NULL
			 ORDER BY r.code`
		)
		.pluck()
		.all(userId) as string[];
	const permissions = db.$client
		.prepare(
			`SELECT DISTINCT p.code
			 FROM user_roles ur
			 JOIN role_permissions rp ON rp.role_id = ur.role_id
			 JOIN permissions p ON p.id = rp.permission_id
			 WHERE ur.user_id = ? AND ur.revoked_at IS NULL
			 ORDER BY p.code`
		)
		.pluck()
		.all(userId) as PermissionCode[];

	return Object.freeze({
		userId: user.id,
		employeeNumber: user.employee_number,
		displayName: `${user.first_name} ${user.last_name}`,
		roles: Object.freeze(roles),
		permissions: new Set(permissions),
		sessionIdHash
	});
}

export function hasEffectivePermission(
	db: FoundationDatabase,
	userId: string,
	permission: PermissionCode
): boolean {
	return (
		Number(
			db.$client
				.prepare(
					`SELECT EXISTS(
						SELECT 1 FROM users u
						JOIN user_roles ur ON ur.user_id = u.id AND ur.revoked_at IS NULL
						JOIN role_permissions rp ON rp.role_id = ur.role_id
						JOIN permissions p ON p.id = rp.permission_id
						WHERE u.id = ? AND u.status = 'active' AND p.code = ?
					)`
				)
				.pluck()
				.get(userId, permission)
		) === 1
	);
}

export function hasEffectiveAdministratorCapability(
	db: FoundationDatabase,
	userId: string
): boolean {
	return (
		Number(
			db.$client
				.prepare(
					`SELECT EXISTS(
						SELECT 1 FROM users u
						JOIN user_roles ur ON ur.user_id = u.id AND ur.revoked_at IS NULL
						JOIN roles r ON r.id = ur.role_id
						WHERE u.id = ? AND u.status = 'active' AND r.code = ?
					)`
				)
				.pluck()
				.get(userId, BASELINE_ROLES.ADMINISTRATOR)
		) === 1
	);
}

export function isAdministratorRole(db: FoundationDatabase, roleId: string): boolean {
	return (
		Number(
			db.$client
				.prepare('SELECT EXISTS(SELECT 1 FROM roles WHERE id = ? AND code = ?)')
				.pluck()
				.get(roleId, BASELINE_ROLES.ADMINISTRATOR)
		) === 1
	);
}

export function countEffectiveActiveAdministrators(db: FoundationDatabase): number {
	return Number(
		db.$client
			.prepare(
				`SELECT count(DISTINCT u.id)
				 FROM users u
				 JOIN user_roles ur ON ur.user_id = u.id AND ur.revoked_at IS NULL
				 JOIN roles r ON r.id = ur.role_id
				 WHERE u.status = 'active' AND r.code = ?`
			)
			.pluck()
			.get(BASELINE_ROLES.ADMINISTRATOR)
	);
}
