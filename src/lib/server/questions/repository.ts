import type { FoundationDatabase } from '$lib/server/db/database.js';
import type {
	AircraftApplicabilityDto,
	FutureCurriculumOptionDto,
	FutureLinkStatus,
	FutureQuestionLinkDto,
	LegacyQuestionLinkDto,
	PersistedQuestionOptionDto,
	QuestionLifecycle,
	QuestionPromptDto,
	QuestionType,
	QuestionVersionSummaryDto,
	SafeQuestionListItemDto
} from './types.js';

export interface QuestionVersionRow {
	id: string;
	questionId: string;
	version: number;
	questionType: QuestionType;
	lifecycle: QuestionLifecycle;
	generationStatus: 'blocked' | 'eligible';
	authoredByUserId: string | null;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	createdAt: string;
	submittedAt: string | null;
	publishedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	retiredAt: string | null;
	identityCreatedAt: string;
	identityRetiredAt: string | null;
}

const VERSION_COLUMNS = `v.id, v.question_id AS questionId, v.version,
	v.question_type AS questionType, v.lifecycle, v.generation_status AS generationStatus,
	v.authored_by_user_id AS authoredByUserId, v.reviewed_by_user_id AS reviewedByUserId,
	v.reviewed_at AS reviewedAt, v.created_at AS createdAt, v.submitted_at AS submittedAt,
	v.published_at AS publishedAt, v.effective_from AS effectiveFrom,
	v.effective_to AS effectiveTo, v.retired_at AS retiredAt,
	q.created_at AS identityCreatedAt, q.retired_at AS identityRetiredAt`;

export function findVersion(tx: FoundationDatabase, versionId: string): QuestionVersionRow | null {
	return (
		(tx.$client
			.prepare(
				`SELECT ${VERSION_COLUMNS} FROM question_versions v
				 JOIN questions q ON q.id = v.question_id WHERE v.id = ?`
			)
			.get(versionId) as QuestionVersionRow | undefined) ?? null
	);
}

export function findLatestVersion(
	tx: FoundationDatabase,
	questionId: string
): QuestionVersionRow | null {
	return (
		(tx.$client
			.prepare(
				`SELECT ${VERSION_COLUMNS} FROM question_versions v
				 JOIN questions q ON q.id = v.question_id WHERE v.question_id = ?
				 ORDER BY v.version DESC, v.id LIMIT 1`
			)
			.get(questionId) as QuestionVersionRow | undefined) ?? null
	);
}

export function maxVersion(tx: FoundationDatabase, questionId: string): number {
	return Number(
		tx.$client
			.prepare('SELECT coalesce(max(version), 0) FROM question_versions WHERE question_id = ?')
			.pluck()
			.get(questionId)
	);
}

export function versionCount(tx: FoundationDatabase, questionId: string): number {
	return Number(
		tx.$client
			.prepare('SELECT count(*) FROM question_versions WHERE question_id = ?')
			.pluck()
			.get(questionId)
	);
}

export function prompts(tx: FoundationDatabase, versionId: string): QuestionPromptDto[] {
	return tx.$client
		.prepare(
			`SELECT id, position, prompt_text AS text FROM question_prompts
			 WHERE question_version_id = ? ORDER BY position, id`
		)
		.all(versionId) as QuestionPromptDto[];
}

export function options(tx: FoundationDatabase, versionId: string): PersistedQuestionOptionDto[] {
	const rows = tx.$client
		.prepare(
			`SELECT id, position, option_text AS text, is_correct AS isCorrect,
			 semantic_value AS semanticValue FROM question_options
			 WHERE question_version_id = ? ORDER BY position, id`
		)
		.all(versionId) as Array<Omit<PersistedQuestionOptionDto, 'isCorrect'> & { isCorrect: number }>;
	return rows.map((row) => ({ ...row, isCorrect: row.isCorrect === 1 }));
}

export function aircraft(tx: FoundationDatabase, versionId: string): AircraftApplicabilityDto[] {
	return tx.$client
		.prepare(
			`SELECT a.id AS aircraftVariantId, a.code, a.name
			 FROM question_aircraft_applicability qa
			 JOIN aircraft_variants a ON a.id = qa.aircraft_variant_id
			 WHERE qa.question_version_id = ? ORDER BY a.code, a.id`
		)
		.all(versionId) as AircraftApplicabilityDto[];
}

export function legacyLinks(tx: FoundationDatabase, versionId: string): LegacyQuestionLinkDto[] {
	return tx.$client
		.prepare(
			`SELECT legacy_tpo_id AS legacyTpoId, legacy_spo_id AS legacySpoId,
			 legacy_eo_id AS legacyEoId FROM question_legacy_curriculum_links
			 WHERE question_version_id = ? ORDER BY legacy_tpo_id, legacy_spo_id, legacy_eo_id`
		)
		.all(versionId) as LegacyQuestionLinkDto[];
}

export function futureLinks(tx: FoundationDatabase, versionId: string): FutureQuestionLinkDto[] {
	return tx.$client
		.prepare(
			`SELECT question_version_id AS questionVersionId, subtask_version_id AS subtaskVersionId,
			 element_version_id AS elementVersionId, mapping_status AS status,
			 proposed_by_user_id AS proposedByUserId, proposed_at AS proposedAt,
			 reviewed_by_user_id AS reviewedByUserId, reviewed_at AS reviewedAt
			 FROM question_future_curriculum_links WHERE question_version_id = ?
			 ORDER BY subtask_version_id`
		)
		.all(versionId) as FutureQuestionLinkDto[];
}

export function summary(
	tx: FoundationDatabase,
	row: QuestionVersionRow
): QuestionVersionSummaryDto {
	const counts = tx.$client
		.prepare(
			`SELECT
			 (SELECT count(*) FROM question_prompts WHERE question_version_id = ?) AS promptCount,
			 (SELECT count(*) FROM question_aircraft_applicability WHERE question_version_id = ?) AS aircraftCount,
			 (SELECT count(*) FROM question_legacy_curriculum_links WHERE question_version_id = ?) AS legacyLinkCount,
			 (SELECT count(*) FROM question_future_curriculum_links WHERE question_version_id = ? AND mapping_status = 'review') AS reviewCount,
			 (SELECT count(*) FROM question_future_curriculum_links WHERE question_version_id = ? AND mapping_status = 'approved') AS approvedCount,
			 (SELECT count(*) FROM question_future_curriculum_links WHERE question_version_id = ? AND mapping_status = 'retired') AS retiredCount`
		)
		.get(row.id, row.id, row.id, row.id, row.id, row.id) as {
		promptCount: number;
		aircraftCount: number;
		legacyLinkCount: number;
		reviewCount: number;
		approvedCount: number;
		retiredCount: number;
	};
	return {
		id: row.id,
		questionId: row.questionId,
		version: row.version,
		questionType: row.questionType,
		lifecycle: row.lifecycle,
		generationStatus: row.generationStatus,
		authoredByUserId: row.authoredByUserId,
		reviewedByUserId: row.reviewedByUserId,
		createdAt: row.createdAt,
		submittedAt: row.submittedAt,
		publishedAt: row.publishedAt,
		effectiveFrom: row.effectiveFrom,
		effectiveTo: row.effectiveTo,
		retiredAt: row.retiredAt,
		promptCount: counts.promptCount,
		aircraftCount: counts.aircraftCount,
		legacyLinkCount: counts.legacyLinkCount,
		futureLinkCounts: {
			review: counts.reviewCount,
			approved: counts.approvedCount,
			retired: counts.retiredCount
		}
	};
}

export interface ParsedSearchQuery {
	search: string | null;
	types: readonly QuestionType[];
	lifecycles: readonly QuestionLifecycle[];
	generationStatuses: readonly ('blocked' | 'eligible')[];
	aircraftVariantIds: readonly string[];
	futureLinkStatuses: readonly FutureLinkStatus[];
	page: number;
	pageSize: number;
}

function inClause(
	column: string,
	values: readonly unknown[],
	where: string[],
	args: unknown[]
): void {
	if (values.length === 0) return;
	where.push(`${column} IN (${values.map(() => '?').join(', ')})`);
	args.push(...values);
}

export function searchVersions(
	tx: FoundationDatabase,
	query: ParsedSearchQuery
): { rows: QuestionVersionRow[]; total: number } {
	const where = ['rank = 1'];
	const args: unknown[] = [];
	inClause('questionType', query.types, where, args);
	inClause('lifecycle', query.lifecycles, where, args);
	inClause('generationStatus', query.generationStatuses, where, args);
	if (query.search) {
		where.push(
			`EXISTS (SELECT 1 FROM question_prompts qp WHERE qp.question_version_id = ranked_versions.id AND lower(qp.prompt_text) LIKE ? ESCAPE '\\')`
		);
		args.push(
			`%${query.search.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_').toLowerCase()}%`
		);
	}
	if (query.aircraftVariantIds.length) {
		where.push(
			`EXISTS (SELECT 1 FROM question_aircraft_applicability qa WHERE qa.question_version_id = ranked_versions.id AND qa.aircraft_variant_id IN (${query.aircraftVariantIds.map(() => '?').join(', ')}))`
		);
		args.push(...query.aircraftVariantIds);
	}
	if (query.futureLinkStatuses.length) {
		where.push(
			`EXISTS (SELECT 1 FROM question_future_curriculum_links qf WHERE qf.question_version_id = ranked_versions.id AND qf.mapping_status IN (${query.futureLinkStatuses.map(() => '?').join(', ')}))`
		);
		args.push(...query.futureLinkStatuses);
	}
	const cte = `WITH ranked_versions AS (
		SELECT ${VERSION_COLUMNS}, ROW_NUMBER() OVER (
		 PARTITION BY v.question_id ORDER BY v.version DESC, v.id
		) AS rank FROM question_versions v JOIN questions q ON q.id = v.question_id
	)`;
	const filter = where.join(' AND ');
	const total = Number(
		tx.$client
			.prepare(`${cte} SELECT count(*) FROM ranked_versions WHERE ${filter}`)
			.pluck()
			.get(...args)
	);
	const rows = tx.$client
		.prepare(
			`${cte} SELECT * FROM ranked_versions WHERE ${filter}
			 ORDER BY createdAt DESC, id LIMIT ? OFFSET ?`
		)
		.all(...args, query.pageSize, (query.page - 1) * query.pageSize) as QuestionVersionRow[];
	return { rows, total };
}

export function listItem(tx: FoundationDatabase, row: QuestionVersionRow): SafeQuestionListItemDto {
	const primary = tx.$client
		.prepare(
			`SELECT prompt_text FROM question_prompts WHERE question_version_id = ?
			 ORDER BY position, id LIMIT 1`
		)
		.pluck()
		.get(row.id);
	return {
		...summary(tx, row),
		primaryPrompt: typeof primary === 'string' ? primary : '',
		aircraft: aircraft(tx, row.id)
	};
}

export function aircraftOptions(tx: FoundationDatabase, now: string): AircraftApplicabilityDto[] {
	return tx.$client
		.prepare(
			`SELECT id AS aircraftVariantId, code, name FROM aircraft_variants
			 WHERE status = 'active' AND effective_from <= ?
			 AND (effective_to IS NULL OR effective_to > ?) ORDER BY code, id`
		)
		.all(now, now) as AircraftApplicabilityDto[];
}

export function futureCurriculumOptions(
	tx: FoundationDatabase,
	now: string
): FutureCurriculumOptionDto[] {
	return tx.$client
		.prepare(
			`WITH valid_subtasks AS (
			 SELECT sv.id AS subtaskVersionId, sv.name AS subtaskName,
			  pv.name || ' / ' || tv.name || ' / ' || sv.name AS ancestryLabel
			 FROM subtask_versions sv JOIN task_versions tv ON tv.id = sv.task_version_id
			 JOIN phase_versions pv ON pv.id = tv.phase_version_id
			 WHERE sv.status = 'published' AND sv.effective_from <= ?
			 AND (sv.effective_to IS NULL OR sv.effective_to > ?)
			 AND tv.status = 'published' AND tv.effective_from <= ?
			 AND (tv.effective_to IS NULL OR tv.effective_to > ?)
			 AND pv.status = 'published' AND pv.effective_from <= ?
			 AND (pv.effective_to IS NULL OR pv.effective_to > ?)
			 )
			 SELECT subtaskVersionId, subtaskName, NULL AS elementVersionId,
			  NULL AS elementName, ancestryLabel FROM valid_subtasks
			 UNION ALL
			 SELECT vs.subtaskVersionId, vs.subtaskName, ev.id AS elementVersionId,
			  ev.name AS elementName, vs.ancestryLabel || ' / ' || ev.name AS ancestryLabel
			 FROM valid_subtasks vs JOIN element_versions ev
			  ON ev.subtask_version_id = vs.subtaskVersionId
			 WHERE ev.status = 'published' AND ev.effective_from <= ?
			 AND (ev.effective_to IS NULL OR ev.effective_to > ?)
			 ORDER BY ancestryLabel, elementVersionId`
		)
		.all(now, now, now, now, now, now, now, now) as FutureCurriculumOptionDto[];
}
