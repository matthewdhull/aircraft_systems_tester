import { createHash } from 'node:crypto';

import type { FoundationDatabase } from '$lib/server/db/database.js';
import type {
	CapacityResult,
	LegacyTemplateSourceDto,
	MandatoryElementRequirementDto,
	TemplateDependencyResult,
	TemplateAuthoringOptions,
	TemplateLifecycle,
	TemplateRuleDto,
	TemplateVersionDto
} from './types.js';

interface VersionRow {
	templateId: string;
	versionId: string;
	version: number;
	name: string;
	aircraftVariantId: string;
	aircraftLabel: string;
	courseTypeId: string | null;
	courseTypeLabel: string | null;
	configuredLength: number;
	allottedMinutes: number;
	lifecycle: TemplateLifecycle;
	authoredByUserId: string | null;
	reviewedByUserId: string | null;
	createdAt: string;
	submittedAt: string | null;
	reviewedAt: string | null;
	publishedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	retiredAt: string | null;
}

const VERSION_SELECT = `SELECT v.test_template_id AS templateId, v.id AS versionId, v.version,
	v.name, v.aircraft_variant_id AS aircraftVariantId,
	a.code || ' — ' || a.name AS aircraftLabel,
	v.course_type_id AS courseTypeId, CASE WHEN c.id IS NULL THEN NULL ELSE c.code || ' — ' || c.name END AS courseTypeLabel,
	v.configured_length AS configuredLength, v.allotted_minutes AS allottedMinutes, v.lifecycle,
	v.authored_by_user_id AS authoredByUserId, v.reviewed_by_user_id AS reviewedByUserId,
	v.created_at AS createdAt, v.submitted_at AS submittedAt, v.reviewed_at AS reviewedAt,
	v.published_at AS publishedAt, v.effective_from AS effectiveFrom,
	v.effective_to AS effectiveTo, v.retired_at AS retiredAt
	FROM test_template_versions v JOIN aircraft_variants a ON a.id = v.aircraft_variant_id
	LEFT JOIN course_types c ON c.id = v.course_type_id`;

function rules(tx: FoundationDatabase, versionId: string): TemplateRuleDto[] {
	return tx.$client
		.prepare(
			`SELECT r.id, r.position, r.subtask_version_id AS subtaskVersionId,
			 s.name AS subtaskName, r.question_count AS count
			 FROM test_template_rules r JOIN subtask_versions s ON s.id = r.subtask_version_id
			 WHERE r.test_template_version_id = ? ORDER BY r.position, r.id`
		)
		.all(versionId) as TemplateRuleDto[];
}

function mandatory(tx: FoundationDatabase, versionId: string): MandatoryElementRequirementDto[] {
	return tx.$client
		.prepare(
			`SELECT r.position, r.element_version_id AS elementVersionId, e.name AS elementName,
			 r.subtask_version_id AS subtaskVersionId
			 FROM test_template_required_elements r JOIN element_versions e ON e.id = r.element_version_id
			 WHERE r.test_template_version_id = ? ORDER BY r.position, r.element_version_id`
		)
		.all(versionId) as MandatoryElementRequirementDto[];
}

function dto(tx: FoundationDatabase, row: VersionRow): TemplateVersionDto {
	return {
		...row,
		rules: rules(tx, row.versionId),
		mandatoryElements: mandatory(tx, row.versionId)
	};
}

export function findTemplateVersion(
	tx: FoundationDatabase,
	versionId: string
): TemplateVersionDto | null {
	const row = tx.$client.prepare(`${VERSION_SELECT} WHERE v.id = ?`).get(versionId) as
		VersionRow | undefined;
	return row ? dto(tx, row) : null;
}

export function latestTemplateVersion(
	tx: FoundationDatabase,
	templateId: string
): TemplateVersionDto | null {
	const row = tx.$client
		.prepare(`${VERSION_SELECT} WHERE v.test_template_id = ? ORDER BY v.version DESC LIMIT 1`)
		.get(templateId) as VersionRow | undefined;
	return row ? dto(tx, row) : null;
}

export function listTemplateVersions(tx: FoundationDatabase): TemplateVersionDto[] {
	const rows = tx.$client
		.prepare(
			`${VERSION_SELECT} JOIN (SELECT test_template_id, max(version) latest FROM test_template_versions GROUP BY test_template_id) latest
			 ON latest.test_template_id = v.test_template_id AND latest.latest = v.version
			 ORDER BY lower(v.name), v.test_template_id`
		)
		.all() as VersionRow[];
	return rows.map((row) => dto(tx, row));
}

export function templateDependency(
	tx: FoundationDatabase,
	versionId: string
): TemplateDependencyResult {
	const row = tx.$client
		.prepare(
			`SELECT (SELECT count(*) FROM exam_instances WHERE test_template_version_id = ?) AS examCount,
			 (SELECT count(*) FROM test_template_versions WHERE test_template_id =
			  (SELECT test_template_id FROM test_template_versions WHERE id = ?) AND lifecycle IN ('published','retired')) AS publishedVersionCount`
		)
		.get(versionId, versionId) as { examCount: number; publishedVersionCount: number };
	const value = {
		...row,
		blocksHardDelete: row.examCount > 0,
		requiresRetirement: row.examCount > 0
	};
	return {
		...value,
		revision: createHash('sha256').update(JSON.stringify(value)).digest('hex')
	};
}

function effective(alias: string, now: string): string {
	const safeNow = now.replaceAll("'", "''");
	return `${alias}.status = 'published' AND ${alias}.effective_from IS NOT NULL AND ${alias}.effective_from <= '${safeNow}' AND (${alias}.effective_to IS NULL OR ${alias}.effective_to > '${safeNow}')`;
}

export function validateCurriculum(
	tx: FoundationDatabase,
	ruleInputs: readonly { subtaskVersionId: string }[],
	mandatoryInputs: readonly { elementVersionId: string; subtaskVersionId: string }[],
	now: string
): boolean {
	for (const rule of ruleInputs) {
		const valid = tx.$client
			.prepare(
				`SELECT 1 FROM subtask_versions s JOIN task_versions t ON t.id=s.task_version_id
				 JOIN phase_versions p ON p.id=t.phase_version_id
				 WHERE s.id=? AND ${effective('s', now)} AND ${effective('t', now)} AND ${effective('p', now)}`
			)
			.get(rule.subtaskVersionId);
		if (!valid) return false;
	}
	for (const requirement of mandatoryInputs) {
		const valid = tx.$client
			.prepare(
				`SELECT 1 FROM element_versions e WHERE id=? AND subtask_version_id=? AND ${effective('e', now)}`
			)
			.get(requirement.elementVersionId, requirement.subtaskVersionId);
		if (!valid) return false;
	}
	return true;
}

export function capacity(
	tx: FoundationDatabase,
	template: TemplateVersionDto,
	now: string
): CapacityResult {
	const ruleCapacity = template.rules.map((rule) => ({
		ruleId: rule.id,
		needed: rule.count,
		available: Number(
			tx.$client
				.prepare(
					`SELECT count(DISTINCT qv.id) FROM question_versions qv
					 JOIN question_aircraft_applicability qa ON qa.question_version_id=qv.id AND qa.aircraft_variant_id=?
					 JOIN question_future_curriculum_links qf ON qf.question_version_id=qv.id AND qf.subtask_version_id=? AND qf.mapping_status='approved'
					 WHERE qv.lifecycle='published' AND qv.generation_status='eligible'
					 AND qv.effective_from<=? AND (qv.effective_to IS NULL OR qv.effective_to>?)`
				)
				.pluck()
				.get(template.aircraftVariantId, rule.subtaskVersionId, now, now)
		)
	}));
	const mandatoryCapacity = template.mandatoryElements.map((item) => ({
		elementVersionId: item.elementVersionId,
		needed: 1 as const,
		available: Number(
			tx.$client
				.prepare(
					`SELECT count(DISTINCT qv.id) FROM question_versions qv
					 JOIN question_aircraft_applicability qa ON qa.question_version_id=qv.id AND qa.aircraft_variant_id=?
					 JOIN question_future_curriculum_links qf ON qf.question_version_id=qv.id AND qf.subtask_version_id=?
					  AND qf.element_version_id=? AND qf.mapping_status='approved'
					 WHERE qv.lifecycle='published' AND qv.generation_status='eligible'
					 AND qv.effective_from<=? AND (qv.effective_to IS NULL OR qv.effective_to>?)`
				)
				.pluck()
				.get(template.aircraftVariantId, item.subtaskVersionId, item.elementVersionId, now, now)
		)
	}));
	const shortages = [
		...ruleCapacity
			.filter((item) => item.available < item.needed)
			.map((item) => ({ code: 'CATEGORY_SHORTAGE' as const, ...item })),
		...mandatoryCapacity
			.filter((item) => item.available < item.needed)
			.map((item) => ({ code: 'MANDATORY_ELEMENT_SHORTAGE' as const, ...item }))
	];
	return {
		status: shortages.length ? 'insufficient' : 'sufficient',
		ruleCapacity,
		mandatoryCapacity,
		shortages
	};
}

export function listLegacySources(tx: FoundationDatabase): LegacyTemplateSourceDto[] {
	return tx.$client
		.prepare(
			`SELECT id, source_table AS sourceKind, source_id AS sourceId, logical_name AS logicalName,
			 configured_length AS configuredLength, reconciliation_state AS reconciliationState,
			 mapped_template_version_id AS mappedTemplateVersionId
			 FROM legacy_template_sources ORDER BY source_table, source_id, id`
		)
		.all() as LegacyTemplateSourceDto[];
}

export function authoringOptions(tx: FoundationDatabase, now: string): TemplateAuthoringOptions {
	const aircraft = tx.$client
		.prepare(
			`SELECT id, code || ' — ' || name AS label FROM aircraft_variants WHERE status='active' AND effective_from<=? AND (effective_to IS NULL OR effective_to>?) ORDER BY code,id`
		)
		.all(now, now) as { id: string; label: string }[];
	const courseTypes = tx.$client
		.prepare(
			`SELECT id, code || ' — ' || name AS label FROM course_types WHERE status='active' AND effective_from<=? AND (effective_to IS NULL OR effective_to>?) ORDER BY code,id`
		)
		.all(now, now) as { id: string; label: string }[];
	const rows = tx.$client
		.prepare(
			`SELECT s.id AS subtaskId,s.name AS subtaskName,e.id AS elementId,e.name AS elementName
		FROM subtask_versions s JOIN task_versions t ON t.id=s.task_version_id JOIN phase_versions p ON p.id=t.phase_version_id
		LEFT JOIN element_versions e ON e.subtask_version_id=s.id AND e.status='published' AND e.effective_from<=? AND (e.effective_to IS NULL OR e.effective_to>?)
		WHERE s.status='published' AND s.effective_from<=? AND (s.effective_to IS NULL OR s.effective_to>?)
		AND t.status='published' AND t.effective_from<=? AND (t.effective_to IS NULL OR t.effective_to>?)
		AND p.status='published' AND p.effective_from<=? AND (p.effective_to IS NULL OR p.effective_to>?)
		ORDER BY p.position,t.position,s.position,e.position,e.id`
		)
		.all(now, now, now, now, now, now, now, now) as {
		subtaskId: string;
		subtaskName: string;
		elementId: string | null;
		elementName: string | null;
	}[];
	const grouped = new Map<
		string,
		{ id: string; label: string; elements: { id: string; label: string }[] }
	>();
	for (const row of rows) {
		const item = grouped.get(row.subtaskId) ?? {
			id: row.subtaskId,
			label: row.subtaskName,
			elements: []
		};
		if (row.elementId && row.elementName)
			item.elements.push({ id: row.elementId, label: row.elementName });
		grouped.set(row.subtaskId, item);
	}
	return { aircraft, courseTypes, subtasks: [...grouped.values()] };
}
