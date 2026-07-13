import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

import { questionVersions } from './content.js';
import { importRuns, users } from './core.js';

export const SOURCE_TABLES = [
	'TPO',
	'SPO',
	'EO',
	'variant',
	'questions',
	'test_model',
	'testModel',
	'createdTests',
	'usedQuestions',
	'studentTestRecords',
	'testResults',
	'instructors',
	'logins',
	'stamp',
	'test_info'
] as const;

export const QUARANTINE_REASON_CODES = [
	'missing_parent',
	'curriculum_parent_mismatch',
	'missing_or_invalid_variant',
	'malformed_question_shape',
	'duplicate_candidate',
	'zero_or_sentinel_relationship',
	'ambiguous_template_source',
	'unreliable_historical_join',
	'restricted_snapshot_only_content',
	'aggregate_group_suppression',
	'encoding_error',
	'unknown_question_type'
] as const;

export const sourceTableInventories = sqliteTable(
	'source_table_inventories',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'cascade' }),
		sourceTable: text('source_table').notNull(),
		disposition: text('disposition').notNull(),
		sourceCount: integer('source_count').notNull(),
		acceptedCount: integer('accepted_count').notNull().default(0),
		quarantinedCount: integer('quarantined_count').notNull().default(0),
		excludedCount: integer('excluded_count').notNull().default(0),
		aggregatedCount: integer('aggregated_count').notNull().default(0),
		suppressedCount: integer('suppressed_count').notNull().default(0)
	},
	(table) => [
		uniqueIndex('source_table_inventories_run_table_uq').on(table.importRunId, table.sourceTable),
		check(
			'source_table_inventories_table_ck',
			sql`${table.sourceTable} in ('TPO', 'SPO', 'EO', 'variant', 'questions', 'test_model', 'testModel', 'createdTests', 'usedQuestions', 'studentTestRecords', 'testResults', 'instructors', 'logins', 'stamp', 'test_info')`
		),
		check(
			'source_table_inventories_disposition_ck',
			sql`${table.disposition} in ('migrate', 'template_source', 'aggregate', 'aggregate_or_quarantine', 'exclude')`
		),
		check(
			'source_table_inventories_counts_ck',
			sql`${table.sourceCount} >= 0 and ${table.acceptedCount} >= 0 and ${table.quarantinedCount} >= 0 and ${table.excludedCount} >= 0 and ${table.aggregatedCount} >= 0 and ${table.suppressedCount} >= 0`
		)
	]
);

export const sourceTargetMappings = sqliteTable(
	'source_target_mappings',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		sourceTable: text('source_table').notNull(),
		sourceId: text('source_id').notNull(),
		targetTable: text('target_table').notNull(),
		targetId: text('target_id').notNull(),
		mappingKind: text('mapping_kind').notNull().default('direct')
	},
	(table) => [
		uniqueIndex('source_target_mappings_source_uq').on(
			table.importRunId,
			table.sourceTable,
			table.sourceId,
			table.targetTable
		),
		uniqueIndex('source_target_mappings_target_uq').on(
			table.importRunId,
			table.targetTable,
			table.targetId
		),
		index('source_target_mappings_coverage_idx').on(table.sourceTable, table.mappingKind),
		check(
			'source_target_mappings_kind_ck',
			sql`${table.mappingKind} in ('direct', 'version', 'aggregate')`
		)
	]
);

export const quarantineRecords = sqliteTable(
	'quarantine_records',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		sourceTable: text('source_table').notNull(),
		sourceId: text('source_id'),
		reasonCode: text('reason_code').notNull(),
		disposition: text('disposition').notNull().default('quarantined'),
		restrictedPayloadJson: text('restricted_payload_json'),
		payloadFingerprint: text('payload_fingerprint'),
		createdAt: text('created_at').notNull(),
		reviewedAt: text('reviewed_at'),
		reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
			onDelete: 'restrict'
		}),
		reviewNote: text('review_note')
	},
	(table) => [
		uniqueIndex('quarantine_records_source_reason_uq').on(
			table.importRunId,
			table.sourceTable,
			table.sourceId,
			table.reasonCode
		),
		index('quarantine_records_reason_status_idx').on(table.reasonCode, table.disposition),
		check(
			'quarantine_records_reason_ck',
			sql`${table.reasonCode} in ('missing_parent', 'curriculum_parent_mismatch', 'missing_or_invalid_variant', 'malformed_question_shape', 'duplicate_candidate', 'zero_or_sentinel_relationship', 'ambiguous_template_source', 'unreliable_historical_join', 'restricted_snapshot_only_content', 'aggregate_group_suppression', 'encoding_error', 'unknown_question_type')`
		),
		check(
			'quarantine_records_disposition_ck',
			sql`${table.disposition} in ('rejected', 'quarantined', 'excluded', 'suppressed', 'approved_for_future_reconciliation')`
		),
		check(
			'quarantine_records_review_ck',
			sql`(${table.reviewedAt} is null and ${table.reviewedByUserId} is null) or (${table.reviewedAt} is not null and ${table.reviewedByUserId} is not null)`
		),
		check(
			'quarantine_records_snapshot_payload_ck',
			sql`${table.reasonCode} <> 'restricted_snapshot_only_content' or (${table.sourceTable} = 'usedQuestions' and ${table.sourceId} is null and ${table.restrictedPayloadJson} is not null)`
		)
	]
);

export const historicalGenerationAggregates = sqliteTable(
	'historical_generation_aggregates',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		calendarYear: integer('calendar_year').notNull(),
		templateSourceKey: text('template_source_key'),
		courseTypeCode: text('course_type_code'),
		configuredLength: integer('configured_length'),
		groupSize: integer('group_size').notNull(),
		generatedCount: integer('generated_count').notNull(),
		publicationState: text('publication_state').notNull()
	},
	(table) => [
		uniqueIndex('historical_generation_aggregates_dimensions_uq').on(
			table.importRunId,
			table.calendarYear,
			table.templateSourceKey,
			table.courseTypeCode,
			table.configuredLength
		),
		index('historical_generation_aggregates_report_idx').on(
			table.calendarYear,
			table.publicationState
		),
		check(
			'historical_generation_aggregates_values_ck',
			sql`${table.calendarYear} between 1900 and 9999 and ${table.groupSize} > 0 and ${table.generatedCount} >= 0 and (${table.configuredLength} is null or ${table.configuredLength} > 0)`
		),
		check(
			'historical_generation_aggregates_publication_ck',
			sql`(${table.publicationState} = 'published' and ${table.groupSize} >= 5) or ${table.publicationState} = 'suppressed'`
		)
	]
);

export const historicalAssessmentAggregates = sqliteTable(
	'historical_assessment_aggregates',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		calendarYear: integer('calendar_year').notNull(),
		syllabusCode: text('syllabus_code'),
		qualificationCode: text('qualification_code'),
		retraining: integer('retraining', { mode: 'boolean' }),
		outcome: text('outcome'),
		groupSize: integer('group_size').notNull(),
		attemptCount: integer('attempt_count').notNull(),
		averageScore: real('average_score'),
		publicationState: text('publication_state').notNull()
	},
	(table) => [
		uniqueIndex('historical_assessment_aggregates_dimensions_uq').on(
			table.importRunId,
			table.calendarYear,
			table.syllabusCode,
			table.qualificationCode,
			table.retraining,
			table.outcome
		),
		index('historical_assessment_aggregates_report_idx').on(
			table.calendarYear,
			table.publicationState
		),
		check(
			'historical_assessment_aggregates_values_ck',
			sql`${table.calendarYear} between 1900 and 9999 and ${table.groupSize} > 0 and ${table.attemptCount} >= 0 and (${table.averageScore} is null or ${table.averageScore} between 0 and 100)`
		),
		check(
			'historical_assessment_aggregates_outcome_ck',
			sql`${table.outcome} is null or ${table.outcome} in ('satisfactory', 'unsatisfactory')`
		),
		check(
			'historical_assessment_aggregates_publication_ck',
			sql`(${table.publicationState} = 'published' and ${table.groupSize} >= 5) or ${table.publicationState} = 'suppressed'`
		)
	]
);

export const historicalQuestionPerformance = sqliteTable(
	'historical_question_performance',
	{
		id: text('id').primaryKey(),
		importRunId: text('import_run_id')
			.notNull()
			.references(() => importRuns.id, { onDelete: 'restrict' }),
		questionVersionId: text('question_version_id')
			.notNull()
			.references(() => questionVersions.id, { onDelete: 'restrict' }),
		calendarYear: integer('calendar_year'),
		askedCount: integer('asked_count').notNull(),
		correctCount: integer('correct_count').notNull(),
		publicationState: text('publication_state').notNull()
	},
	(table) => [
		uniqueIndex('historical_question_performance_dimensions_uq').on(
			table.importRunId,
			table.questionVersionId,
			table.calendarYear
		),
		index('historical_question_performance_report_idx').on(
			table.questionVersionId,
			table.calendarYear
		),
		check(
			'historical_question_performance_values_ck',
			sql`(${table.calendarYear} is null or ${table.calendarYear} between 1900 and 9999) and ${table.askedCount} > 0 and ${table.correctCount} between 0 and ${table.askedCount}`
		),
		check(
			'historical_question_performance_publication_ck',
			sql`(${table.publicationState} = 'published' and ${table.askedCount} >= 5) or ${table.publicationState} = 'suppressed'`
		)
	]
);
