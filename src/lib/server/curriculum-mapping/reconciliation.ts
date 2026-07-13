import type { FoundationDatabase } from '$lib/server/db/database.js';
import {
	countRows,
	listMappings,
	mappingRepositoryConstants,
	sourceExistsWithValidChain,
	targetHasValidPublishedChain,
	targetIdentityExists
} from './repository.js';
import {
	CURRICULUM_NODE_TYPES,
	LEGACY_ENTITY_TYPES,
	MAPPING_STATUSES,
	type CurriculumMappingClock,
	type CurriculumNodeType,
	type CurriculumReconciliationReport,
	type LegacyEntityType,
	type MappingStatus,
	type ReconciliationCheck
} from './types.js';

function emptyStatuses(): Record<MappingStatus, number> {
	return { proposed: 0, approved: 0, rejected: 0, retired: 0 };
}

function groupedStatuses(
	tx: FoundationDatabase,
	column: 'legacy_entity_type' | 'target_entity_type',
	value: string
): Record<MappingStatus, number> {
	const result = emptyStatuses();
	const rows = tx.$client
		.prepare(
			`SELECT status, count(*) AS count FROM legacy_curriculum_mappings
			 WHERE ${column} = ? GROUP BY status ORDER BY status`
		)
		.all(value) as Array<{ status: MappingStatus; count: number }>;
	for (const row of rows) {
		if (MAPPING_STATUSES.includes(row.status)) result[row.status] = Number(row.count);
	}
	return result;
}

function check(name: ReconciliationCheck['name'], violationCount: number): ReconciliationCheck {
	return { name, passed: violationCount === 0, violationCount };
}

function unmappedCount(tx: FoundationDatabase, type: LegacyEntityType): number {
	const table = mappingRepositoryConstants.SOURCE_TABLE[type];
	return Number(
		tx.$client
			.prepare(
				`SELECT count(*) FROM ${table} source
				 WHERE NOT EXISTS (
				   SELECT 1 FROM legacy_curriculum_mappings mapping
				    WHERE mapping.legacy_entity_type = ?
				      AND mapping.legacy_entity_id = source.id
				      AND mapping.status = 'approved'
				 )`
			)
			.pluck()
			.get(type) ?? 0
	);
}

function conflictingApprovedMappings(tx: FoundationDatabase): number {
	return Number(
		tx.$client
			.prepare(
				`SELECT coalesce(sum(group_count - 1), 0)
				 FROM (
				   SELECT count(*) AS group_count
				   FROM legacy_curriculum_mappings
				   WHERE status = 'approved'
				   GROUP BY legacy_entity_type, legacy_entity_id, target_entity_type
				   HAVING count(*) > 1
				 )`
			)
			.pluck()
			.get() ?? 0
	);
}

function importerCreatedFutureNodes(tx: FoundationDatabase): number {
	const futureTables = [
		'phases',
		'phase_versions',
		'tasks',
		'task_versions',
		'subtasks',
		'subtask_versions',
		'elements',
		'element_versions',
		'bloom_levels',
		'bloom_verbs'
	];
	const placeholders = futureTables.map(() => '?').join(', ');
	return Number(
		tx.$client
			.prepare(
				`SELECT count(*) FROM source_target_mappings WHERE target_table IN (${placeholders})`
			)
			.pluck()
			.get(...futureTables) ?? 0
	);
}

function questionEligibilitySideEffects(tx: FoundationDatabase): number {
	return (
		countRows(tx, 'question_future_curriculum_links') +
		countRows(tx, 'question_versions', "WHERE generation_status = 'eligible'")
	);
}

export function reconcileCurriculumMappings(
	tx: FoundationDatabase,
	clock: CurriculumMappingClock
): CurriculumReconciliationReport {
	const now = clock.now();
	if (!Number.isFinite(now.getTime()))
		throw new TypeError('Invalid curriculum reconciliation clock.');
	const at = now.toISOString();
	const mappings = listMappings(tx);

	const legacyTotals = Object.fromEntries(
		LEGACY_ENTITY_TYPES.map((type) => [
			type,
			countRows(tx, mappingRepositoryConstants.SOURCE_TABLE[type])
		])
	) as Record<LegacyEntityType, number>;
	const unmappedBySourceType = Object.fromEntries(
		LEGACY_ENTITY_TYPES.map((type) => [type, unmappedCount(tx, type)])
	) as Record<LegacyEntityType, number>;
	const statusCounts = emptyStatuses();
	for (const mapping of mappings) statusCounts[mapping.status] += 1;
	const countsBySourceType = Object.fromEntries(
		LEGACY_ENTITY_TYPES.map((type) => [type, groupedStatuses(tx, 'legacy_entity_type', type)])
	) as Record<LegacyEntityType, Record<MappingStatus, number>>;
	const countsByTargetType = Object.fromEntries(
		CURRICULUM_NODE_TYPES.map((type) => [type, groupedStatuses(tx, 'target_entity_type', type)])
	) as Record<CurriculumNodeType, Record<MappingStatus, number>>;

	let invalidTargets = 0;
	let brokenSourceChains = 0;
	let brokenTargetChains = 0;
	for (const mapping of mappings) {
		const targetExists = targetIdentityExists(tx, mapping.targetEntityType, mapping.targetEntityId);
		if (!targetExists) invalidTargets += 1;
		if (!sourceExistsWithValidChain(tx, mapping.legacyEntityType, mapping.legacyEntityId)) {
			brokenSourceChains += 1;
		}
		if (
			mapping.status === 'approved' &&
			targetExists &&
			!targetHasValidPublishedChain(tx, mapping.targetEntityType, mapping.targetEntityId, at)
		) {
			brokenTargetChains += 1;
		}
	}

	const checks: ReconciliationCheck[] = [
		check('invalid_target_references', invalidTargets),
		check('conflicting_mappings', conflictingApprovedMappings(tx)),
		check('broken_source_parent_chains', brokenSourceChains),
		check('broken_target_parent_chains', brokenTargetChains),
		check('importer_created_future_nodes', importerCreatedFutureNodes(tx)),
		check('mapping_question_eligibility_side_effects', questionEligibilitySideEffects(tx))
	];
	return {
		generatedAt: at,
		legacyTotals,
		unmappedBySourceType,
		statusCounts,
		countsBySourceType,
		countsByTargetType,
		checks,
		passed: checks.every((item) => item.passed)
	};
}

export function renderCurriculumReconciliationJson(report: CurriculumReconciliationReport): string {
	return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderCurriculumReconciliationMarkdown(
	report: CurriculumReconciliationReport
): string {
	const statusRows = MAPPING_STATUSES.map(
		(status) => `| ${status} | ${report.statusCounts[status]} |`
	).join('\n');
	const checkRows = report.checks
		.map((item) => `| ${item.name} | ${item.passed ? 'PASS' : 'FAIL'} | ${item.violationCount} |`)
		.join('\n');
	return `# Curriculum Mapping Reconciliation\n\nGenerated: ${report.generatedAt}\n\nOverall: **${report.passed ? 'PASS' : 'FAIL'}**\n\n## Legacy coverage\n\n| Source type | Total | Unmapped |\n| --- | ---: | ---: |\n${LEGACY_ENTITY_TYPES.map((type) => `| ${type} | ${report.legacyTotals[type]} | ${report.unmappedBySourceType[type]} |`).join('\n')}\n\n## Mapping lifecycle\n\n| Status | Count |\n| --- | ---: |\n${statusRows}\n\n## Safety checks\n\n| Check | Result | Violations |\n| --- | --- | ---: |\n${checkRows}\n`;
}
