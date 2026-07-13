import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

export const foundationMetadata = sqliteTable('_foundation_metadata', {
	id: integer('id').primaryKey(),
	foundationVersion: text('foundation_version').notNull(),
	appliedAt: text('applied_at').notNull()
});

export const importRuns = sqliteTable(
	'import_runs',
	{
		id: text('id').primaryKey(),
		importerVersion: text('importer_version').notNull(),
		sourceChecksum: text('source_checksum').notNull(),
		sourceByteSize: integer('source_byte_size').notNull(),
		status: text('status').notNull().default('started'),
		startedAt: text('started_at').notNull(),
		completedAt: text('completed_at'),
		sourceRowCount: integer('source_row_count').notNull().default(0),
		acceptedCount: integer('accepted_count').notNull().default(0),
		quarantinedCount: integer('quarantined_count').notNull().default(0),
		excludedCount: integer('excluded_count').notNull().default(0),
		aggregatedCount: integer('aggregated_count').notNull().default(0),
		suppressedGroupCount: integer('suppressed_group_count').notNull().default(0)
	},
	(table) => [
		uniqueIndex('import_runs_source_version_uq').on(table.sourceChecksum, table.importerVersion),
		index('import_runs_status_idx').on(table.status, table.startedAt),
		check(
			'import_runs_checksum_ck',
			sql`length(${table.sourceChecksum}) = 64 and ${table.sourceChecksum} not glob '*[^0-9a-f]*'`
		),
		check('import_runs_status_ck', sql`${table.status} in ('started', 'completed')`),
		check(
			'import_runs_completion_ck',
			sql`(${table.status} = 'started' and ${table.completedAt} is null) or (${table.status} = 'completed' and ${table.completedAt} is not null)`
		),
		check(
			'import_runs_counts_ck',
			sql`${table.sourceByteSize} > 0 and ${table.sourceRowCount} >= 0 and ${table.acceptedCount} >= 0 and ${table.quarantinedCount} >= 0 and ${table.excludedCount} >= 0 and ${table.aggregatedCount} >= 0 and ${table.suppressedGroupCount} >= 0`
		)
	]
);

export const users = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		employeeNumber: text('employee_number').notNull(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		passwordHash: text('password_hash'),
		status: text('status').notNull().default('pending'),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
		passwordChangedAt: text('password_changed_at'),
		retiredAt: text('retired_at')
	},
	(table) => [
		uniqueIndex('users_employee_number_uq').on(table.employeeNumber),
		index('users_status_idx').on(table.status),
		check('users_status_ck', sql`${table.status} in ('pending', 'active', 'suspended', 'retired')`),
		check('users_employee_number_ck', sql`length(${table.employeeNumber}) > 0`)
	]
);

export const employeeIdentifierHistory = sqliteTable(
	'employee_identifier_history',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		previousValue: text('previous_value').notNull(),
		replacementValue: text('replacement_value').notNull(),
		changedByUserId: text('changed_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		changedAt: text('changed_at').notNull(),
		reason: text('reason').notNull()
	},
	(table) => [
		index('employee_identifier_history_user_idx').on(table.userId, table.changedAt),
		index('employee_identifier_history_actor_idx').on(table.changedByUserId),
		check(
			'employee_identifier_history_values_ck',
			sql`${table.previousValue} <> ${table.replacementValue}`
		)
	]
);

export const roles = sqliteTable('roles', {
	id: text('id').primaryKey(),
	code: text('code').notNull().unique(),
	displayName: text('display_name').notNull(),
	createdAt: text('created_at').notNull()
});

export const permissions = sqliteTable('permissions', {
	id: text('id').primaryKey(),
	code: text('code').notNull().unique(),
	description: text('description').notNull()
});

export const userRoles = sqliteTable(
	'user_roles',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		roleId: text('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'restrict' }),
		grantedByUserId: text('granted_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		grantedAt: text('granted_at').notNull(),
		revokedAt: text('revoked_at')
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.roleId, table.grantedAt] }),
		index('user_roles_active_idx').on(table.userId, table.revokedAt),
		index('user_roles_role_idx').on(table.roleId, table.revokedAt)
	]
);

export const rolePermissions = sqliteTable(
	'role_permissions',
	{
		roleId: text('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: text('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({ columns: [table.roleId, table.permissionId] }),
		index('role_permissions_permission_idx').on(table.permissionId)
	]
);

export const sessions = sqliteTable(
	'sessions',
	{
		idHash: text('id_hash').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: text('created_at').notNull(),
		lastSeenAt: text('last_seen_at').notNull(),
		expiresAt: text('expires_at').notNull(),
		revokedAt: text('revoked_at'),
		revocationReason: text('revocation_reason'),
		rotatedFromHash: text('rotated_from_hash')
	},
	(table) => [
		index('sessions_user_idx').on(table.userId),
		index('sessions_expiry_idx').on(table.expiresAt),
		check(
			'sessions_window_ck',
			sql`${table.createdAt} <= ${table.lastSeenAt} and ${table.lastSeenAt} <= ${table.expiresAt}`
		),
		check(
			'sessions_revocation_ck',
			sql`(${table.revokedAt} is null and ${table.revocationReason} is null) or (${table.revokedAt} is not null and ${table.revocationReason} is not null)`
		)
	]
);

export const passwordActionTokens = sqliteTable(
	'password_action_tokens',
	{
		idHash: text('id_hash').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		purpose: text('purpose').notNull(),
		createdAt: text('created_at').notNull(),
		expiresAt: text('expires_at').notNull(),
		usedAt: text('used_at'),
		revokedAt: text('revoked_at'),
		createdByUserId: text('created_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		})
	},
	(table) => [
		index('password_action_tokens_user_idx').on(table.userId, table.purpose),
		index('password_action_tokens_expiry_idx').on(table.expiresAt),
		check('password_action_tokens_purpose_ck', sql`${table.purpose} in ('initialize', 'reset')`),
		check('password_action_tokens_window_ck', sql`${table.createdAt} < ${table.expiresAt}`)
	]
);

export const auditEvents = sqliteTable(
	'audit_events',
	{
		id: text('id').primaryKey(),
		actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
		action: text('action').notNull(),
		entityType: text('entity_type').notNull(),
		entityId: text('entity_id'),
		beforeJson: text('before_json'),
		afterJson: text('after_json'),
		occurredAt: text('occurred_at').notNull(),
		retentionUntil: text('retention_until')
	},
	(table) => [
		index('audit_events_actor_idx').on(table.actorUserId, table.occurredAt),
		index('audit_events_entity_idx').on(table.entityType, table.entityId, table.occurredAt)
	]
);

export const aircraftVariants = sqliteTable(
	'aircraft_variants',
	{
		id: text('id').primaryKey(),
		code: text('code').notNull(),
		name: text('name').notNull(),
		effectiveFrom: text('effective_from').notNull(),
		effectiveTo: text('effective_to'),
		status: text('status').notNull().default('review'),
		createdAt: text('created_at').notNull()
	},
	(table) => [
		uniqueIndex('aircraft_variants_code_from_uq').on(table.code, table.effectiveFrom),
		index('aircraft_variants_effective_idx').on(
			table.status,
			table.effectiveFrom,
			table.effectiveTo
		),
		check('aircraft_variants_status_ck', sql`${table.status} in ('review', 'active', 'retired')`),
		check(
			'aircraft_variants_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		)
	]
);

function effectiveVocabularyTable(name: 'qualifications' | 'syllabi' | 'course_types') {
	return sqliteTable(
		name,
		{
			id: text('id').primaryKey(),
			code: text('code').notNull(),
			name: text('name').notNull(),
			effectiveFrom: text('effective_from').notNull(),
			effectiveTo: text('effective_to'),
			status: text('status').notNull().default('review'),
			createdAt: text('created_at').notNull()
		},
		(table) => [
			uniqueIndex(`${name}_code_from_uq`).on(table.code, table.effectiveFrom),
			index(`${name}_effective_idx`).on(table.status, table.effectiveFrom, table.effectiveTo),
			check(`${name}_status_ck`, sql`${table.status} in ('review', 'active', 'retired')`),
			check(
				`${name}_dates_ck`,
				sql`${table.effectiveTo} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
			)
		]
	);
}

export const qualifications = effectiveVocabularyTable('qualifications');
export const syllabi = effectiveVocabularyTable('syllabi');
export const courseTypes = effectiveVocabularyTable('course_types');

export const approvedCourseOfferings = sqliteTable(
	'approved_course_offerings',
	{
		id: text('id').primaryKey(),
		aircraftVariantId: text('aircraft_variant_id')
			.notNull()
			.references(() => aircraftVariants.id, { onDelete: 'restrict' }),
		qualificationId: text('qualification_id')
			.notNull()
			.references(() => qualifications.id, { onDelete: 'restrict' }),
		syllabusId: text('syllabus_id')
			.notNull()
			.references(() => syllabi.id, { onDelete: 'restrict' }),
		courseTypeId: text('course_type_id')
			.notNull()
			.references(() => courseTypes.id, { onDelete: 'restrict' }),
		effectiveFrom: text('effective_from').notNull(),
		effectiveTo: text('effective_to')
	},
	(table) => [
		uniqueIndex('approved_course_offerings_dimensions_from_uq').on(
			table.aircraftVariantId,
			table.qualificationId,
			table.syllabusId,
			table.courseTypeId,
			table.effectiveFrom
		),
		index('approved_course_offerings_qualification_idx').on(table.qualificationId),
		index('approved_course_offerings_syllabus_idx').on(table.syllabusId),
		index('approved_course_offerings_course_type_idx').on(table.courseTypeId),
		check(
			'approved_course_offerings_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		)
	]
);
