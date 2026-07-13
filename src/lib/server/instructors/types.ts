import type { FoundationDatabase } from '$lib/server/db/database.js';

export const USER_STATUSES = ['pending', 'active', 'suspended', 'retired'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface InstructorSummary {
	id: string;
	employeeNumber: string;
	firstName: string;
	lastName: string;
	status: UserStatus;
	createdAt: string;
	updatedAt: string;
	retiredAt: string | null;
	roles: readonly RoleSummary[];
}

export interface RoleSummary {
	id: string;
	code: string;
	displayName: string;
}

export interface EmployeeNumberHistoryEntry {
	id: string;
	previousValue: string;
	replacementValue: string;
	changedByUserId: string;
	changedAt: string;
	reason: string;
}

export interface InstructorDetail extends InstructorSummary {
	employeeNumberHistory: readonly EmployeeNumberHistoryEntry[];
}

export interface FieldError {
	field: string;
	message: string;
}

export type MutationErrorCode =
	'invalid_input' | 'conflict' | 'final_active_administrator' | 'not_found' | 'unavailable';

export type MutationResult<T> =
	{ ok: true; value: T } | { ok: false; error: MutationErrorCode; fields?: readonly FieldError[] };

export interface Clock {
	now(): Date;
}

export interface AuditEventInput {
	actorUserId: string;
	action: string;
	entityType: string;
	entityId: string;
	occurredAt: Date;
	before: Readonly<
		Record<string, string | number | boolean | null | readonly (string | number | boolean | null)[]>
	> | null;
	after: Readonly<
		Record<string, string | number | boolean | null | readonly (string | number | boolean | null)[]>
	> | null;
}

export interface InstructorServiceDependencies {
	clock: Clock;
	recordAuditEvent(tx: FoundationDatabase, event: AuditEventInput): void;
	revokeAllForUser(userId: string, reason: 'account_deactivated', tx: FoundationDatabase): void;
	isEffectiveActiveAdministrator(tx: FoundationDatabase, userId: string): boolean;
	countEffectiveActiveAdministrators(tx: FoundationDatabase): number;
	isAdministratorRole(tx: FoundationDatabase, roleId: string): boolean;
	createId(): string;
}
