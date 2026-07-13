import { sql } from 'drizzle-orm';
import {
	check,
	foreignKey,
	index,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

import { approvedCourseOfferings, users } from './core.js';
import { questionOptions, questionVersions, testTemplateVersions } from './content.js';

export const classRosters = sqliteTable(
	'class_rosters',
	{
		id: text('id').primaryKey(),
		courseOfferingId: text('course_offering_id')
			.notNull()
			.references(() => approvedCourseOfferings.id, { onDelete: 'restrict' }),
		instructorUserId: text('instructor_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		name: text('name').notNull(),
		startsOn: text('starts_on').notNull(),
		endsOn: text('ends_on'),
		createdAt: text('created_at').notNull(),
		retiredAt: text('retired_at')
	},
	(table) => [
		index('class_rosters_instructor_idx').on(table.instructorUserId, table.startsOn),
		index('class_rosters_offering_idx').on(table.courseOfferingId, table.startsOn),
		check(
			'class_rosters_dates_ck',
			sql`${table.endsOn} is null or ${table.endsOn} >= ${table.startsOn}`
		)
	]
);

export const rosterMembers = sqliteTable(
	'roster_members',
	{
		id: text('id').primaryKey(),
		classRosterId: text('class_roster_id')
			.notNull()
			.references(() => classRosters.id, { onDelete: 'restrict' }),
		studentUserId: text('student_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		status: text('status').notNull().default('active'),
		addedAt: text('added_at').notNull(),
		removedAt: text('removed_at')
	},
	(table) => [
		uniqueIndex('roster_members_class_student_uq').on(table.classRosterId, table.studentUserId),
		index('roster_members_student_idx').on(table.studentUserId, table.status),
		check('roster_members_status_ck', sql`${table.status} in ('active', 'removed', 'completed')`)
	]
);

export const examInstances = sqliteTable(
	'exam_instances',
	{
		id: text('id').primaryKey(),
		testTemplateVersionId: text('test_template_version_id')
			.notNull()
			.references(() => testTemplateVersions.id, { onDelete: 'restrict' }),
		classRosterId: text('class_roster_id')
			.notNull()
			.references(() => classRosters.id, { onDelete: 'restrict' }),
		publishedByUserId: text('published_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		status: text('status').notNull().default('draft'),
		accessCodeHash: text('access_code_hash'),
		randomSeedCiphertext: text('random_seed_ciphertext').notNull(),
		randomAlgorithmVersion: text('random_algorithm_version').notNull(),
		publishedAt: text('published_at'),
		startClosesAt: text('start_closes_at'),
		createdAt: text('created_at').notNull(),
		retentionUntil: text('retention_until')
	},
	(table) => [
		index('exam_instances_roster_status_idx').on(
			table.classRosterId,
			table.status,
			table.publishedAt
		),
		index('exam_instances_retention_idx').on(table.retentionUntil),
		index('exam_instances_template_idx').on(table.testTemplateVersionId, table.status),
		check(
			'exam_instances_status_ck',
			sql`${table.status} in ('draft', 'published', 'closed', 'retired')`
		),
		check(
			'exam_instances_publication_ck',
			sql`(${table.status} = 'draft') or (${table.publishedAt} is not null and ${table.startClosesAt} is not null and ${table.accessCodeHash} is not null)`
		)
	]
);

export const examQuestions = sqliteTable(
	'exam_questions',
	{
		id: text('id').primaryKey(),
		examInstanceId: text('exam_instance_id')
			.notNull()
			.references(() => examInstances.id, { onDelete: 'restrict' }),
		sourceQuestionVersionId: text('source_question_version_id').references(
			() => questionVersions.id,
			{
				onDelete: 'restrict'
			}
		),
		position: integer('position').notNull(),
		questionType: text('question_type').notNull(),
		promptText: text('prompt_text').notNull(),
		isInvalidated: integer('is_invalidated', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => [
		uniqueIndex('exam_questions_position_uq').on(table.examInstanceId, table.position),
		index('exam_questions_source_idx').on(table.sourceQuestionVersionId),
		check('exam_questions_position_ck', sql`${table.position} >= 0`),
		check(
			'exam_questions_type_ck',
			sql`${table.questionType} in ('true_false', 'single_choice', 'two_correct_compound', 'all_correct', 'none_correct')`
		)
	]
);

export const examQuestionOptions = sqliteTable(
	'exam_question_options',
	{
		id: text('id').primaryKey(),
		examQuestionId: text('exam_question_id')
			.notNull()
			.references(() => examQuestions.id, { onDelete: 'restrict' }),
		sourceQuestionOptionId: text('source_question_option_id').references(() => questionOptions.id, {
			onDelete: 'restrict'
		}),
		position: integer('position').notNull(),
		optionText: text('option_text').notNull(),
		isCorrect: integer('is_correct', { mode: 'boolean' }).notNull()
	},
	(table) => [
		uniqueIndex('exam_question_options_position_uq').on(table.examQuestionId, table.position),
		index('exam_question_options_source_idx').on(table.sourceQuestionOptionId),
		check('exam_question_options_position_ck', sql`${table.position} >= 0`)
	]
);

export const examAttempts = sqliteTable(
	'exam_attempts',
	{
		id: text('id').primaryKey(),
		examInstanceId: text('exam_instance_id')
			.notNull()
			.references(() => examInstances.id, { onDelete: 'restrict' }),
		rosterMemberId: text('roster_member_id')
			.notNull()
			.references(() => rosterMembers.id, { onDelete: 'restrict' }),
		priorAttemptId: text('prior_attempt_id'),
		attemptNumber: integer('attempt_number').notNull().default(1),
		status: text('status').notNull().default('in_progress'),
		startedAt: text('started_at').notNull(),
		deadlineAt: text('deadline_at').notNull(),
		submittedAt: text('submitted_at'),
		submissionReason: text('submission_reason'),
		originalCorrectCount: integer('original_correct_count'),
		originalDenominator: integer('original_denominator'),
		originalScorePercent: real('original_score_percent'),
		originalOutcome: text('original_outcome'),
		correctedCorrectCount: integer('corrected_correct_count'),
		correctedDenominator: integer('corrected_denominator'),
		correctedScorePercent: real('corrected_score_percent'),
		correctedOutcome: text('corrected_outcome'),
		retentionUntil: text('retention_until').notNull(),
		legalHold: integer('legal_hold', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => [
		uniqueIndex('exam_attempts_exam_member_number_uq').on(
			table.examInstanceId,
			table.rosterMemberId,
			table.attemptNumber
		),
		index('exam_attempts_status_deadline_idx').on(table.status, table.deadlineAt),
		index('exam_attempts_retention_idx').on(table.legalHold, table.retentionUntil),
		index('exam_attempts_roster_member_idx').on(table.rosterMemberId, table.status),
		foreignKey({
			columns: [table.priorAttemptId],
			foreignColumns: [table.id],
			name: 'exam_attempts_prior_attempt_fk'
		}).onDelete('restrict'),
		check('exam_attempts_number_ck', sql`${table.attemptNumber} > 0`),
		check(
			'exam_attempts_status_ck',
			sql`${table.status} in ('in_progress', 'submitted', 'expired', 'voided')`
		),
		check('exam_attempts_window_ck', sql`${table.deadlineAt} > ${table.startedAt}`),
		check(
			'exam_attempts_submission_reason_ck',
			sql`${table.submissionReason} is null or ${table.submissionReason} in ('student', 'deadline', 'administrative')`
		),
		check(
			'exam_attempts_outcome_ck',
			sql`${table.originalOutcome} is null or ${table.originalOutcome} in ('satisfactory', 'unsatisfactory')`
		),
		check(
			'exam_attempts_corrected_outcome_ck',
			sql`${table.correctedOutcome} is null or ${table.correctedOutcome} in ('satisfactory', 'unsatisfactory')`
		),
		check(
			'exam_attempts_original_score_ck',
			sql`${table.originalDenominator} is null or (${table.originalDenominator} > 0 and ${table.originalCorrectCount} between 0 and ${table.originalDenominator} and ${table.originalScorePercent} between 0 and 100)`
		),
		check(
			'exam_attempts_corrected_score_ck',
			sql`${table.correctedDenominator} is null or (${table.correctedDenominator} > 0 and ${table.correctedCorrectCount} between 0 and ${table.correctedDenominator} and ${table.correctedScorePercent} between 0 and 100)`
		)
	]
);

export const attemptQuestionOrder = sqliteTable(
	'attempt_question_order',
	{
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'cascade' }),
		examQuestionId: text('exam_question_id')
			.notNull()
			.references(() => examQuestions.id, { onDelete: 'restrict' }),
		position: integer('position').notNull(),
		isMarked: integer('is_marked', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => [
		primaryKey({ columns: [table.examAttemptId, table.examQuestionId] }),
		uniqueIndex('attempt_question_order_position_uq').on(table.examAttemptId, table.position),
		index('attempt_question_order_question_idx').on(table.examQuestionId),
		check('attempt_question_order_position_ck', sql`${table.position} >= 0`)
	]
);

export const attemptAnswers = sqliteTable(
	'attempt_answers',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'cascade' }),
		examQuestionId: text('exam_question_id')
			.notNull()
			.references(() => examQuestions.id, { onDelete: 'restrict' }),
		examQuestionOptionId: text('exam_question_option_id').references(() => examQuestionOptions.id, {
			onDelete: 'restrict'
		}),
		answeredAt: text('answered_at').notNull(),
		isCorrectAtSubmission: integer('is_correct_at_submission', { mode: 'boolean' })
	},
	(table) => [
		uniqueIndex('attempt_answers_attempt_question_uq').on(
			table.examAttemptId,
			table.examQuestionId
		),
		index('attempt_answers_question_idx').on(table.examQuestionId),
		index('attempt_answers_option_idx').on(table.examQuestionOptionId)
	]
);

export const attemptExtensions = sqliteTable(
	'attempt_extensions',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'restrict' }),
		previousDeadlineAt: text('previous_deadline_at').notNull(),
		newDeadlineAt: text('new_deadline_at').notNull(),
		grantedByUserId: text('granted_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		grantedAt: text('granted_at').notNull(),
		reason: text('reason').notNull()
	},
	(table) => [
		index('attempt_extensions_attempt_idx').on(table.examAttemptId, table.grantedAt),
		check(
			'attempt_extensions_deadline_ck',
			sql`${table.newDeadlineAt} > ${table.previousDeadlineAt}`
		)
	]
);

export const attemptRecoveryGrants = sqliteTable(
	'attempt_recovery_grants',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'restrict' }),
		tokenHash: text('token_hash').notNull().unique(),
		grantedByUserId: text('granted_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		createdAt: text('created_at').notNull(),
		expiresAt: text('expires_at').notNull(),
		consumedAt: text('consumed_at'),
		revokedAt: text('revoked_at')
	},
	(table) => [
		index('attempt_recovery_grants_attempt_idx').on(table.examAttemptId, table.createdAt),
		check('attempt_recovery_grants_expiry_ck', sql`${table.expiresAt} > ${table.createdAt}`),
		check(
			'attempt_recovery_grants_terminal_ck',
			sql`${table.consumedAt} is null or ${table.revokedAt} is null`
		)
	]
);

export const questionInvalidations = sqliteTable(
	'question_invalidations',
	{
		id: text('id').primaryKey(),
		examQuestionId: text('exam_question_id')
			.notNull()
			.references(() => examQuestions.id, { onDelete: 'restrict' }),
		reasonCode: text('reason_code').notNull(),
		reasonDetail: text('reason_detail').notNull(),
		createdByUserId: text('created_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		createdAt: text('created_at').notNull()
	},
	(table) => [uniqueIndex('question_invalidations_question_uq').on(table.examQuestionId)]
);

export const attemptCorrectionEvents = sqliteTable(
	'attempt_correction_events',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'restrict' }),
		questionInvalidationId: text('question_invalidation_id')
			.notNull()
			.references(() => questionInvalidations.id, { onDelete: 'restrict' }),
		previousCorrectCount: integer('previous_correct_count').notNull(),
		previousDenominator: integer('previous_denominator').notNull(),
		correctedCorrectCount: integer('corrected_correct_count').notNull(),
		correctedDenominator: integer('corrected_denominator').notNull(),
		previousOutcome: text('previous_outcome').notNull(),
		correctedOutcome: text('corrected_outcome').notNull(),
		appliedByUserId: text('applied_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		appliedAt: text('applied_at').notNull()
	},
	(table) => [
		uniqueIndex('attempt_correction_events_attempt_invalidation_uq').on(
			table.examAttemptId,
			table.questionInvalidationId
		),
		index('attempt_correction_events_invalidation_idx').on(table.questionInvalidationId),
		check(
			'attempt_correction_events_counts_ck',
			sql`${table.previousDenominator} > 0 and ${table.correctedDenominator} >= 0 and ${table.previousCorrectCount} between 0 and ${table.previousDenominator} and ${table.correctedCorrectCount} between 0 and ${table.correctedDenominator}`
		),
		check(
			'attempt_correction_events_outcome_ck',
			sql`${table.previousOutcome} in ('satisfactory', 'unsatisfactory') and ${table.correctedOutcome} in ('satisfactory', 'unsatisfactory')`
		)
	]
);

export const remediationSessions = sqliteTable(
	'remediation_sessions',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'restrict' }),
		openedByUserId: text('opened_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		status: text('status').notNull().default('open'),
		openedAt: text('opened_at').notNull(),
		completedAt: text('completed_at'),
		waivedAt: text('waived_at'),
		waivedByUserId: text('waived_by_user_id').references(() => users.id, { onDelete: 'restrict' }),
		waiverReason: text('waiver_reason')
	},
	(table) => [
		index('remediation_sessions_attempt_idx').on(table.examAttemptId, table.status),
		check(
			'remediation_sessions_status_ck',
			sql`${table.status} in ('open', 'completed', 'waived')`
		),
		check(
			'remediation_sessions_terminal_ck',
			sql`(${table.status} = 'open' and ${table.completedAt} is null and ${table.waivedAt} is null) or (${table.status} = 'completed' and ${table.completedAt} is not null and ${table.waivedAt} is null) or (${table.status} = 'waived' and ${table.waivedAt} is not null and ${table.waivedByUserId} is not null and ${table.waiverReason} is not null)`
		)
	]
);

export const retrainingAssignments = sqliteTable(
	'retraining_assignments',
	{
		id: text('id').primaryKey(),
		examAttemptId: text('exam_attempt_id')
			.notNull()
			.references(() => examAttempts.id, { onDelete: 'restrict' }),
		assignedByUserId: text('assigned_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		assignedAt: text('assigned_at').notNull(),
		status: text('status').notNull().default('assigned'),
		completedAt: text('completed_at')
	},
	(table) => [
		index('retraining_assignments_attempt_idx').on(table.examAttemptId),
		check(
			'retraining_assignments_status_ck',
			sql`${table.status} in ('assigned', 'completed', 'cancelled')`
		)
	]
);

export const retentionHolds = sqliteTable(
	'retention_holds',
	{
		id: text('id').primaryKey(),
		entityType: text('entity_type').notNull(),
		entityId: text('entity_id').notNull(),
		reason: text('reason').notNull(),
		placedByUserId: text('placed_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		placedAt: text('placed_at').notNull(),
		releasedByUserId: text('released_by_user_id').references(() => users.id, {
			onDelete: 'restrict'
		}),
		releasedAt: text('released_at')
	},
	(table) => [
		index('retention_holds_entity_idx').on(table.entityType, table.entityId, table.releasedAt),
		check(
			'retention_holds_release_ck',
			sql`(${table.releasedAt} is null and ${table.releasedByUserId} is null) or (${table.releasedAt} is not null and ${table.releasedByUserId} is not null)`
		)
	]
);

export const generatedExports = sqliteTable(
	'generated_exports',
	{
		id: text('id').primaryKey(),
		requestedByUserId: text('requested_by_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		exportType: text('export_type').notNull(),
		status: text('status').notNull().default('pending'),
		createdAt: text('created_at').notNull(),
		expiresAt: text('expires_at').notNull(),
		deletedAt: text('deleted_at')
	},
	(table) => [
		index('generated_exports_expiry_idx').on(table.status, table.expiresAt),
		check(
			'generated_exports_status_ck',
			sql`${table.status} in ('pending', 'ready', 'failed', 'deleted')`
		),
		check('generated_exports_expiry_ck', sql`${table.expiresAt} > ${table.createdAt}`)
	]
);
