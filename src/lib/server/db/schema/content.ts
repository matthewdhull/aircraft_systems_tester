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

import { aircraftVariants, courseTypes, importRuns, users } from './core.js';
import {
	elementVersions,
	legacyEos,
	legacySpos,
	legacyTpos,
	subtaskVersions
} from './curriculum.js';

export const questions = sqliteTable('questions', {
	id: text('id').primaryKey(),
	createdAt: text('created_at').notNull(),
	retiredAt: text('retired_at')
});

export const questionVersions = sqliteTable(
	'question_versions',
	{
		id: text('id').primaryKey(),
		questionId: text('question_id')
			.notNull()
			.references(() => questions.id, { onDelete: 'restrict' }),
		version: integer('version').notNull(),
		questionType: text('question_type').notNull(),
		lifecycle: text('lifecycle').notNull().default('draft'),
		generationStatus: text('generation_status').notNull().default('blocked'),
		authoredByUserId: text('authored_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		reviewedAt: text('reviewed_at'),
		createdAt: text('created_at').notNull(),
		submittedAt: text('submitted_at'),
		publishedAt: text('published_at'),
		effectiveFrom: text('effective_from'),
		effectiveTo: text('effective_to'),
		retiredAt: text('retired_at')
	},
	(table) => [
		uniqueIndex('question_versions_identity_version_uq').on(table.questionId, table.version),
		index('question_versions_lifecycle_idx').on(
			table.lifecycle,
			table.effectiveFrom,
			table.effectiveTo
		),
		index('question_versions_filter_idx').on(
			table.questionType,
			table.lifecycle,
			table.generationStatus,
			table.createdAt
		),
		index('question_versions_activity_idx').on(table.createdAt, table.id),
		check('question_versions_version_ck', sql`${table.version} > 0`),
		check(
			'question_versions_type_ck',
			sql`${table.questionType} in ('true_false', 'single_choice', 'two_correct_compound', 'all_correct', 'none_correct')`
		),
		check(
			'question_versions_lifecycle_ck',
			sql`${table.lifecycle} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'question_versions_generation_ck',
			sql`${table.generationStatus} in ('blocked', 'eligible') and (${table.generationStatus} = 'blocked' or ${table.lifecycle} = 'published')`
		),
		check(
			'question_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'question_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null)`
		),
		check(
			'question_versions_publication_ck',
			sql`${table.lifecycle} not in ('published', 'retired') or (${table.authoredByUserId} is not null and ${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null)`
		)
	]
);

export const questionPrompts = sqliteTable(
	'question_prompts',
	{
		id: text('id').primaryKey(),
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		promptText: text('prompt_text').notNull()
	},
	(table) => [
		uniqueIndex('question_prompts_version_position_uq').on(table.questionVersionId, table.position),
		index('question_prompts_search_idx').on(table.promptText, table.questionVersionId),
		check('question_prompts_position_ck', sql`${table.position} >= 0`),
		check('question_prompts_text_ck', sql`length(trim(${table.promptText})) between 1 and 4000`)
	]
);

export const questionOptions = sqliteTable(
	'question_options',
	{
		id: text('id').primaryKey(),
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		optionText: text('option_text').notNull(),
		isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
		semanticValue: text('semantic_value')
	},
	(table) => [
		uniqueIndex('question_options_version_position_uq').on(table.questionVersionId, table.position),
		uniqueIndex('question_options_version_text_uq').on(table.questionVersionId, table.optionText),
		check('question_options_position_ck', sql`${table.position} >= 0`),
		check('question_options_text_ck', sql`length(trim(${table.optionText})) > 0`),
		check(
			'question_options_semantic_ck',
			sql`${table.semanticValue} is null or ${table.semanticValue} in ('true', 'false', 'compound', 'all', 'none')`
		)
	]
);

export const questionAircraftApplicability = sqliteTable(
	'question_aircraft_applicability',
	{
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'cascade' }),
		aircraftVariantId: text('aircraft_variant_id')
			.notNull()
			.references(() => aircraftVariants.id, { onDelete: 'restrict' })
	},
	(table) => [
		primaryKey({ columns: [table.questionVersionId, table.aircraftVariantId] }),
		index('question_aircraft_applicability_variant_idx').on(table.aircraftVariantId)
	]
);

export const questionLegacyCurriculumLinks = sqliteTable(
	'question_legacy_curriculum_links',
	{
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'cascade' }),
		legacyTpoId: text('legacy_tpo_id')
			.notNull()
			.references(() => legacyTpos.id, { onDelete: 'restrict' }),
		legacySpoId: text('legacy_spo_id')
			.notNull()
			.references(() => legacySpos.id, { onDelete: 'restrict' }),
		legacyEoId: text('legacy_eo_id')
			.notNull()
			.references(() => legacyEos.id, { onDelete: 'restrict' })
	},
	(table) => [
		primaryKey({ columns: [table.questionVersionId, table.legacyEoId] }),
		index('question_legacy_curriculum_spo_idx').on(table.legacySpoId),
		index('question_legacy_curriculum_tpo_idx').on(table.legacyTpoId),
		index('question_legacy_curriculum_eo_idx').on(table.legacyEoId)
	]
);

export const questionFutureCurriculumLinks = sqliteTable(
	'question_future_curriculum_links',
	{
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'cascade' }),
		subtaskVersionId: text('subtask_version_id')
			.notNull()
			.references(() => subtaskVersions.id, { onDelete: 'restrict' }),
		elementVersionId: text('element_version_id').references(() => elementVersions.id, {
			onDelete: 'restrict'
		}),
		mappingStatus: text('mapping_status').notNull().default('review'),
		proposedByUserId: text('proposed_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		proposedAt: text('proposed_at').notNull(),
		reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
			onDelete: 'restrict'
		}),
		reviewedAt: text('reviewed_at')
	},
	(table) => [
		primaryKey({ columns: [table.questionVersionId, table.subtaskVersionId] }),
		index('question_future_curriculum_element_idx').on(table.elementVersionId),
		index('question_future_curriculum_subtask_idx').on(table.subtaskVersionId),
		check(
			'question_future_curriculum_status_ck',
			sql`${table.mappingStatus} in ('review', 'approved', 'retired')`
		),
		check(
			'question_future_curriculum_review_ck',
			sql`(${table.mappingStatus} = 'review' and ${table.reviewedAt} is null and ${table.reviewedByUserId} is null) or (${table.mappingStatus} <> 'review' and ${table.reviewedAt} is not null and ${table.reviewedByUserId} is not null)`
		)
	]
);

export const testTemplates = sqliteTable('test_templates', {
	id: text('id').primaryKey(),
	createdAt: text('created_at').notNull(),
	retiredAt: text('retired_at')
});

export const testTemplateVersions = sqliteTable(
	'test_template_versions',
	{
		id: text('id').primaryKey(),
		testTemplateId: text('test_template_id')
			.notNull()
			.references(() => testTemplates.id, { onDelete: 'restrict' }),
		version: integer('version').notNull(),
		name: text('name').notNull(),
		aircraftVariantId: text('aircraft_variant_id')
			.notNull()
			.references(() => aircraftVariants.id, { onDelete: 'restrict' }),
		courseTypeId: text('course_type_id').references(() => courseTypes.id, { onDelete: 'restrict' }),
		configuredLength: integer('configured_length').notNull(),
		allottedMinutes: integer('allotted_minutes').notNull(),
		lifecycle: text('lifecycle').notNull().default('draft'),
		authoredByUserId: text('authored_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		reviewedAt: text('reviewed_at'),
		createdAt: text('created_at').notNull(),
		submittedAt: text('submitted_at'),
		publishedAt: text('published_at'),
		effectiveFrom: text('effective_from'),
		effectiveTo: text('effective_to'),
		retiredAt: text('retired_at')
	},
	(table) => [
		uniqueIndex('test_template_versions_identity_version_uq').on(
			table.testTemplateId,
			table.version
		),
		index('test_template_versions_effective_idx').on(
			table.lifecycle,
			table.aircraftVariantId,
			table.effectiveFrom,
			table.effectiveTo
		),
		index('test_template_versions_aircraft_idx').on(table.aircraftVariantId, table.lifecycle),
		check(
			'test_template_versions_values_ck',
			sql`${table.version} > 0 and ${table.configuredLength} > 0 and ${table.allottedMinutes} > 0`
		),
		check(
			'test_template_versions_lifecycle_ck',
			sql`${table.lifecycle} in ('draft', 'review', 'published', 'retired')`
		),
		check(
			'test_template_versions_dates_ck',
			sql`${table.effectiveTo} is null or ${table.effectiveFrom} is null or ${table.effectiveTo} > ${table.effectiveFrom}`
		),
		check(
			'test_template_versions_reviewer_ck',
			sql`(${table.reviewedByUserId} is null and ${table.reviewedAt} is null) or (${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.authoredByUserId} is not null)`
		),
		check(
			'test_template_versions_lifecycle_dates_ck',
			sql`(${table.lifecycle} = 'draft' and ${table.publishedAt} is null and ${table.retiredAt} is null) or (${table.lifecycle} = 'review' and ${table.submittedAt} is not null and ${table.publishedAt} is null and ${table.retiredAt} is null) or (${table.lifecycle} = 'published' and ${table.submittedAt} is not null and ${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null and ${table.retiredAt} is null) or (${table.lifecycle} = 'retired' and ${table.submittedAt} is not null and ${table.reviewedByUserId} is not null and ${table.reviewedAt} is not null and ${table.publishedAt} is not null and ${table.effectiveFrom} is not null and ${table.retiredAt} is not null)`
		)
	]
);

export const testTemplateRules = sqliteTable(
	'test_template_rules',
	{
		id: text('id').primaryKey(),
		testTemplateVersionId: text('test_template_version_id')
			.notNull()
			.references(() => testTemplateVersions.id, { onDelete: 'cascade' }),
		subtaskVersionId: text('subtask_version_id')
			.notNull()
			.references(() => subtaskVersions.id, { onDelete: 'restrict' }),
		questionCount: integer('question_count').notNull(),
		position: integer('position').notNull()
	},
	(table) => [
		uniqueIndex('test_template_rules_subtask_uq').on(
			table.testTemplateVersionId,
			table.subtaskVersionId
		),
		uniqueIndex('test_template_rules_position_uq').on(table.testTemplateVersionId, table.position),
		index('test_template_rules_subtask_idx').on(table.subtaskVersionId),
		check(
			'test_template_rules_count_ck',
			sql`${table.questionCount} > 0 and ${table.position} >= 0`
		)
	]
);

export const testTemplateRequiredElements = sqliteTable(
	'test_template_required_elements',
	{
		id: text('id').primaryKey(),
		testTemplateVersionId: text('test_template_version_id')
			.notNull()
			.references(() => testTemplateVersions.id, { onDelete: 'cascade' }),
		elementVersionId: text('element_version_id')
			.notNull()
			.references(() => elementVersions.id, { onDelete: 'restrict' }),
		subtaskVersionId: text('subtask_version_id')
			.notNull()
			.references(() => subtaskVersions.id, { onDelete: 'restrict' }),
		position: integer('position').notNull()
	},
	(table) => [
		uniqueIndex('test_template_required_elements_element_uq').on(
			table.testTemplateVersionId,
			table.elementVersionId
		),
		uniqueIndex('test_template_required_elements_position_uq').on(
			table.testTemplateVersionId,
			table.position
		),
		index('test_template_required_elements_element_idx').on(table.elementVersionId),
		index('test_template_required_elements_subtask_idx').on(table.subtaskVersionId),
		check('test_template_required_elements_position_ck', sql`${table.position} >= 0`)
	]
);

export const legacyTemplateSources = sqliteTable(
	'legacy_template_sources',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		sourceTable: text('source_table').notNull(),
		sourceId: text('source_id').notNull(),
		logicalName: text('logical_name'),
		aircraftSourceId: text('aircraft_source_id'),
		configuredLength: integer('configured_length'),
		sourceShapeJson: text('source_shape_json').notNull(),
		reconciliationState: text('reconciliation_state').notNull().default('unreviewed'),
		mappedTemplateVersionId: text('mapped_template_version_id').references(
			() => testTemplateVersions.id,
			{
				onDelete: 'restrict'
			}
		),
		adoptedByUserId: text('adopted_by_user_id').references(() => users.id, {
			onDelete: 'restrict'
		}),
		adoptedAt: text('adopted_at')
	},
	(table) => [
		uniqueIndex('legacy_template_sources_source_uq').on(
			table.importRunId,
			table.sourceTable,
			table.sourceId
		),
		index('legacy_template_sources_reconciliation_idx').on(
			table.sourceTable,
			table.reconciliationState
		),
		index('legacy_template_sources_mapped_idx').on(table.mappedTemplateVersionId),
		check(
			'legacy_template_sources_table_ck',
			sql`${table.sourceTable} in ('test_model', 'testModel')`
		),
		check(
			'legacy_template_sources_state_ck',
			sql`${table.reconciliationState} in ('unreviewed', 'mapped', 'ambiguous', 'retired')`
		),
		check(
			'legacy_template_sources_length_ck',
			sql`${table.configuredLength} is null or ${table.configuredLength} > 0`
		),
		check(
			'legacy_template_sources_adoption_ck',
			sql`(${table.reconciliationState} = 'mapped' and ${table.mappedTemplateVersionId} is not null and ${table.adoptedByUserId} is not null and ${table.adoptedAt} is not null) or (${table.reconciliationState} <> 'mapped' and ${table.mappedTemplateVersionId} is null and ${table.adoptedByUserId} is null and ${table.adoptedAt} is null)`
		)
	]
);

export const legacyTemplateSourceRules = sqliteTable(
	'legacy_template_source_rules',
	{
		id: text('id').primaryKey(),
		legacyTemplateSourceId: text('legacy_template_source_id')
			.notNull()
			.references(() => legacyTemplateSources.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		legacyCurriculumType: text('legacy_curriculum_type').notNull(),
		legacyCurriculumSourceId: text('legacy_curriculum_source_id').notNull(),
		questionCount: integer('question_count').notNull(),
		isMandatory: integer('is_mandatory', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => [
		uniqueIndex('legacy_template_source_rules_position_uq').on(
			table.legacyTemplateSourceId,
			table.position
		),
		check(
			'legacy_template_source_rules_values_ck',
			sql`${table.position} >= 0 and ${table.questionCount} >= 0`
		),
		check(
			'legacy_template_source_rules_type_ck',
			sql`${table.legacyCurriculumType} in ('tpo', 'spo', 'eo')`
		)
	]
);
