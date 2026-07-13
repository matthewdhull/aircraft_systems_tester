import { and, asc, desc, eq, isNull } from 'drizzle-orm';

import type { FoundationDatabase } from '$lib/server/db/database.js';
import { employeeIdentifierHistory, roles, userRoles, users } from '$lib/server/db/schema/core.js';
import type {
	EmployeeNumberHistoryEntry,
	InstructorDetail,
	InstructorSummary,
	RoleSummary,
	UserStatus
} from './types.js';

function activeRoles(tx: FoundationDatabase, userId: string): RoleSummary[] {
	return tx
		.select({ id: roles.id, code: roles.code, displayName: roles.displayName })
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.where(and(eq(userRoles.userId, userId), isNull(userRoles.revokedAt)))
		.orderBy(asc(roles.displayName))
		.all();
}

function toSummary(tx: FoundationDatabase, row: typeof users.$inferSelect): InstructorSummary {
	return {
		id: row.id,
		employeeNumber: row.employeeNumber,
		firstName: row.firstName,
		lastName: row.lastName,
		status: row.status as UserStatus,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		retiredAt: row.retiredAt,
		roles: activeRoles(tx, row.id)
	};
}

export function listInstructors(tx: FoundationDatabase): InstructorSummary[] {
	return tx
		.select()
		.from(users)
		.orderBy(asc(users.lastName), asc(users.firstName), asc(users.employeeNumber))
		.all()
		.map((row) => toSummary(tx, row));
}

export function findInstructor(tx: FoundationDatabase, userId: string): InstructorDetail | null {
	const row = tx.select().from(users).where(eq(users.id, userId)).get();
	if (!row) return null;
	const history: EmployeeNumberHistoryEntry[] = tx
		.select({
			id: employeeIdentifierHistory.id,
			previousValue: employeeIdentifierHistory.previousValue,
			replacementValue: employeeIdentifierHistory.replacementValue,
			changedByUserId: employeeIdentifierHistory.changedByUserId,
			changedAt: employeeIdentifierHistory.changedAt,
			reason: employeeIdentifierHistory.reason
		})
		.from(employeeIdentifierHistory)
		.where(eq(employeeIdentifierHistory.userId, userId))
		.orderBy(desc(employeeIdentifierHistory.changedAt))
		.all();
	return { ...toSummary(tx, row), employeeNumberHistory: history };
}

export function findByEmployeeNumber(tx: FoundationDatabase, employeeNumber: string) {
	return tx
		.select({ id: users.id })
		.from(users)
		.where(eq(users.employeeNumber, employeeNumber))
		.get();
}

export function listRoles(tx: FoundationDatabase): RoleSummary[] {
	return tx
		.select({ id: roles.id, code: roles.code, displayName: roles.displayName })
		.from(roles)
		.orderBy(asc(roles.displayName))
		.all();
}

export function findRole(tx: FoundationDatabase, roleId: string): RoleSummary | null {
	return (
		tx
			.select({ id: roles.id, code: roles.code, displayName: roles.displayName })
			.from(roles)
			.where(eq(roles.id, roleId))
			.get() ?? null
	);
}

export function hasActiveRole(tx: FoundationDatabase, userId: string, roleId: string): boolean {
	return Boolean(
		tx
			.select({ userId: userRoles.userId })
			.from(userRoles)
			.where(
				and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId), isNull(userRoles.revokedAt))
			)
			.get()
	);
}

export function activeRoleGrant(tx: FoundationDatabase, userId: string, roleId: string) {
	return tx
		.select()
		.from(userRoles)
		.where(
			and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId), isNull(userRoles.revokedAt))
		)
		.get();
}
