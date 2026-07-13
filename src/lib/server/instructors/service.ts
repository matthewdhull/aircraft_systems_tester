import { randomUUID } from 'node:crypto';

import { and, eq, isNull } from 'drizzle-orm';

import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import { employeeIdentifierHistory, userRoles, users } from '$lib/server/db/schema/core.js';
import { SECURITY_EVENT } from '$lib/server/security/index.js';
import {
	activeRoleGrant,
	findByEmployeeNumber,
	findInstructor,
	findRole,
	hasActiveRole,
	listInstructors,
	listRoles
} from './repository.js';
import type {
	FieldError,
	InstructorDetail,
	InstructorServiceDependencies,
	InstructorSummary,
	MutationResult,
	RoleSummary
} from './types.js';
import {
	validateEmployeeNumber,
	validateId,
	validateName,
	validateReason,
	validateStatus
} from './validation.js';

export interface CreateInstructorInput {
	employeeNumber: unknown;
	firstName: unknown;
	lastName: unknown;
}

export interface EditInstructorInput {
	firstName: unknown;
	lastName: unknown;
}

export interface CorrectEmployeeNumberInput {
	employeeNumber: unknown;
	reason: unknown;
}

export interface ChangeStatusInput {
	status: unknown;
}

export interface RoleChangeInput {
	roleId: unknown;
}

function iso(date: Date): string {
	return date.toISOString();
}

function invalid(fields: Array<FieldError | undefined>): MutationResult<never> | null {
	const errors = fields.filter((field): field is FieldError => Boolean(field));
	return errors.length > 0 ? { ok: false, error: 'invalid_input', fields: errors } : null;
}

function safeUser(user: InstructorSummary) {
	return {
		employeeNumber: user.employeeNumber,
		firstName: user.firstName,
		lastName: user.lastName,
		status: user.status,
		roles: user.roles.map((role) => role.code)
	};
}

function storageFailure<T>(): MutationResult<T> {
	return { ok: false, error: 'unavailable' };
}

export class InstructorAdministrationService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: InstructorServiceDependencies
	) {}

	list(): readonly InstructorSummary[] {
		return listInstructors(this.database.db);
	}

	get(userId: string): InstructorDetail | null {
		return findInstructor(this.database.db, userId);
	}

	availableRoles(): readonly RoleSummary[] {
		return listRoles(this.database.db);
	}

	create(actorUserId: string, input: CreateInstructorInput): MutationResult<InstructorDetail> {
		const employeeNumber = validateEmployeeNumber(input.employeeNumber);
		const firstName = validateName('firstName', input.firstName);
		const lastName = validateName('lastName', input.lastName);
		const validation = invalid([employeeNumber.error, firstName.error, lastName.error]);
		if (validation) return validation;

		try {
			return this.database.transaction((tx) => {
				if (findByEmployeeNumber(tx, employeeNumber.value)) {
					return { ok: false, error: 'conflict' };
				}
				const id = this.dependencies.createId();
				const occurredAt = this.dependencies.clock.now();
				const timestamp = iso(occurredAt);
				tx.insert(users)
					.values({
						id,
						employeeNumber: employeeNumber.value,
						firstName: firstName.value,
						lastName: lastName.value,
						status: 'pending',
						createdAt: timestamp,
						updatedAt: timestamp
					})
					.run();
				const created = findInstructor(tx, id)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action: SECURITY_EVENT.USER_CREATED,
					entityType: 'user',
					entityId: id,
					occurredAt,
					before: null,
					after: safeUser(created)
				});
				return { ok: true, value: created };
			});
		} catch {
			return storageFailure();
		}
	}

	edit(
		actorUserId: string,
		userId: string,
		input: EditInstructorInput
	): MutationResult<InstructorDetail> {
		const firstName = validateName('firstName', input.firstName);
		const lastName = validateName('lastName', input.lastName);
		const validation = invalid([firstName.error, lastName.error]);
		if (validation) return validation;

		return this.mutateUser(
			actorUserId,
			userId,
			SECURITY_EVENT.USER_UPDATED,
			(tx, before, occurredAt) => {
				tx.update(users)
					.set({ firstName: firstName.value, lastName: lastName.value, updatedAt: iso(occurredAt) })
					.where(eq(users.id, userId))
					.run();
				return before;
			}
		);
	}

	correctEmployeeNumber(
		actorUserId: string,
		userId: string,
		input: CorrectEmployeeNumberInput
	): MutationResult<InstructorDetail> {
		const employeeNumber = validateEmployeeNumber(input.employeeNumber);
		const reason = validateReason(input.reason);
		const validation = invalid([employeeNumber.error, reason.error]);
		if (validation) return validation;

		try {
			return this.database.transaction((tx) => {
				const before = findInstructor(tx, userId);
				if (!before) return { ok: false, error: 'not_found' };
				if (before.employeeNumber === employeeNumber.value) {
					return {
						ok: false,
						error: 'invalid_input',
						fields: [{ field: 'employeeNumber', message: 'Enter a different employee number.' }]
					};
				}
				if (findByEmployeeNumber(tx, employeeNumber.value)) {
					return { ok: false, error: 'conflict' };
				}
				const occurredAt = this.dependencies.clock.now();
				const timestamp = iso(occurredAt);
				tx.update(users)
					.set({ employeeNumber: employeeNumber.value, updatedAt: timestamp })
					.where(eq(users.id, userId))
					.run();
				tx.insert(employeeIdentifierHistory)
					.values({
						id: this.dependencies.createId(),
						userId,
						previousValue: before.employeeNumber,
						replacementValue: employeeNumber.value,
						changedByUserId: actorUserId,
						changedAt: timestamp,
						reason: reason.value
					})
					.run();
				const after = findInstructor(tx, userId)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action: SECURITY_EVENT.EMPLOYEE_NUMBER_CHANGED,
					entityType: 'user',
					entityId: userId,
					occurredAt,
					before: { employeeNumber: before.employeeNumber },
					after: { employeeNumber: after.employeeNumber, reason: reason.value }
				});
				return { ok: true, value: after };
			});
		} catch {
			return storageFailure();
		}
	}

	changeStatus(
		actorUserId: string,
		userId: string,
		input: ChangeStatusInput
	): MutationResult<InstructorDetail> {
		const status = validateStatus(input.status);
		const validation = invalid([status.error]);
		if (validation || !status.value) return validation ?? storageFailure();
		const targetStatus = status.value;

		try {
			return this.database.transaction((tx) => {
				const before = findInstructor(tx, userId);
				if (!before) return { ok: false, error: 'not_found' };
				if (before.status === targetStatus) return { ok: true, value: before };
				if (!isAllowedStatusTransition(before.status, targetStatus)) {
					return {
						ok: false,
						error: 'invalid_input',
						fields: [{ field: 'status', message: 'That account status change is not allowed.' }]
					};
				}
				if (
					before.status === 'active' &&
					targetStatus !== 'active' &&
					this.wouldRemoveFinalAdministrator(tx, userId)
				) {
					return { ok: false, error: 'final_active_administrator' };
				}
				const occurredAt = this.dependencies.clock.now();
				const timestamp = iso(occurredAt);
				tx.update(users)
					.set({
						status: targetStatus,
						updatedAt: timestamp,
						retiredAt: targetStatus === 'retired' ? timestamp : null
					})
					.where(eq(users.id, userId))
					.run();
				if (targetStatus === 'suspended' || targetStatus === 'retired') {
					this.dependencies.revokeAllForUser(userId, 'account_deactivated', tx);
				}
				const after = findInstructor(tx, userId)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action: SECURITY_EVENT.USER_STATUS_CHANGED,
					entityType: 'user',
					entityId: userId,
					occurredAt,
					before: { status: before.status },
					after: { status: after.status }
				});
				return { ok: true, value: after };
			});
		} catch {
			return storageFailure();
		}
	}

	grantRole(
		actorUserId: string,
		userId: string,
		input: RoleChangeInput
	): MutationResult<InstructorDetail> {
		const roleId = validateId('roleId', input.roleId);
		const validation = invalid([roleId.error]);
		if (validation) return validation;
		try {
			return this.database.transaction((tx) => {
				const before = findInstructor(tx, userId);
				const role = findRole(tx, roleId.value);
				if (!before || !role) return { ok: false, error: 'not_found' };
				if (hasActiveRole(tx, userId, role.id)) return { ok: true, value: before };
				const occurredAt = this.dependencies.clock.now();
				tx.insert(userRoles)
					.values({
						userId,
						roleId: role.id,
						grantedByUserId: actorUserId,
						grantedAt: iso(occurredAt)
					})
					.run();
				const after = findInstructor(tx, userId)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action: SECURITY_EVENT.ROLE_GRANTED,
					entityType: 'user',
					entityId: userId,
					occurredAt,
					before: { roles: before.roles.map((item) => item.code) },
					after: { roles: after.roles.map((item) => item.code), roleCode: role.code }
				});
				return { ok: true, value: after };
			});
		} catch {
			return storageFailure();
		}
	}

	revokeRole(
		actorUserId: string,
		userId: string,
		input: RoleChangeInput
	): MutationResult<InstructorDetail> {
		const roleId = validateId('roleId', input.roleId);
		const validation = invalid([roleId.error]);
		if (validation) return validation;
		try {
			return this.database.transaction((tx) => {
				const before = findInstructor(tx, userId);
				const role = findRole(tx, roleId.value);
				if (!before || !role) return { ok: false, error: 'not_found' };
				const grant = activeRoleGrant(tx, userId, role.id);
				if (!grant) return { ok: true, value: before };
				if (
					this.dependencies.isAdministratorRole(tx, role.id) &&
					this.wouldRemoveFinalAdministrator(tx, userId)
				) {
					return { ok: false, error: 'final_active_administrator' };
				}
				const occurredAt = this.dependencies.clock.now();
				tx.update(userRoles)
					.set({ revokedAt: iso(occurredAt) })
					.where(
						and(
							eq(userRoles.userId, userId),
							eq(userRoles.roleId, role.id),
							eq(userRoles.grantedAt, grant.grantedAt),
							isNull(userRoles.revokedAt)
						)
					)
					.run();
				const after = findInstructor(tx, userId)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action: SECURITY_EVENT.ROLE_REVOKED,
					entityType: 'user',
					entityId: userId,
					occurredAt,
					before: { roles: before.roles.map((item) => item.code) },
					after: { roles: after.roles.map((item) => item.code), roleCode: role.code }
				});
				return { ok: true, value: after };
			});
		} catch {
			return storageFailure();
		}
	}

	private wouldRemoveFinalAdministrator(tx: FoundationDatabase, userId: string): boolean {
		return (
			this.dependencies.isEffectiveActiveAdministrator(tx, userId) &&
			this.dependencies.countEffectiveActiveAdministrators(tx) <= 1
		);
	}

	private mutateUser(
		actorUserId: string,
		userId: string,
		action: string,
		mutate: (tx: FoundationDatabase, before: InstructorDetail, at: Date) => unknown
	): MutationResult<InstructorDetail> {
		try {
			return this.database.transaction((tx) => {
				const before = findInstructor(tx, userId);
				if (!before) return { ok: false, error: 'not_found' };
				const occurredAt = this.dependencies.clock.now();
				mutate(tx, before, occurredAt);
				const after = findInstructor(tx, userId)!;
				this.dependencies.recordAuditEvent(tx, {
					actorUserId,
					action,
					entityType: 'user',
					entityId: userId,
					occurredAt,
					before: safeUser(before),
					after: safeUser(after)
				});
				return { ok: true, value: after };
			});
		} catch {
			return storageFailure();
		}
	}
}

function isAllowedStatusTransition(current: string, next: string): boolean {
	if (current === 'retired') return false;
	if (next === 'pending') return false;
	return next === 'active' || next === 'suspended' || next === 'retired';
}

export function defaultInstructorServiceDependencies(
	overrides: Omit<InstructorServiceDependencies, 'clock' | 'createId'> &
		Partial<Pick<InstructorServiceDependencies, 'clock' | 'createId'>>
): InstructorServiceDependencies {
	return {
		clock: overrides.clock ?? { now: () => new Date() },
		createId: overrides.createId ?? randomUUID,
		recordAuditEvent: overrides.recordAuditEvent,
		revokeAllForUser: overrides.revokeAllForUser,
		isEffectiveActiveAdministrator: overrides.isEffectiveActiveAdministrator,
		countEffectiveActiveAdministrators: overrides.countEffectiveActiveAdministrators,
		isAdministratorRole: overrides.isAdministratorRole
	};
}
