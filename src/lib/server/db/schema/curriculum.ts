import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { importRuns, users } from './core.js';

export const bloomLevels = sqliteTable(
	'bloom_levels',
	{
		id: text('id').primaryKey(),
		ordinal: integer('ordinal').notNull(),
		name: text('name').notNull(),
		status: text('status').notNull().default('draft'),
		createdAt: text('created_at').notNull(),
		retiredAt: text('retired_at')
	},
	(table) => [
		uniqueIndex('bloom_levels_ordinal_uq').on(table.ordinal),
		check('bloom_levels_ordinal_ck', sql`${table.ordinal} > 0`),
		check('bloom_levels_status_ck', sql`${table.status} in ('draft', 'published', 'retired')`)
	]
);

export const bloomVerbs = sqliteTable(
	'bloom_verbs',
	{
		id: text('id').primaryKey(),
		bloomLevelId: text('bloom_level_id')
			.notNull()
			.references(() => bloomLevels.id, { onDelete: 'restrict' }),
		verb: text('verb').notNull(),
		status: text('status').notNull().default('draft'),
		createdAt: text('created_at').notNull(),
		retiredAt: text('retired_at')
	},
	(table) => [
		uniqueIndex('bloom_verbs_level_verb_uq').on(table.bloomLevelId, table.verb),
		check('bloom_verbs_status_ck', sql`${table.status} in ('draft', 'published', 'retired')`)
	]
);

function curriculumIdentityTable(name: 'phases' | 'tasks' | 'subtasks' | 'elements') {
	return sqliteTable(name, {
		id: text('id').primaryKey(),
		createdAt: text('created_at').notNull(),
		retiredAt: text('retired_at')
	});
}

export const phases = curriculumIdentityTable('phases');
export const tasks = curriculumIdentityTable('tasks');
export const subtasks = curriculumIdentityTable('subtasks');
export const elements = curriculumIdentityTable('elements');

const versionColumns = {
	version: integer('version').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	position: integer('position').notNull(),
	status: text('status').notNull().default('draft'),
	effectiveFrom: text('effective_from'),
	effectiveTo: text('effective_to'),
	authoredByUserId: text('authored_by_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'restrict' }),
	reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
		onDelete: 'set null'
	}),
	reviewedAt: text('reviewed_at'),
	createdAt: text('created_at').notNull(),
	publishedAt: text('published_at'),
	retiredAt: text('retired_at')
};

export const phaseVersions = sqliteTable(
	'phase_versions',
	{
		id: text('id').primaryKey(),
		phaseId: text('phase_id')
			.notNull()
			.references(() => phases.id, { onDelete: 'restrict' }),
		...versionColumns,
		bloomVerbId: text('bloom_verb_id').references(() => bloomVerbs.id, { onDelete: 'restrict' })
	},
	(table) => [
		uniqueIndex('phase_versions_identity_version_uq').on(table.phaseId, table.version),
		uniqueIndex('phase_versions_position_from_uq').on(table.position, table.effectiveFrom),
		uniqueIndex('phase_versions_unpublished_position_uq')
			.on(table.position)
			.where(sql`${table.status} in ('draft', 'review')`),
		index('phase_versions_lifecycle_idx').on(table.status, table.effectiveFrom, table.effectiveTo),
		check('phase_versions_values_ck', sql`${table.version} > 0 and ${table.position} >= 0`),
		check(
			'phase_versions_status_ck',
			sql`${table.status} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'phase_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'phase_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null)`
		),
		check(
			'phase_versions_publication_ck',
			sql`${table.status} not in ('published', 'retired') or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null)`
		)
	]
);

export const taskVersions = sqliteTable(
	'task_versions',
	{
		id: text('id').primaryKey(),
		taskId: text('task_id')
			.notNull()
			.references(() => tasks.id, { onDelete: 'restrict' }),
		phaseVersionId: text('phase_version_id')
			.notNull()
			.references(() => phaseVersions.id, { onDelete: 'restrict' }),
		...versionColumns,
		bloomVerbId: text('bloom_verb_id').references(() => bloomVerbs.id, { onDelete: 'restrict' })
	},
	(table) => [
		uniqueIndex('task_versions_identity_version_uq').on(table.taskId, table.version),
		uniqueIndex('task_versions_parent_position_from_uq').on(
			table.phaseVersionId,
			table.position,
			table.effectiveFrom
		),
		uniqueIndex('task_versions_unpublished_parent_position_uq')
			.on(table.phaseVersionId, table.position)
			.where(sql`${table.status} in ('draft', 'review')`),
		index('task_versions_parent_idx').on(table.phaseVersionId, table.status),
		check('task_versions_values_ck', sql`${table.version} > 0 and ${table.position} >= 0`),
		check(
			'task_versions_status_ck',
			sql`${table.status} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'task_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'task_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null)`
		),
		check(
			'task_versions_publication_ck',
			sql`${table.status} not in ('published', 'retired') or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null)`
		)
	]
);

export const subtaskVersions = sqliteTable(
	'subtask_versions',
	{
		id: text('id').primaryKey(),
		subtaskId: text('subtask_id')
			.notNull()
			.references(() => subtasks.id, { onDelete: 'restrict' }),
		taskVersionId: text('task_version_id')
			.notNull()
			.references(() => taskVersions.id, { onDelete: 'restrict' }),
		...versionColumns,
		bloomVerbId: text('bloom_verb_id').references(() => bloomVerbs.id, { onDelete: 'restrict' })
	},
	(table) => [
		uniqueIndex('subtask_versions_identity_version_uq').on(table.subtaskId, table.version),
		uniqueIndex('subtask_versions_parent_position_from_uq').on(
			table.taskVersionId,
			table.position,
			table.effectiveFrom
		),
		uniqueIndex('subtask_versions_unpublished_parent_position_uq')
			.on(table.taskVersionId, table.position)
			.where(sql`${table.status} in ('draft', 'review')`),
		index('subtask_versions_parent_idx').on(table.taskVersionId, table.status),
		check('subtask_versions_values_ck', sql`${table.version} > 0 and ${table.position} >= 0`),
		check(
			'subtask_versions_status_ck',
			sql`${table.status} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'subtask_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'subtask_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null)`
		),
		check(
			'subtask_versions_publication_ck',
			sql`${table.status} not in ('published', 'retired') or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null)`
		)
	]
);

export const elementVersions = sqliteTable(
	'element_versions',
	{
		id: text('id').primaryKey(),
		elementId: text('element_id')
			.notNull()
			.references(() => elements.id, { onDelete: 'restrict' }),
		subtaskVersionId: text('subtask_version_id')
			.notNull()
			.references(() => subtaskVersions.id, { onDelete: 'restrict' }),
		...versionColumns
	},
	(table) => [
		uniqueIndex('element_versions_identity_version_uq').on(table.elementId, table.version),
		uniqueIndex('element_versions_parent_position_from_uq').on(
			table.subtaskVersionId,
			table.position,
			table.effectiveFrom
		),
		uniqueIndex('element_versions_unpublished_parent_position_uq')
			.on(table.subtaskVersionId, table.position)
			.where(sql`${table.status} in ('draft', 'review')`),
		index('element_versions_parent_idx').on(table.subtaskVersionId, table.status),
		check('element_versions_values_ck', sql`${table.version} > 0 and ${table.position} >= 0`),
		check(
			'element_versions_status_ck',
			sql`${table.status} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'element_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'element_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null)`
		),
		check(
			'element_versions_publication_ck',
			sql`${table.status} not in ('published', 'retired') or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null)`
		)
	]
);

export const legacyTpos = sqliteTable(
	'legacy_tpos',
	{
		id: text('id').primaryKey(),
		sourceId: text('source_id').notNull(),
		number: text('number').notNull(),
		name: text('name').notNull(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' })
	},
	(table) => [uniqueIndex('legacy_tpos_source_uq').on(table.importRunId, table.sourceId)]
);

export const legacySpos = sqliteTable(
	'legacy_spos',
	{
		id: text('id').primaryKey(),
		sourceId: text('source_id').notNull(),
		legacyTpoId: text('legacy_tpo_id')
			.notNull()
			.references(() => legacyTpos.id, { onDelete: 'restrict' }),
		number: text('number').notNull(),
		name: text('name').notNull(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' })
	},
	(table) => [
		uniqueIndex('legacy_spos_source_uq').on(table.importRunId, table.sourceId),
		index('legacy_spos_parent_idx').on(table.legacyTpoId)
	]
);

export const legacyEos = sqliteTable(
	'legacy_eos',
	{
		id: text('id').primaryKey(),
		sourceId: text('source_id').notNull(),
		legacySpoId: text('legacy_spo_id')
			.notNull()
			.references(() => legacySpos.id, { onDelete: 'restrict' }),
		number: text('number').notNull(),
		name: text('name').notNull(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' })
	},
	(table) => [
		uniqueIndex('legacy_eos_source_uq').on(table.importRunId, table.sourceId),
		index('legacy_eos_parent_idx').on(table.legacySpoId)
	]
);

export const legacyCurriculumMappings = sqliteTable(
	'legacy_curriculum_mappings',
	{
		id: text('id').primaryKey(),
		legacyEntityType: text('legacy_entity_type').notNull(),
		legacyEntityId: text('legacy_entity_id').notNull(),
		targetEntityType: text('target_entity_type').notNull(),
		targetEntityId: text('target_entity_id').notNull(),
		status: text('status').notNull().default('proposed'),
		proposedByUserId: text('proposed_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		proposedAt: text('proposed_at').notNull(),
		reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
			onDelete: 'restrict'
		}),
		reviewedAt: text('reviewed_at'),
		rationale: text('rationale').notNull()
	},
	(table) => [
		uniqueIndex('legacy_curriculum_mappings_pair_uq').on(
			table.legacyEntityType,
			table.legacyEntityId,
			table.targetEntityType,
			table.targetEntityId
		),
		index('legacy_curriculum_mappings_target_idx').on(
			table.targetEntityType,
			table.targetEntityId,
			table.status
		),
		check(
			'legacy_curriculum_mappings_legacy_type_ck',
			sql`${table.legacyEntityType} in ('tpo', 'spo', 'eo')`
		),
		check(
			'legacy_curriculum_mappings_target_type_ck',
			sql`${table.targetEntityType} in ('phase', 'task', 'subtask', 'element')`
		),
		check(
			'legacy_curriculum_mappings_status_ck',
			sql`${table.status} in ('proposed', 'approved', 'rejected', 'retired')`
		),
		check(
			'legacy_curriculum_mappings_review_ck',
			sql`(${table.status} = 'proposed' and ${table.reviewedAt} is null and ${table.reviewedByUserId} is null) or (${table.status} <> 'proposed' and ${table.reviewedAt} is not null and ${table.reviewedByUserId} is not null)`
		)
	]
);
