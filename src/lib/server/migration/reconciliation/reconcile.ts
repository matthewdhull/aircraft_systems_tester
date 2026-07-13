import { createHash } from 'node:crypto';

import type Database from 'better-sqlite3';

import { QUARANTINE_REASON_CODES, SOURCE_TABLES } from '$lib/server/db/schema.js';

import {
	EXPECTED_SOURCE_DISPOSITIONS,
	MigrationReconciliationError,
	APPROVED_SOURCE_CHECKSUMS,
	RECONCILIATION_SCHEMA_VERSION,
	type LogicalComparison,
	type QuarantineReasonCode,
	type ReconciliationReport,
	type SafeCheck,
	type SourceTable
} from './contracts.js';

type Row = Record<string, unknown>;

const QUESTION_TYPES = [
	'true_false',
	'single_choice',
	'two_correct_compound',
	'all_correct',
	'none_correct'
] as const;

const MAPPING_TARGET_TABLES = [
	'legacy_tpos',
	'legacy_spos',
	'legacy_eos',
	'aircraft_variants',
	'questions',
	'question_versions',
	'legacy_template_sources',
	'legacy_template_source_rules',
	'historical_generation_aggregates',
	'historical_assessment_aggregates',
	'historical_question_performance'
] as const;

const FUTURE_HIERARCHY_TABLES = [
	'bloom_levels',
	'bloom_verbs',
	'phases',
	'phase_versions',
	'tasks',
	'task_versions',
	'subtasks',
	'subtask_versions',
	'elements',
	'element_versions',
	'legacy_curriculum_mappings',
	'question_future_curriculum_links'
] as const;

const PROHIBITED_IMPORT_TABLES = [
	'users',
	'employee_identifier_history',
	'user_roles',
	'sessions',
	'class_rosters',
	'roster_members',
	'exam_instances',
	'exam_questions',
	'exam_question_options',
	'exam_attempts',
	'attempt_question_order',
	'attempt_answers',
	'attempt_extensions',
	'attempt_recovery_grants',
	'question_invalidations',
	'attempt_correction_events',
	'remediation_sessions',
	'retraining_assignments'
] as const;

const LOGICAL_TABLES = [
	'aircraft_variants',
	'legacy_tpos',
	'legacy_spos',
	'legacy_eos',
	'questions',
	'question_versions',
	'question_prompts',
	'question_options',
	'question_aircraft_applicability',
	'question_legacy_curriculum_links',
	'legacy_template_sources',
	'legacy_template_source_rules',
	'source_table_inventories',
	'source_target_mappings',
	'quarantine_records',
	'historical_generation_aggregates',
	'historical_assessment_aggregates',
	'historical_question_performance'
] as const;

function quoteIdentifier(value: string): string {
	return `"${value.replaceAll('"', '""')}"`;
}

function count(
	sqlite: Database.Database,
	table: string,
	where = '',
	parameters: readonly unknown[] = []
): number {
	return Number(
		sqlite
			.prepare(`select count(*) from ${quoteIdentifier(table)} ${where}`)
			.pluck()
			.get(...parameters) ?? 0
	);
}

function groupedCounts(
	sqlite: Database.Database,
	table: string,
	column: string,
	where = '',
	parameters: readonly unknown[] = []
): Record<string, number> {
	const rows = sqlite
		.prepare(
			`select ${quoteIdentifier(column)} as key, count(*) as value from ${quoteIdentifier(table)} ${where} group by ${quoteIdentifier(column)} order by ${quoteIdentifier(column)}`
		)
		.all(...parameters) as Array<{ key: string | null; value: number }>;
	return Object.fromEntries(rows.map((row) => [row.key ?? 'unspecified', Number(row.value)]));
}

function safeGroupedCounts(
	sqlite: Database.Database,
	table: string,
	column: string,
	allowed: readonly string[],
	where = '',
	parameters: readonly unknown[] = []
): Record<string, number> {
	const observed = groupedCounts(sqlite, table, column, where, parameters);
	const result: Record<string, number> = Object.fromEntries(allowed.map((key) => [key, 0]));
	let unrecognized = 0;
	for (const [key, value] of Object.entries(observed)) {
		if (allowed.includes(key)) result[key] = value;
		else unrecognized += value;
	}
	if (unrecognized > 0) result.unrecognized = unrecognized;
	return result;
}

function fullReasonCounts(
	sqlite: Database.Database,
	runId: string
): Record<QuarantineReasonCode, number> {
	const observed = groupedCounts(
		sqlite,
		'quarantine_records',
		'reason_code',
		'where import_run_id = ?',
		[runId]
	);
	const result = {} as Record<QuarantineReasonCode, number>;
	for (const reason of QUARANTINE_REASON_CODES) result[reason] = observed[reason] ?? 0;
	return result;
}

function fullQuestionTypeCounts(sqlite: Database.Database): Record<string, number> {
	const observed = groupedCounts(sqlite, 'question_versions', 'question_type');
	return Object.fromEntries(QUESTION_TYPES.map((type) => [type, observed[type] ?? 0]));
}

function check(name: string, violationCount: number): SafeCheck {
	return { name, passed: violationCount === 0, violationCount };
}

function pragmaViolationCount(
	sqlite: Database.Database,
	pragma: 'foreign_key_check' | 'integrity_check' | 'quick_check'
): number {
	const rows = sqlite.pragma(pragma) as Row[];
	if (pragma === 'foreign_key_check') return rows.length;
	return rows.length === 1 && Object.values(rows[0] ?? {})[0] === 'ok' ? 0 : rows.length || 1;
}

function parentViolationCount(sqlite: Database.Database): number {
	const spo = count(
		sqlite,
		'legacy_spos',
		'left join legacy_tpos on legacy_tpos.id = legacy_spos.legacy_tpo_id where legacy_tpos.id is null'
	);
	const eo = count(
		sqlite,
		'legacy_eos',
		'left join legacy_spos on legacy_spos.id = legacy_eos.legacy_spo_id where legacy_spos.id is null'
	);
	return spo + eo;
}

function questionParentViolationCount(sqlite: Database.Database): number {
	return Number(
		sqlite
			.prepare(
				`select count(*)
				 from question_legacy_curriculum_links q
				 join legacy_eos eo on eo.id = q.legacy_eo_id
				 join legacy_spos spo on spo.id = q.legacy_spo_id
				 where eo.legacy_spo_id <> q.legacy_spo_id
				    or spo.legacy_tpo_id <> q.legacy_tpo_id`
			)
			.pluck()
			.get() ?? 0
	);
}

function aggregateFloorViolations(sqlite: Database.Database): number {
	return (
		count(
			sqlite,
			'historical_generation_aggregates',
			"where publication_state = 'published' and group_size < 5"
		) +
		count(
			sqlite,
			'historical_assessment_aggregates',
			"where publication_state = 'published' and group_size < 5"
		) +
		count(
			sqlite,
			'historical_question_performance',
			"where publication_state = 'published' and asked_count < 5"
		)
	);
}

function snapshotLinkageViolations(sqlite: Database.Database): number {
	return count(
		sqlite,
		'quarantine_records',
		"where reason_code = 'restricted_snapshot_only_content' and (source_table <> 'usedQuestions' or source_id is not null or restricted_payload_json is null)"
	);
}

function mappingCoverageViolations(sqlite: Database.Database, runId: string): number {
	const targets = [
		['legacy_tpos', 'TPO'],
		['legacy_spos', 'SPO'],
		['legacy_eos', 'EO'],
		['legacy_template_sources', null]
	] as const;
	let violations = 0;
	const sourceList = SOURCE_TABLES.map((table) => `'${table}'`).join(', ');
	const targetList = MAPPING_TARGET_TABLES.map((table) => `'${table}'`).join(', ');
	violations += count(
		sqlite,
		'source_target_mappings',
		`where import_run_id = ? and (source_table not in (${sourceList}) or target_table not in (${targetList}))`,
		[runId]
	);
	for (const [targetTable, fixedSource] of targets) {
		const sourcePredicate = fixedSource ? 'and mapping.source_table = ?' : '';
		const parameters = fixedSource ? [runId, fixedSource] : [runId];
		violations += Number(
			sqlite
				.prepare(
					`select count(*) from ${quoteIdentifier(targetTable)} target
					 where target.import_run_id = ?
					   and not exists (
					     select 1 from source_target_mappings mapping
					      where mapping.import_run_id = target.import_run_id
					        and mapping.source_id = target.source_id
					        and mapping.target_table = '${targetTable}'
					        and mapping.target_id = target.id
					        ${sourcePredicate}
					   )`
				)
				.pluck()
				.get(...parameters) ?? 0
		);
	}
	for (const sourceTable of [
		'TPO',
		'SPO',
		'EO',
		'variant',
		'questions',
		'test_model',
		'testModel'
	] as const) {
		const accepted = Number(
			sqlite
				.prepare(
					'select accepted_count from source_table_inventories where import_run_id = ? and source_table = ?'
				)
				.pluck()
				.get(runId, sourceTable) ?? 0
		);
		const mappedSources = Number(
			sqlite
				.prepare(
					'select count(distinct source_id) from source_target_mappings where import_run_id = ? and source_table = ?'
				)
				.pluck()
				.get(runId, sourceTable) ?? 0
		);
		if (mappedSources < accepted) violations += accepted - mappedSources;
	}
	for (const [sourceTable, targetTable] of [
		['variant', 'aircraft_variants'],
		['questions', 'questions'],
		['questions', 'question_versions'],
		['testModel', 'legacy_template_source_rules']
	] as const) {
		violations += Number(
			sqlite
				.prepare(
					`select count(*) from source_target_mappings mapping
					 left join ${quoteIdentifier(targetTable)} target on target.id = mapping.target_id
					 where mapping.import_run_id = ? and mapping.source_table = ?
					   and mapping.target_table = ? and target.id is null`
				)
				.pluck()
				.get(runId, sourceTable, targetTable) ?? 0
		);
	}
	return violations;
}

function getRun(sqlite: Database.Database, requestedRunId?: string): Row {
	if (requestedRunId) {
		const row = sqlite.prepare('select * from import_runs where id = ?').get(requestedRunId) as
			Row | undefined;
		if (row) return row;
		throw new Error('Reconciliation cannot identify an import run.');
	}
	const rows = sqlite
		.prepare('select * from import_runs order by started_at desc, id desc limit 2')
		.all() as Row[];
	if (rows.length !== 1) throw new Error('Reconciliation requires one unambiguous import run.');
	return rows[0]!;
}

function reconcileDatabaseUnsafe(
	sqlite: Database.Database,
	options: { importRunId?: string } = {}
): ReconciliationReport {
	const run = getRun(sqlite, options.importRunId);
	const runId = String(run.id);
	const inventoryRows = sqlite
		.prepare('select * from source_table_inventories where import_run_id = ? order by source_table')
		.all(runId) as Row[];
	const inventoryByTable = new Map(inventoryRows.map((row) => [String(row.source_table), row]));

	const sourceTables = SOURCE_TABLES.map((name) => {
		const row = inventoryByTable.get(name);
		return {
			name,
			disposition: row ? String(row.disposition) : 'missing',
			counts: {
				source: Number(row?.source_count ?? 0),
				accepted: Number(row?.accepted_count ?? 0),
				quarantined: Number(row?.quarantined_count ?? 0),
				excluded: Number(row?.excluded_count ?? 0),
				aggregated: Number(row?.aggregated_count ?? 0),
				suppressed: Number(row?.suppressed_count ?? 0)
			}
		};
	});

	const missingInventoryCount = SOURCE_TABLES.filter((name) => !inventoryByTable.has(name)).length;
	const dispositionViolationCount = sourceTables.filter(
		(row) => row.disposition !== EXPECTED_SOURCE_DISPOSITIONS[row.name]
	).length;
	const unexpectedInventoryCount = inventoryRows.filter(
		(row) => !SOURCE_TABLES.includes(String(row.source_table) as SourceTable)
	).length;
	const curriculumViolations = parentViolationCount(sqlite);
	const questionParentViolations = questionParentViolationCount(sqlite);
	const floorViolations = aggregateFloorViolations(sqlite);
	const futureHierarchy = Object.fromEntries(
		FUTURE_HIERARCHY_TABLES.map((table) => [table, count(sqlite, table)])
	);
	const futureHierarchyCount = Object.values(futureHierarchy).reduce(
		(sum, value) => sum + value,
		0
	);
	const prohibitedCount = PROHIBITED_IMPORT_TABLES.reduce(
		(sum, table) => sum + count(sqlite, table),
		0
	);
	const mappingViolations = mappingCoverageViolations(sqlite, runId);

	const checks = [
		check(
			'source checksum is approved',
			APPROVED_SOURCE_CHECKSUMS.includes(
				String(run.source_checksum) as (typeof APPROVED_SOURCE_CHECKSUMS)[number]
			)
				? 0
				: 1
		),
		check('source-table inventory is complete', missingInventoryCount + unexpectedInventoryCount),
		check('source-table dispositions match policy', dispositionViolationCount),
		check('legacy curriculum parent chains are valid', curriculumViolations),
		check('question curriculum parent chains are valid', questionParentViolations),
		check('future hierarchy remains empty', futureHierarchyCount),
		check('prohibited identity and operational history remain absent', prohibitedCount),
		check('aggregate publication floor is enforced', floorViolations),
		check(
			'restricted snapshot content has no historical source linkage',
			snapshotLinkageViolations(sqlite)
		),
		check('source-to-target mapping coverage is complete', mappingViolations),
		check('foreign-key check passes', pragmaViolationCount(sqlite, 'foreign_key_check')),
		check('integrity check passes', pragmaViolationCount(sqlite, 'integrity_check')),
		check('quick check passes', pragmaViolationCount(sqlite, 'quick_check'))
	];

	const reasonCounts = fullReasonCounts(sqlite, runId);
	const validationReasons = Object.fromEntries(
		[
			'malformed_question_shape',
			'unknown_question_type',
			'missing_or_invalid_variant',
			'curriculum_parent_mismatch',
			'zero_or_sentinel_relationship',
			'duplicate_candidate',
			'encoding_error'
		].map((reason) => [reason, reasonCounts[reason as QuarantineReasonCode]])
	);

	return {
		schemaVersion: RECONCILIATION_SCHEMA_VERSION,
		source: {
			checksum: String(run.source_checksum),
			importerVersion: /^[0-9A-Za-z._-]{1,32}$/.test(String(run.importer_version))
				? String(run.importer_version)
				: 'unrecognized',
			status: ['started', 'completed'].includes(String(run.status))
				? String(run.status)
				: 'unrecognized'
		},
		summary: {
			source: Number(run.source_row_count),
			accepted: Number(run.accepted_count),
			quarantined: Number(run.quarantined_count),
			excluded: Number(run.excluded_count),
			aggregated: Number(run.aggregated_count),
			suppressed: Number(run.suppressed_group_count)
		},
		sourceTables,
		curriculum: {
			tpoCount: count(sqlite, 'legacy_tpos', 'where import_run_id = ?', [runId]),
			spoCount: count(sqlite, 'legacy_spos', 'where import_run_id = ?', [runId]),
			eoCount: count(sqlite, 'legacy_eos', 'where import_run_id = ?', [runId]),
			parentViolationCount: curriculumViolations
		},
		variants: { acceptedCount: count(sqlite, 'aircraft_variants') },
		questions: {
			acceptedVersionCount: count(sqlite, 'question_versions'),
			byType: fullQuestionTypeCounts(sqlite),
			byLifecycle: safeGroupedCounts(sqlite, 'question_versions', 'lifecycle', [
				'draft',
				'review',
				'published',
				'retired'
			]),
			byGenerationStatus: safeGroupedCounts(sqlite, 'question_versions', 'generation_status', [
				'blocked',
				'eligible'
			]),
			validationReasons,
			legacyParentViolationCount: questionParentViolations
		},
		templates: {
			bySource: safeGroupedCounts(sqlite, 'legacy_template_sources', 'source_table', [
				'test_model',
				'testModel'
			]),
			byState: safeGroupedCounts(sqlite, 'legacy_template_sources', 'reconciliation_state', [
				'unreviewed',
				'mapped',
				'ambiguous',
				'retired'
			]),
			ruleCount: count(sqlite, 'legacy_template_source_rules')
		},
		mappings: {
			totalCount: count(sqlite, 'source_target_mappings', 'where import_run_id = ?', [runId]),
			bySource: safeGroupedCounts(
				sqlite,
				'source_target_mappings',
				'source_table',
				SOURCE_TABLES,
				'where import_run_id = ?',
				[runId]
			),
			byTarget: safeGroupedCounts(
				sqlite,
				'source_target_mappings',
				'target_table',
				MAPPING_TARGET_TABLES,
				'where import_run_id = ?',
				[runId]
			),
			byKind: safeGroupedCounts(
				sqlite,
				'source_target_mappings',
				'mapping_kind',
				['direct', 'version', 'aggregate'],
				'where import_run_id = ?',
				[runId]
			),
			coverageViolationCount: mappingViolations
		},
		quarantine: {
			totalCount: count(sqlite, 'quarantine_records', 'where import_run_id = ?', [runId]),
			byReason: reasonCounts,
			byDisposition: safeGroupedCounts(
				sqlite,
				'quarantine_records',
				'disposition',
				['rejected', 'quarantined', 'excluded', 'suppressed', 'approved_for_future_reconciliation'],
				'where import_run_id = ?',
				[runId]
			)
		},
		aggregates: {
			generation: {
				published: count(
					sqlite,
					'historical_generation_aggregates',
					"where publication_state = 'published'"
				),
				suppressed: count(
					sqlite,
					'historical_generation_aggregates',
					"where publication_state = 'suppressed'"
				)
			},
			assessment: {
				published: count(
					sqlite,
					'historical_assessment_aggregates',
					"where publication_state = 'published'"
				),
				suppressed: count(
					sqlite,
					'historical_assessment_aggregates',
					"where publication_state = 'suppressed'"
				)
			},
			questionPerformance: {
				published: count(
					sqlite,
					'historical_question_performance',
					"where publication_state = 'published'"
				),
				suppressed: count(
					sqlite,
					'historical_question_performance',
					"where publication_state = 'suppressed'"
				)
			},
			publicationFloorViolationCount: floorViolations
		},
		futureHierarchy,
		checks,
		passed: String(run.status) === 'completed' && checks.every((item) => item.passed)
	};
}

export function reconcileDatabase(
	sqlite: Database.Database,
	options: { importRunId?: string } = {}
): ReconciliationReport {
	try {
		return reconcileDatabaseUnsafe(sqlite, options);
	} catch (error) {
		if (error instanceof MigrationReconciliationError) throw error;
		throw new MigrationReconciliationError();
	}
}

function logicalSignature(
	sqlite: Database.Database,
	table: string
): { count: number; hash: string } {
	const columns = sqlite.prepare(`pragma table_info(${quoteIdentifier(table)})`).all() as Array<{
		name: string;
	}>;
	const selectedColumns = columns
		.map((column) => column.name)
		.filter((column) => !['import_run_id', 'started_at', 'completed_at'].includes(column));
	const order = selectedColumns.map(quoteIdentifier).join(', ');
	const rows = sqlite
		.prepare(`select ${order} from ${quoteIdentifier(table)} order by ${order}`)
		.all() as Row[];
	const hash = createHash('sha256');
	for (const row of rows) hash.update(JSON.stringify(row)).update('\n');
	return { count: rows.length, hash: hash.digest('hex') };
}

function compareLogicalImportsUnsafe(
	left: Database.Database,
	right: Database.Database
): LogicalComparison {
	const differences: LogicalComparison['differences'] = [];
	for (const table of LOGICAL_TABLES) {
		const leftSignature = logicalSignature(left, table);
		const rightSignature = logicalSignature(right, table);
		if (
			leftSignature.count !== rightSignature.count ||
			leftSignature.hash !== rightSignature.hash
		) {
			differences.push({
				table,
				leftCount: leftSignature.count,
				rightCount: rightSignature.count
			});
		}
	}
	return {
		schemaVersion: RECONCILIATION_SCHEMA_VERSION,
		equivalent: differences.length === 0,
		comparedTableCount: LOGICAL_TABLES.length,
		differences
	};
}

export function compareLogicalImports(
	left: Database.Database,
	right: Database.Database
): LogicalComparison {
	try {
		return compareLogicalImportsUnsafe(left, right);
	} catch (error) {
		if (error instanceof MigrationReconciliationError) throw error;
		throw new MigrationReconciliationError();
	}
}
