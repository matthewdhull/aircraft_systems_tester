import type Database from 'better-sqlite3';

import { QUARANTINE_REASON_CODES, SOURCE_TABLES } from '$lib/server/db/schema.js';
import { importedId } from '$lib/server/migration/importer/identifiers.js';
import {
	APPROVED_SOURCE_CHECKSUMS,
	EXPECTED_SOURCE_DISPOSITIONS
} from '$lib/server/migration/reconciliation/contracts.js';

import {
	IMPORTED_FUTURE_LINK_STATUSES,
	IMPORTED_QUESTION_GENERATION_STATUSES,
	IMPORTED_QUESTION_LIFECYCLES,
	IMPORTED_QUESTION_TYPES,
	QUESTION_IMPORT_RECONCILIATION_SCHEMA_VERSION,
	QuestionImportReconciliationError,
	type QuestionImportCheck,
	type QuestionImportReconciliationReport
} from './contracts.js';

type Row = Record<string, unknown>;

function count(
	sqlite: Database.Database,
	sql: string,
	parameters: readonly unknown[] = []
): number {
	return Number(
		sqlite
			.prepare(sql)
			.pluck()
			.get(...parameters) ?? 0
	);
}

function groupedCounts(
	sqlite: Database.Database,
	sql: string,
	parameters: readonly unknown[] = []
): Record<string, number> {
	const rows = sqlite.prepare(sql).all(...parameters) as Array<{
		key: string | null;
		value: number;
	}>;
	return Object.fromEntries(rows.map((row) => [row.key ?? 'unspecified', Number(row.value)]));
}

function completeCounts(
	allowed: readonly string[],
	observed: Record<string, number>
): Record<string, number> {
	const result: Record<string, number> = Object.fromEntries(allowed.map((key) => [key, 0]));
	let unrecognized = 0;
	for (const [key, value] of Object.entries(observed)) {
		if (allowed.includes(key)) result[key] = value;
		else unrecognized += value;
	}
	if (unrecognized > 0) result.unrecognized = unrecognized;
	return result;
}

function check(name: string, violationCount: number): QuestionImportCheck {
	return { name, passed: violationCount === 0, violationCount };
}

function hasColumn(sqlite: Database.Database, table: string, column: string): boolean {
	const columns = sqlite
		.prepare(`pragma table_info("${table.replaceAll('"', '""')}")`)
		.all() as Array<{
		name: string;
	}>;
	return columns.some((item) => item.name === column);
}

function getRun(sqlite: Database.Database, requestedRunId?: string): Row {
	if (requestedRunId) {
		const row = sqlite.prepare('select * from import_runs where id = ?').get(requestedRunId) as
			Row | undefined;
		if (row) return row;
		throw new Error('Missing import run.');
	}
	const rows = sqlite
		.prepare('select * from import_runs order by started_at desc, id desc limit 2')
		.all() as Row[];
	if (rows.length !== 1) throw new Error('Ambiguous import run.');
	return rows[0]!;
}

const IMPORTED_VERSION_CTE = `
	with imported_versions as (
		select mapping.source_id, mapping.target_id as version_id
		from source_target_mappings mapping
		where mapping.import_run_id = ?
		  and mapping.source_table = 'questions'
		  and mapping.target_table = 'question_versions'
		  and mapping.mapping_kind = 'version'
	)`;

function inventoryViolationCount(sqlite: Database.Database, runId: string): number {
	const rows = sqlite
		.prepare(
			`select source_table, disposition
			 from source_table_inventories
			 where import_run_id = ?`
		)
		.all(runId) as Array<{ source_table: string; disposition: string }>;
	const observed = new Map(rows.map((row) => [row.source_table, row.disposition]));
	let violations = rows.filter(
		(row) => !SOURCE_TABLES.includes(row.source_table as (typeof SOURCE_TABLES)[number])
	).length;
	for (const table of SOURCE_TABLES) {
		if (observed.get(table) !== EXPECTED_SOURCE_DISPOSITIONS[table]) violations += 1;
	}
	return violations;
}

function deterministicIdentityViolations(sqlite: Database.Database, runId: string): number {
	const rows = sqlite
		.prepare(
			`select source_id, target_table, target_id
			 from source_target_mappings
			 where import_run_id = ? and source_table = 'questions'
			   and target_table in ('questions', 'question_versions')`
		)
		.all(runId) as Array<{ source_id: string; target_table: string; target_id: string }>;
	let violations = 0;
	for (const row of rows) {
		if (row.target_id !== importedId('questions', row.source_id, row.target_table)) violations += 1;
	}
	return violations;
}

function canonicalShapeViolations(sqlite: Database.Database, runId: string): number {
	return count(
		sqlite,
		`${IMPORTED_VERSION_CTE}, option_stats as (
			select imported.version_id,
			       count(options.id) as option_count,
			       coalesce(sum(options.is_correct), 0) as correct_count,
			       count(distinct trim(options.option_text)) as distinct_count,
			       coalesce(sum(case when length(trim(options.option_text)) = 0 then 1 else 0 end), 0) as blank_count,
			       coalesce(sum(case when options.semantic_value = 'true' then 1 else 0 end), 0) as true_count,
			       coalesce(sum(case when options.semantic_value = 'false' then 1 else 0 end), 0) as false_count,
			       coalesce(sum(case when options.semantic_value = 'compound' then 1 else 0 end), 0) as compound_count,
			       coalesce(sum(case when options.semantic_value = 'all' then 1 else 0 end), 0) as all_count,
			       coalesce(sum(case when options.semantic_value = 'none' then 1 else 0 end), 0) as none_count,
			       coalesce(sum(case when options.semantic_value is null then 1 else 0 end), 0) as null_semantic_count,
			       coalesce(sum(case when options.semantic_value = 'true' and trim(options.option_text) = 'True' then 1 else 0 end), 0) as canonical_true_count,
			       coalesce(sum(case when options.semantic_value = 'false' and trim(options.option_text) = 'False' then 1 else 0 end), 0) as canonical_false_count,
			       coalesce(min(options.position), -1) as minimum_position,
			       coalesce(max(options.position), -1) as maximum_position
			from imported_versions imported
			left join question_options options on options.question_version_id = imported.version_id
			group by imported.version_id
		)
		select count(*)
		from imported_versions imported
		join question_versions versions on versions.id = imported.version_id
		join option_stats stats on stats.version_id = imported.version_id
		where stats.blank_count > 0
		   or stats.distinct_count <> stats.option_count
		   or stats.minimum_position <> 0
		   or stats.maximum_position <> stats.option_count - 1
		   or case versions.question_type
			when 'true_false' then not (
				stats.option_count = 2 and stats.correct_count = 1 and
				stats.true_count = 1 and stats.false_count = 1 and
				stats.canonical_true_count = 1 and stats.canonical_false_count = 1)
			when 'single_choice' then not (
				stats.option_count = 4 and stats.correct_count = 1 and stats.null_semantic_count = 4)
			when 'two_correct_compound' then not (
				stats.option_count = 3 and stats.correct_count = 2 and stats.compound_count = 3)
			when 'all_correct' then not (
				stats.option_count = 3 and stats.correct_count = 3 and stats.all_count = 3)
			when 'none_correct' then not (
				stats.option_count = 3 and stats.correct_count = 0 and stats.none_count = 3)
			else 1
		   end`,
		[runId]
	);
}

function promptViolations(sqlite: Database.Database, runId: string): number {
	return count(
		sqlite,
		`${IMPORTED_VERSION_CTE}, prompt_stats as (
			select imported.version_id,
			       count(prompts.id) as prompt_count,
			       count(distinct trim(prompts.prompt_text)) as distinct_count,
			       coalesce(sum(case when length(trim(prompts.prompt_text)) = 0 then 1 else 0 end), 0) as blank_count,
			       coalesce(sum(case when length(trim(prompts.prompt_text)) > 4000 then 1 else 0 end), 0) as oversized_count,
			       coalesce(min(prompts.position), -1) as minimum_position,
			       coalesce(max(prompts.position), -1) as maximum_position
			from imported_versions imported
			left join question_prompts prompts on prompts.question_version_id = imported.version_id
			group by imported.version_id
		)
		select count(*) from prompt_stats
		where prompt_count < 1 or blank_count > 0 or oversized_count > 0 or distinct_count <> prompt_count
		   or minimum_position <> 0 or maximum_position <> prompt_count - 1`,
		[runId]
	);
}

function reconcileUnsafe(
	sqlite: Database.Database,
	options: { importRunId?: string }
): QuestionImportReconciliationReport {
	const run = getRun(sqlite, options.importRunId);
	const runId = String(run.id);
	const inventory = sqlite
		.prepare(
			`select source_count, accepted_count, quarantined_count
			 from source_table_inventories
			 where import_run_id = ? and source_table = 'questions'`
		)
		.get(runId) as
		{ source_count: number; accepted_count: number; quarantined_count: number } | undefined;
	if (!inventory) throw new Error('Missing question inventory.');

	const sourceCount = Number(inventory.source_count);
	const acceptedCount = Number(inventory.accepted_count);
	const quarantinedCount = Number(inventory.quarantined_count);
	const unreconciled = sourceCount - acceptedCount - quarantinedCount;
	const inventoryCount = count(
		sqlite,
		'select count(*) from source_table_inventories where import_run_id = ?',
		[runId]
	);
	const dispositionViolations = inventoryViolationCount(sqlite, runId);
	const overlapCount = count(
		sqlite,
		`select count(distinct mapping.source_id)
		 from source_target_mappings mapping
		 join quarantine_records quarantine
		   on quarantine.import_run_id = mapping.import_run_id
		  and quarantine.source_table = mapping.source_table
		  and quarantine.source_id = mapping.source_id
		 where mapping.import_run_id = ? and mapping.source_table = 'questions'`,
		[runId]
	);
	const actualQuarantineCount = count(
		sqlite,
		`select count(*) from quarantine_records
		 where import_run_id = ? and source_table = 'questions'`,
		[runId]
	);

	const identityCount = count(
		sqlite,
		`select count(*) from source_target_mappings
		 where import_run_id = ? and source_table = 'questions'
		   and target_table = 'questions' and mapping_kind = 'direct'`,
		[runId]
	);
	const versionCount = count(
		sqlite,
		`select count(*) from source_target_mappings
		 where import_run_id = ? and source_table = 'questions'
		   and target_table = 'question_versions' and mapping_kind = 'version'`,
		[runId]
	);
	const missingTargetCount = count(
		sqlite,
		`select count(*) from source_target_mappings mapping
		 left join question_versions versions on versions.id = mapping.target_id
		 where mapping.import_run_id = ? and mapping.source_table = 'questions'
		   and mapping.target_table = 'question_versions' and versions.id is null`,
		[runId]
	);
	const identityRelationshipViolationCount = count(
		sqlite,
		`select count(*)
		 from source_target_mappings identity_mapping
		 join source_target_mappings version_mapping
		   on version_mapping.import_run_id = identity_mapping.import_run_id
		  and version_mapping.source_table = identity_mapping.source_table
		  and version_mapping.source_id = identity_mapping.source_id
		  and version_mapping.target_table = 'question_versions'
		 left join questions identities on identities.id = identity_mapping.target_id
		 left join question_versions versions on versions.id = version_mapping.target_id
		 where identity_mapping.import_run_id = ?
		   and identity_mapping.source_table = 'questions'
		   and identity_mapping.target_table = 'questions'
		   and (identities.id is null or versions.id is null
		        or versions.question_id <> identity_mapping.target_id)`,
		[runId]
	);
	const deterministicViolations = deterministicIdentityViolations(sqlite, runId);
	const reviewedAtCondition = hasColumn(sqlite, 'question_versions', 'reviewed_at')
		? 'or versions.reviewed_at is not null'
		: '';
	const provenanceViolations = count(
		sqlite,
		`${IMPORTED_VERSION_CTE}
		 select count(*)
		 from imported_versions imported
		 join question_versions versions on versions.id = imported.version_id
		 where versions.version <> 1
		    or versions.authored_by_user_id is not null
		    or versions.reviewed_by_user_id is not null
		    ${reviewedAtCondition}
		    or versions.submitted_at is not null
		    or versions.published_at is not null
		    or versions.effective_from is not null
		    or versions.effective_to is not null
		    or versions.retired_at is not null`,
		[runId]
	);

	const byType = completeCounts(
		IMPORTED_QUESTION_TYPES,
		groupedCounts(
			sqlite,
			`${IMPORTED_VERSION_CTE}
			 select versions.question_type as key, count(*) as value
			 from imported_versions imported
			 join question_versions versions on versions.id = imported.version_id
			 group by versions.question_type order by versions.question_type`,
			[runId]
		)
	);
	const byLifecycle = completeCounts(
		IMPORTED_QUESTION_LIFECYCLES,
		groupedCounts(
			sqlite,
			`${IMPORTED_VERSION_CTE}
			 select versions.lifecycle as key, count(*) as value
			 from imported_versions imported
			 join question_versions versions on versions.id = imported.version_id
			 group by versions.lifecycle order by versions.lifecycle`,
			[runId]
		)
	);
	const byGenerationStatus = completeCounts(
		IMPORTED_QUESTION_GENERATION_STATUSES,
		groupedCounts(
			sqlite,
			`${IMPORTED_VERSION_CTE}
			 select versions.generation_status as key, count(*) as value
			 from imported_versions imported
			 join question_versions versions on versions.id = imported.version_id
			 group by versions.generation_status order by versions.generation_status`,
			[runId]
		)
	);
	const byAircraftVariant = groupedCounts(
		sqlite,
		`${IMPORTED_VERSION_CTE}
		 select variants.code as key, count(*) as value
		 from imported_versions imported
		 join question_aircraft_applicability applicability
		   on applicability.question_version_id = imported.version_id
		 join aircraft_variants variants on variants.id = applicability.aircraft_variant_id
		 group by variants.code order by variants.code`,
		[runId]
	);
	const aircraftLinkCount = Object.values(byAircraftVariant).reduce((sum, value) => sum + value, 0);

	const legacyCounts = sqlite
		.prepare(
			`${IMPORTED_VERSION_CTE}
			 select count(links.question_version_id) as link_count,
			        count(distinct links.question_version_id) as linked_version_count,
			        count(distinct links.legacy_tpo_id) as tpo_count,
			        count(distinct links.legacy_spo_id) as spo_count,
			        count(distinct links.legacy_eo_id) as eo_count
			 from imported_versions imported
			 left join question_legacy_curriculum_links links
			   on links.question_version_id = imported.version_id`
		)
		.get(runId) as Record<string, number>;
	const parentViolationCount = count(
		sqlite,
		`${IMPORTED_VERSION_CTE}
		 select count(*)
		 from imported_versions imported
		 join question_legacy_curriculum_links links on links.question_version_id = imported.version_id
		 left join legacy_eos eos on eos.id = links.legacy_eo_id
		 left join legacy_spos spos on spos.id = links.legacy_spo_id
		 left join legacy_tpos tpos on tpos.id = links.legacy_tpo_id
		 where eos.id is null or spos.id is null or tpos.id is null
		    or eos.legacy_spo_id <> links.legacy_spo_id
		    or spos.legacy_tpo_id <> links.legacy_tpo_id`,
		[runId]
	);

	const futureByStatus = completeCounts(
		IMPORTED_FUTURE_LINK_STATUSES,
		groupedCounts(
			sqlite,
			`${IMPORTED_VERSION_CTE}
			 select links.mapping_status as key, count(*) as value
			 from imported_versions imported
			 join question_future_curriculum_links links
			   on links.question_version_id = imported.version_id
			 group by links.mapping_status order by links.mapping_status`,
			[runId]
		)
	);
	const futureLinkCount = Object.values(futureByStatus).reduce((sum, value) => sum + value, 0);
	const questionReasonCounts = completeCounts(
		QUARANTINE_REASON_CODES,
		groupedCounts(
			sqlite,
			`select reason_code as key, count(*) as value
			 from quarantine_records
			 where import_run_id = ? and source_table = 'questions'
			 group by reason_code order by reason_code`,
			[runId]
		)
	);

	const shapeViolations = canonicalShapeViolations(sqlite, runId);
	const importedPromptViolations = promptViolations(sqlite, runId);
	const legacyLinkCount = Number(legacyCounts.link_count ?? 0);
	const linkedVersionCount = Number(legacyCounts.linked_version_count ?? 0);
	const lifecycleViolations = versionCount - Number(byLifecycle.review ?? 0);
	const generationViolations = versionCount - Number(byGenerationStatus.blocked ?? 0);
	const mappingViolations =
		Math.abs(identityCount - acceptedCount) +
		Math.abs(versionCount - acceptedCount) +
		missingTargetCount +
		identityRelationshipViolationCount;
	const aircraftViolations = Math.abs(aircraftLinkCount - versionCount);
	const legacyLinkViolations =
		Math.abs(legacyLinkCount - versionCount) + Math.abs(linkedVersionCount - versionCount);

	const checks = [
		check('import run completed', String(run.status) === 'completed' ? 0 : 1),
		check(
			'import source checksum is approved',
			APPROVED_SOURCE_CHECKSUMS.includes(
				String(run.source_checksum) as (typeof APPROVED_SOURCE_CHECKSUMS)[number]
			)
				? 0
				: 1
		),
		check('all source dispositions remain intact', dispositionViolations),
		check('question source outcomes reconcile exactly', Math.abs(unreconciled)),
		check(
			'question quarantine inventory matches safe reason records',
			Math.abs(quarantinedCount - actualQuarantineCount)
		),
		check('accepted and quarantined question outcomes are disjoint', overlapCount),
		check('accepted question mappings are complete', mappingViolations),
		check('imported UUIDv5 identities remain deterministic', deterministicViolations),
		check('imported versions retain provenance fields', provenanceViolations),
		check('imported question shapes satisfy the canonical contract', shapeViolations),
		check('imported prompts satisfy the canonical contract', importedPromptViolations),
		check('imported aircraft applicability is complete', aircraftViolations),
		check('imported legacy curriculum links are complete', legacyLinkViolations),
		check('imported legacy curriculum parent chains are valid', parentViolationCount),
		check('imported versions remain in review', lifecycleViolations),
		check('imported versions remain generation blocked', generationViolations),
		check('imported versions have zero future curriculum links', futureLinkCount),
		check(
			'imported versions have zero eligible generation states',
			Number(byGenerationStatus.eligible ?? 0)
		)
	];

	return {
		schemaVersion: QUESTION_IMPORT_RECONCILIATION_SCHEMA_VERSION,
		source: {
			checksum: String(run.source_checksum),
			importerVersion: /^[0-9A-Za-z._-]{1,32}$/.test(String(run.importer_version))
				? String(run.importer_version)
				: 'unrecognized',
			status: ['started', 'completed'].includes(String(run.status))
				? String(run.status)
				: 'unrecognized'
		},
		inventory: { tableCount: inventoryCount, dispositionViolationCount: dispositionViolations },
		outcomes: {
			source: sourceCount,
			accepted: acceptedCount,
			quarantined: quarantinedCount,
			unreconciled,
			acceptedQuarantineOverlapCount: overlapCount
		},
		questions: {
			identityCount,
			versionCount,
			byType,
			byAircraftVariant,
			byLifecycle,
			byGenerationStatus,
			legacyCurriculum: {
				linkCount: legacyLinkCount,
				linkedVersionCount,
				tpoCount: Number(legacyCounts.tpo_count ?? 0),
				spoCount: Number(legacyCounts.spo_count ?? 0),
				eoCount: Number(legacyCounts.eo_count ?? 0),
				parentViolationCount
			},
			futureCurriculum: { linkCount: futureLinkCount, byReviewStatus: futureByStatus }
		},
		quarantine: { totalCount: actualQuarantineCount, byReason: questionReasonCounts },
		checks,
		passed: checks.every((item) => item.passed)
	};
}

export function reconcileImportedQuestions(
	sqlite: Database.Database,
	options: { importRunId?: string } = {}
): QuestionImportReconciliationReport {
	try {
		return reconcileUnsafe(sqlite, options);
	} catch (error) {
		if (error instanceof QuestionImportReconciliationError) throw error;
		throw new QuestionImportReconciliationError();
	}
}
