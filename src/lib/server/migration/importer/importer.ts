import { createHash } from 'node:crypto';
import { createReadStream, statSync } from 'node:fs';

import type Database from 'better-sqlite3';

import type { DatabaseHandle } from '$lib/server/db/index.js';
import { SOURCE_TABLES } from '$lib/server/db/schema/migration.js';

import { fingerprint, importedId, IMPORTED_AT, IMPORTER_VERSION } from './identifiers.js';
import { parseMysqlDump, scanMysqlTableDeclarations } from './parser.js';
import { SOURCE_COLUMNS, SOURCE_DISPOSITIONS } from './source-shape.js';
import {
	LegacyImportError,
	type ApprovedSource,
	type ImportResult,
	type SourceProfile,
	type SourceTable
} from './types.js';

type Row = Record<string, string | null>;
type MutableCount = {
	source: number;
	accepted: number;
	quarantined: number;
	excluded: number;
	aggregated: number;
	suppressed: number;
};

const SOURCE_SET = new Set<string>(SOURCE_TABLES);
const STATEMENT_CACHES = new WeakMap<Database.Database, Map<string, Database.Statement>>();
const QUESTION_TYPES: Readonly<Record<string, string>> = {
	tf: 'true_false',
	mc: 'single_choice',
	c2: 'two_correct_compound',
	ac: 'all_correct',
	nc: 'none_correct'
};

function prepared(handle: DatabaseHandle, sql: string): Database.Statement {
	let cache = STATEMENT_CACHES.get(handle.sqlite);
	if (!cache) {
		cache = new Map();
		STATEMENT_CACHES.set(handle.sqlite, cache);
	}
	let statement = cache.get(sql);
	if (!statement) {
		statement = handle.sqlite.prepare(sql);
		cache.set(sql, statement);
	}
	return statement;
}

function safeInteger(value: string | null): number | null {
	if (value === null || !/^\d+$/.test(value)) return null;
	const result = Number(value);
	return Number.isSafeInteger(result) ? result : null;
}

function transientMemberKey(runId: string, sourceMemberId: string): Buffer {
	return createHash('sha256')
		.update(runId, 'utf8')
		.update('\0')
		.update(sourceMemberId, 'utf8')
		.digest()
		.subarray(0, 16);
}

function sourceRow(
	table: SourceTable,
	columns: readonly string[] | null,
	values: readonly (string | null)[]
): Row {
	const names = columns ?? SOURCE_COLUMNS[table];
	if (names.length !== values.length) throw new Error('Source row has an invalid column count.');
	const row: Row = {};
	for (let index = 0; index < names.length; index += 1) row[names[index]!] = values[index]!;
	return row;
}

async function checksum(path: string): Promise<string> {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
	return hash.digest('hex');
}

async function verifyApprovedSource(source: ApprovedSource): Promise<void> {
	if (!/^[0-9a-f]{64}$/.test(source.sha256) || source.byteSize <= 0) throw new LegacyImportError();
	let size: number;
	try {
		size = statSync(source.path).size;
	} catch {
		throw new LegacyImportError();
	}
	if (size !== source.byteSize || (await checksum(source.path)) !== source.sha256)
		throw new LegacyImportError();
	const declarations = await scanMysqlTableDeclarations(source.path);
	if (
		declarations.size > 0 &&
		(declarations.size !== SOURCE_TABLES.length ||
			SOURCE_TABLES.some((table) => !declarations.has(table)) ||
			[...declarations].some((table) => !SOURCE_SET.has(table)))
	)
		throw new LegacyImportError();
}

export async function profileLegacyDump(source: ApprovedSource): Promise<SourceProfile> {
	await verifyApprovedSource(source);
	const tables = Object.fromEntries(SOURCE_TABLES.map((table) => [table, 0])) as Record<
		SourceTable,
		number
	>;
	let sourceRows = 0;
	try {
		for await (const parsed of parseMysqlDump(source.path)) {
			if (!SOURCE_SET.has(parsed.table)) throw new Error('Unapproved source table.');
			tables[parsed.table as SourceTable] += 1;
			sourceRows += 1;
		}
		return { sourceChecksum: source.sha256, sourceRows, tables };
	} catch {
		throw new LegacyImportError();
	}
}

function insertMapping(
	handle: DatabaseHandle,
	runId: string,
	table: SourceTable,
	sourceId: string,
	targetTable: string,
	targetId: string,
	kind: 'direct' | 'version' | 'aggregate' = 'direct'
): void {
	const id = importedId(table, `${sourceId}:${targetTable}`, 'source_target_mappings');
	prepared(
		handle,
		`INSERT INTO source_target_mappings
		(id, import_run_id, source_table, source_id, target_table, target_id, mapping_kind)
		VALUES (?, ?, ?, ?, ?, ?, ?)`
	).run(id, runId, table, sourceId, targetTable, targetId, kind);
}

function quarantine(
	handle: DatabaseHandle,
	runId: string,
	table: SourceTable,
	sourceId: string | null,
	reason: string,
	payload: string | null = null,
	payloadHash: string | null = null,
	disposition: 'rejected' | 'quarantined' | 'excluded' | 'suppressed' = 'quarantined'
): void {
	const identity = sourceId ?? payloadHash ?? reason;
	const id = importedId(table, `${identity}:${reason}`, 'quarantine_records');
	prepared(
		handle,
		`INSERT OR IGNORE INTO quarantine_records
		(id, import_run_id, source_table, source_id, reason_code, disposition,
		 restricted_payload_json, payload_fingerprint, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	).run(id, runId, table, sourceId, reason, disposition, payload, payloadHash, IMPORTED_AT);
}

async function visitTable(
	path: string,
	wanted: ReadonlySet<string>,
	visitor: (table: SourceTable, row: Row) => void
): Promise<void> {
	for await (const parsed of parseMysqlDump(path)) {
		if (!SOURCE_SET.has(parsed.table)) throw new Error('Unapproved source table.');
		if (!wanted.has(parsed.table)) continue;
		const table = parsed.table as SourceTable;
		visitor(table, sourceRow(table, parsed.columns, parsed.values));
	}
}

function importTpoOrVariant(
	handle: DatabaseHandle,
	runId: string,
	table: SourceTable,
	row: Row,
	count: MutableCount
): void {
	if (table === 'TPO') {
		const sourceId = row.tpo_id;
		if (!sourceId || !row.tpo_number || !row.tpo_name?.trim()) {
			quarantine(handle, runId, table, sourceId ?? null, 'missing_parent', null, null, 'rejected');
			count.quarantined += 1;
			return;
		}
		const id = importedId(table, sourceId, 'legacy_tpos');
		prepared(
			handle,
			'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
		).run(id, sourceId, row.tpo_number, row.tpo_name, runId);
		insertMapping(handle, runId, table, sourceId, 'legacy_tpos', id);
		count.accepted += 1;
		return;
	}
	const sourceId = row.variant_id;
	if (!sourceId || sourceId === '0' || !row.variant_name?.trim()) {
		quarantine(
			handle,
			runId,
			table,
			sourceId ?? null,
			'missing_or_invalid_variant',
			null,
			null,
			'rejected'
		);
		count.quarantined += 1;
		return;
	}
	const id = importedId(table, sourceId, 'aircraft_variants');
	prepared(
		handle,
		`INSERT INTO aircraft_variants
		(id, code, name, effective_from, status, created_at) VALUES (?, ?, ?, ?, 'review', ?)`
	).run(id, row.variant_name, row.variant_name, IMPORTED_AT.slice(0, 10), IMPORTED_AT);
	insertMapping(handle, runId, table, sourceId, 'aircraft_variants', id);
	count.accepted += 1;
}

function importSpo(handle: DatabaseHandle, runId: string, row: Row, count: MutableCount): void {
	const sourceId = row.spo_id;
	const parentSourceId = row.tpo_id;
	const parent = parentSourceId
		? prepared(handle, 'SELECT id FROM legacy_tpos WHERE import_run_id = ? AND source_id = ?')
				.pluck()
				.get(runId, parentSourceId)
		: undefined;
	if (!sourceId || !parent || !row.spo_number || !row.spo_name?.trim()) {
		quarantine(handle, runId, 'SPO', sourceId ?? null, 'missing_parent', null, null, 'rejected');
		count.quarantined += 1;
		return;
	}
	const id = importedId('SPO', sourceId, 'legacy_spos');
	prepared(
		handle,
		'INSERT INTO legacy_spos (id, source_id, legacy_tpo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)'
	).run(id, sourceId, parent, row.spo_number, row.spo_name, runId);
	insertMapping(handle, runId, 'SPO', sourceId, 'legacy_spos', id);
	count.accepted += 1;
}

function importEo(handle: DatabaseHandle, runId: string, row: Row, count: MutableCount): void {
	const sourceId = row.eo_id;
	const parentSourceId = row.spo_id;
	const parent = parentSourceId
		? prepared(handle, 'SELECT id FROM legacy_spos WHERE import_run_id = ? AND source_id = ?')
				.pluck()
				.get(runId, parentSourceId)
		: undefined;
	if (!sourceId || !parent || !row.eo_no || !row.element_name?.trim()) {
		quarantine(handle, runId, 'EO', sourceId ?? null, 'missing_parent', null, null, 'rejected');
		count.quarantined += 1;
		return;
	}
	const id = importedId('EO', sourceId, 'legacy_eos');
	prepared(
		handle,
		'INSERT INTO legacy_eos (id, source_id, legacy_spo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)'
	).run(id, sourceId, parent, row.eo_no, row.element_name, runId);
	insertMapping(handle, runId, 'EO', sourceId, 'legacy_eos', id);
	count.accepted += 1;
}

interface NormalizedQuestion {
	type: string;
	prompts: string[];
	options: { text: string; correct: number; semantic: string | null }[];
}

function normalizeQuestion(row: Row): NormalizedQuestion | string {
	const type = row.type?.trim().toLowerCase();
	if (!type || !QUESTION_TYPES[type]) return 'unknown_question_type';
	const prompts = [row.question_a, row.question_b].filter((value): value is string =>
		Boolean(value?.trim())
	);
	if (prompts.length === 0) return 'malformed_question_shape';
	const correct = [row.correct_answer, row.alt_correct_answer, row.last_correct_answer].filter(
		(value): value is string => Boolean(value?.trim())
	);
	const wrong = [row.ans_x, row.ans_y, row.ans_z].filter((value): value is string =>
		Boolean(value?.trim())
	);
	let options: NormalizedQuestion['options'];
	if (type === 'tf') {
		if (
			correct.length !== 1 ||
			wrong.length !== 0 ||
			!['true', 'false'].includes(correct[0]!.toLowerCase())
		)
			return 'malformed_question_shape';
		const trueCorrect = correct[0]!.toLowerCase() === 'true';
		options = [
			{ text: 'True', correct: trueCorrect ? 1 : 0, semantic: 'true' },
			{ text: 'False', correct: trueCorrect ? 0 : 1, semantic: 'false' }
		];
	} else if (type === 'mc') {
		if (correct.length !== 1 || wrong.length !== 3) return 'malformed_question_shape';
		options = [
			{ text: correct[0]!, correct: 1, semantic: null },
			...wrong.map((text) => ({ text, correct: 0, semantic: null }))
		];
	} else if (type === 'c2') {
		if (correct.length !== 2 || wrong.length !== 1) return 'malformed_question_shape';
		options = [
			...correct.map((text) => ({ text, correct: 1, semantic: 'compound' })),
			...wrong.map((text) => ({ text, correct: 0, semantic: 'compound' }))
		];
	} else if (type === 'ac') {
		if (correct.length !== 3 || wrong.length !== 0) return 'malformed_question_shape';
		options = correct.map((text) => ({ text, correct: 1, semantic: 'all' }));
	} else {
		if (correct.length !== 0 || wrong.length !== 3) return 'malformed_question_shape';
		options = wrong.map((text) => ({ text, correct: 0, semantic: 'none' }));
	}
	if (new Set(options.map((option) => option.text)).size !== options.length)
		return 'malformed_question_shape';
	return { type: QUESTION_TYPES[type]!, prompts, options };
}

function importQuestion(
	handle: DatabaseHandle,
	runId: string,
	row: Row,
	count: MutableCount,
	duplicateFingerprints: Set<string>,
	snapshotFingerprints: Set<string>
): void {
	const sourceId = row.questionID;
	if (!sourceId) {
		count.quarantined += 1;
		return;
	}
	const normalized = normalizeQuestion(row);
	if (typeof normalized === 'string') {
		quarantine(handle, runId, 'questions', sourceId, normalized, null, null, 'rejected');
		count.quarantined += 1;
		return;
	}
	const variantId = row.variant_id
		? importedId('variant', row.variant_id, 'aircraft_variants')
		: null;
	const spoId = row.spo_id ? importedId('SPO', row.spo_id, 'legacy_spos') : null;
	const eoId = row.eo_id ? importedId('EO', row.eo_id, 'legacy_eos') : null;
	if (
		!row.variant_id ||
		row.variant_id === '0' ||
		!variantId ||
		!prepared(handle, 'SELECT 1 FROM aircraft_variants WHERE id = ?').get(variantId)
	) {
		quarantine(
			handle,
			runId,
			'questions',
			sourceId,
			'missing_or_invalid_variant',
			null,
			null,
			'rejected'
		);
		count.quarantined += 1;
		return;
	}
	if (!row.spo_id || !row.eo_id || row.spo_id === '0' || row.eo_id === '0') {
		quarantine(
			handle,
			runId,
			'questions',
			sourceId,
			'zero_or_sentinel_relationship',
			null,
			null,
			'rejected'
		);
		count.quarantined += 1;
		return;
	}
	const chain = prepared(
		handle,
		`SELECT t.id AS tpo_id FROM legacy_eos e
		JOIN legacy_spos s ON s.id = e.legacy_spo_id JOIN legacy_tpos t ON t.id = s.legacy_tpo_id
		WHERE e.id = ? AND s.id = ? AND e.import_run_id = ?`
	).get(eoId, spoId, runId) as { tpo_id: string } | undefined;
	if (!chain) {
		const reason = prepared(handle, 'SELECT 1 FROM legacy_eos WHERE id = ?').get(eoId)
			? 'curriculum_parent_mismatch'
			: 'missing_parent';
		quarantine(handle, runId, 'questions', sourceId, reason, null, null, 'rejected');
		count.quarantined += 1;
		return;
	}
	const contentHash = fingerprint([normalized.type, normalized.prompts, normalized.options]);
	if (duplicateFingerprints.has(contentHash)) {
		quarantine(handle, runId, 'questions', sourceId, 'duplicate_candidate', null, contentHash);
		count.quarantined += 1;
		return;
	}
	duplicateFingerprints.add(contentHash);
	const optionTexts = normalized.options.map((option) => option.text.trim()).sort();
	for (const prompt of normalized.prompts)
		snapshotFingerprints.add(fingerprint([normalized.type, prompt.trim(), optionTexts]));
	const questionId = importedId('questions', sourceId, 'questions');
	const versionId = importedId('questions', sourceId, 'question_versions');
	prepared(handle, 'INSERT INTO questions (id, created_at) VALUES (?, ?)').run(
		questionId,
		IMPORTED_AT
	);
	prepared(
		handle,
		`INSERT INTO question_versions
		(id, question_id, version, question_type, lifecycle, generation_status, created_at)
		VALUES (?, ?, 1, ?, 'review', 'blocked', ?)`
	).run(versionId, questionId, normalized.type, IMPORTED_AT);
	for (const [position, prompt] of normalized.prompts.entries()) {
		prepared(
			handle,
			'INSERT INTO question_prompts (id, question_version_id, position, prompt_text) VALUES (?, ?, ?, ?)'
		).run(
			importedId('questions', `${sourceId}:prompt:${position}`, 'question_prompts'),
			versionId,
			position,
			prompt
		);
	}
	for (const [position, option] of normalized.options.entries()) {
		prepared(
			handle,
			`INSERT INTO question_options
			(id, question_version_id, position, option_text, is_correct, semantic_value) VALUES (?, ?, ?, ?, ?, ?)`
		).run(
			importedId('questions', `${sourceId}:option:${position}`, 'question_options'),
			versionId,
			position,
			option.text,
			option.correct,
			option.semantic
		);
	}
	prepared(
		handle,
		'INSERT INTO question_aircraft_applicability (question_version_id, aircraft_variant_id) VALUES (?, ?)'
	).run(versionId, variantId);
	prepared(
		handle,
		`INSERT INTO question_legacy_curriculum_links
		(question_version_id, legacy_tpo_id, legacy_spo_id, legacy_eo_id) VALUES (?, ?, ?, ?)`
	).run(versionId, chain.tpo_id, spoId, eoId);
	insertMapping(handle, runId, 'questions', sourceId, 'questions', questionId);
	insertMapping(handle, runId, 'questions', sourceId, 'question_versions', versionId, 'version');
	count.accepted += 1;
}

const WIDE_TEMPLATE_RULE_COLUMNS = SOURCE_COLUMNS.test_model.slice(3);

function importWideTemplate(
	handle: DatabaseHandle,
	runId: string,
	row: Row,
	count: MutableCount
): void {
	const sourceId = row.testID;
	const length = safeInteger(row.length ?? null);
	if (!sourceId || !length) {
		quarantine(handle, runId, 'test_model', sourceId ?? null, 'ambiguous_template_source');
		count.quarantined += 1;
		return;
	}
	const id = importedId('test_model', sourceId, 'legacy_template_sources');
	const shape = JSON.stringify({
		format: 'wide',
		courseType: row.course_type,
		declaredLength: length
	});
	prepared(
		handle,
		`INSERT INTO legacy_template_sources
		(id, import_run_id, source_table, source_id, configured_length, source_shape_json)
		VALUES (?, ?, 'test_model', ?, ?, ?)`
	).run(id, runId, sourceId, length, shape);
	let position = 0;
	for (const column of WIDE_TEMPLATE_RULE_COLUMNS) {
		const amount = safeInteger(row[column] ?? null);
		if (amount === null || amount === 0) continue;
		const ruleId = importedId(
			'test_model',
			`${sourceId}:${column}`,
			'legacy_template_source_rules'
		);
		prepared(
			handle,
			`INSERT INTO legacy_template_source_rules
			(id, legacy_template_source_id, position, legacy_curriculum_type,
			 legacy_curriculum_source_id, question_count, is_mandatory) VALUES (?, ?, ?, 'spo', ?, ?, ?)`
		).run(ruleId, id, position++, column, amount, column === 'mandatory' ? 1 : 0);
	}
	insertMapping(handle, runId, 'test_model', sourceId, 'legacy_template_sources', id);
	count.accepted += 1;
}

function importRowTemplate(
	handle: DatabaseHandle,
	runId: string,
	row: Row,
	count: MutableCount,
	ordinals: Map<string, number>
): void {
	const sourceId = row.test_model_id;
	const length = safeInteger(row.test_length ?? null);
	if (!sourceId || !length) {
		quarantine(handle, runId, 'testModel', sourceId ?? null, 'ambiguous_template_source');
		count.quarantined += 1;
		return;
	}
	const sourcePk = importedId('testModel', sourceId, 'legacy_template_sources');
	prepared(
		handle,
		`INSERT OR IGNORE INTO legacy_template_sources
		(id, import_run_id, source_table, source_id, logical_name, aircraft_source_id,
		 configured_length, source_shape_json) VALUES (?, ?, 'testModel', ?, ?, ?, ?, ?)`
	).run(
		sourcePk,
		runId,
		sourceId,
		row.name,
		row.variant_id,
		length,
		JSON.stringify({ format: 'row', courseType: row.course_type, declaredLength: length })
	);
	const ordinal = ordinals.get(sourceId) ?? 0;
	ordinals.set(sourceId, ordinal + 1);
	const isMandatory = row.eo_id !== null;
	const curriculumId = isMandatory ? row.eo_id : row.spo_id;
	const amount = isMandatory ? 1 : safeInteger(row.count ?? null);
	if (!curriculumId || amount === null) {
		quarantine(handle, runId, 'testModel', `${sourceId}:${ordinal}`, 'ambiguous_template_source');
		count.quarantined += 1;
		return;
	}
	const ruleId = importedId('testModel', `${sourceId}:${ordinal}`, 'legacy_template_source_rules');
	prepared(
		handle,
		`INSERT INTO legacy_template_source_rules
		(id, legacy_template_source_id, position, legacy_curriculum_type,
		 legacy_curriculum_source_id, question_count, is_mandatory) VALUES (?, ?, ?, ?, ?, ?, ?)`
	).run(
		ruleId,
		sourcePk,
		ordinal,
		isMandatory ? 'eo' : 'spo',
		curriculumId,
		amount,
		isMandatory ? 1 : 0
	);
	if (ordinal === 0)
		insertMapping(handle, runId, 'testModel', sourceId, 'legacy_template_sources', sourcePk);
	insertMapping(
		handle,
		runId,
		'testModel',
		`${sourceId}:${ordinal}`,
		'legacy_template_source_rules',
		ruleId
	);
	count.accepted += 1;
}

function upsertGenerationAggregate(handle: DatabaseHandle, runId: string, row: Row): boolean {
	const year = /^\d{4}/.exec(row.genDate ?? '')?.[0];
	const length = safeInteger(row.length ?? null);
	if (!year || !length) return false;
	const dimensions = [year, row.testModelID, row.course_type, length];
	const id = importedId(
		'createdTests',
		fingerprint(dimensions),
		'historical_generation_aggregates'
	);
	prepared(
		handle,
		`INSERT INTO historical_generation_aggregates
		(id, import_run_id, calendar_year, template_source_key, course_type_code,
		 configured_length, group_size, generated_count, publication_state)
		VALUES (?, ?, ?, ?, ?, ?, 1, 1, 'suppressed')
		ON CONFLICT DO UPDATE SET group_size = group_size + 1, generated_count = generated_count + 1`
	).run(id, runId, Number(year), row.testModelID, row.course_type, length);
	return true;
}

function upsertAssessmentAggregate(handle: DatabaseHandle, runId: string, row: Row): boolean {
	const year = /^\d{4}/.exec(row.testDate ?? '')?.[0];
	const score = safeInteger(row.score ?? null);
	if (!year || score === null || score > 100 || !row.employeeNo) return false;
	const outcomeValue = row.result?.toLowerCase();
	const outcome = outcomeValue?.startsWith('sat')
		? 'satisfactory'
		: outcomeValue?.startsWith('unsat')
			? 'unsatisfactory'
			: null;
	const retraining = row.retrain === '1' ? 1 : 0;
	const dimensions = [year, row.syllabus, row.qualCode, retraining, outcome];
	const id = importedId(
		'studentTestRecords',
		fingerprint(dimensions),
		'historical_assessment_aggregates'
	);
	const memberInsert = prepared(
		handle,
		'INSERT OR IGNORE INTO temp._assessment_members (aggregate_id, member_fingerprint) VALUES (?, ?)'
	).run(id, transientMemberKey(runId, row.employeeNo));
	const newMember = memberInsert.changes === 1 ? 1 : 0;
	prepared(
		handle,
		`INSERT INTO historical_assessment_aggregates
		(id, import_run_id, calendar_year, syllabus_code, qualification_code, retraining,
		 outcome, group_size, attempt_count, average_score, publication_state)
		VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'suppressed')
		ON CONFLICT DO UPDATE SET average_score =
		 ((average_score * attempt_count) + excluded.average_score) / (attempt_count + 1),
		 group_size = group_size + ?, attempt_count = attempt_count + 1`
	).run(id, runId, Number(year), row.syllabus, row.qualCode, retraining, outcome, score, newMember);
	return true;
}

function upsertQuestionPerformance(handle: DatabaseHandle, runId: string, row: Row): boolean {
	if (!row.questionID) return false;
	const versionId = importedId('questions', row.questionID, 'question_versions');
	if (!prepared(handle, 'SELECT 1 FROM question_versions WHERE id = ?').get(versionId))
		return false;
	const id = importedId('testResults', row.questionID, 'historical_question_performance');
	prepared(
		handle,
		`INSERT INTO historical_question_performance
		(id, import_run_id, question_version_id, calendar_year, asked_count, correct_count, publication_state)
		VALUES (?, ?, ?, NULL, 1, ?, 'suppressed')
		ON CONFLICT DO UPDATE SET asked_count = asked_count + 1,
		 correct_count = correct_count + excluded.correct_count`
	).run(id, runId, versionId, row.correct === '1' ? 1 : 0);
	return true;
}

function importSnapshot(
	handle: DatabaseHandle,
	runId: string,
	row: Row,
	canonicalFingerprints: Set<string>
): boolean {
	if (row.questionID) {
		const mapped = prepared(
			handle,
			`SELECT 1 FROM source_target_mappings
			WHERE import_run_id = ? AND source_table = 'questions' AND source_id = ? AND target_table = 'question_versions'`
		).get(runId, row.questionID);
		if (mapped) return true;
	}
	const payloadObject = {
		type: row.type,
		prompt: row.questionText,
		options: [row.a, row.b, row.c, row.d].filter((value) => value !== null),
		answerKey: row.answerKey
	};
	const normalizedType = row.type ? QUESTION_TYPES[row.type.trim().toLowerCase()] : undefined;
	const payloadHash = fingerprint([
		normalizedType ?? row.type,
		row.questionText?.trim(),
		payloadObject.options.map((option) => option?.trim()).sort()
	]);
	if (canonicalFingerprints.has(payloadHash)) return true;
	quarantine(
		handle,
		runId,
		'usedQuestions',
		null,
		'restricted_snapshot_only_content',
		JSON.stringify(payloadObject),
		payloadHash
	);
	return false;
}

function finalizeAggregates(
	handle: DatabaseHandle,
	runId: string,
	counts: Map<SourceTable, MutableCount>
): number {
	let suppressed = 0;
	for (const [table, sourceTable] of [
		['historical_generation_aggregates', 'createdTests'],
		['historical_assessment_aggregates', 'studentTestRecords']
	] as const) {
		prepared(
			handle,
			`UPDATE ${table} SET publication_state = 'published' WHERE import_run_id = ? AND group_size >= 5`
		).run(runId);
		const rows = prepared(
			handle,
			`SELECT id FROM ${table} WHERE import_run_id = ? AND publication_state = 'suppressed'`
		).all(runId) as { id: string }[];
		for (const row of rows)
			quarantine(
				handle,
				runId,
				sourceTable,
				row.id,
				'aggregate_group_suppression',
				null,
				null,
				'suppressed'
			);
		counts.get(sourceTable)!.suppressed = rows.length;
		suppressed += rows.length;
	}
	prepared(
		handle,
		`UPDATE historical_question_performance SET publication_state = 'published'
		WHERE import_run_id = ? AND asked_count >= 5`
	).run(runId);
	const performanceRows = prepared(
		handle,
		`SELECT id FROM historical_question_performance
		WHERE import_run_id = ? AND publication_state = 'suppressed'`
	).all(runId) as { id: string }[];
	for (const row of performanceRows)
		quarantine(
			handle,
			runId,
			'testResults',
			row.id,
			'aggregate_group_suppression',
			null,
			null,
			'suppressed'
		);
	counts.get('testResults')!.suppressed = performanceRows.length;
	suppressed += performanceRows.length;
	return suppressed;
}

export async function importLegacyDump(
	handle: DatabaseHandle,
	source: ApprovedSource
): Promise<ImportResult> {
	await verifyApprovedSource(source);
	const existing = prepared(
		handle,
		`SELECT id, source_row_count, accepted_count, quarantined_count,
		excluded_count, aggregated_count, suppressed_group_count FROM import_runs
		WHERE source_checksum = ? AND importer_version = ? AND status = 'completed'`
	).get(source.sha256, IMPORTER_VERSION) as Record<string, number | string> | undefined;
	if (existing)
		return {
			runId: String(existing.id),
			sourceChecksum: source.sha256,
			status: 'completed',
			alreadyImported: true,
			sourceRows: Number(existing.source_row_count),
			accepted: Number(existing.accepted_count),
			quarantined: Number(existing.quarantined_count),
			excluded: Number(existing.excluded_count),
			aggregated: Number(existing.aggregated_count),
			suppressed: Number(existing.suppressed_group_count)
		};

	const runId = importedId('source', source.sha256, 'import_runs');
	const counts = new Map<SourceTable, MutableCount>(
		SOURCE_TABLES.map((table) => [
			table,
			{
				source: 0,
				accepted: 0,
				quarantined: 0,
				excluded: 0,
				aggregated: 0,
				suppressed: 0
			}
		])
	);
	let transactionOpen = false;
	try {
		handle.sqlite.exec('BEGIN IMMEDIATE');
		transactionOpen = true;
		handle.sqlite.exec(`CREATE TEMP TABLE IF NOT EXISTS _assessment_members (
			aggregate_id TEXT NOT NULL,
			member_fingerprint BLOB NOT NULL,
			PRIMARY KEY (aggregate_id, member_fingerprint)
		)`);
		handle.sqlite.exec('DELETE FROM temp._assessment_members');
		prepared(
			handle,
			`INSERT INTO import_runs
			(id, importer_version, source_checksum, source_byte_size, status, started_at)
			VALUES (?, ?, ?, ?, 'started', ?)`
		).run(runId, IMPORTER_VERSION, source.sha256, source.byteSize, IMPORTED_AT);

		for await (const parsed of parseMysqlDump(source.path)) {
			if (!SOURCE_SET.has(parsed.table)) throw new Error('Unapproved source table.');
			counts.get(parsed.table as SourceTable)!.source += 1;
		}
		await visitTable(source.path, new Set(['TPO', 'variant']), (table, row) =>
			importTpoOrVariant(handle, runId, table, row, counts.get(table)!)
		);
		await visitTable(source.path, new Set(['SPO']), (_, row) =>
			importSpo(handle, runId, row, counts.get('SPO')!)
		);
		await visitTable(source.path, new Set(['EO']), (_, row) =>
			importEo(handle, runId, row, counts.get('EO')!)
		);
		const duplicateFingerprints = new Set<string>();
		const snapshotFingerprints = new Set<string>();
		await visitTable(source.path, new Set(['questions']), (_, row) =>
			importQuestion(
				handle,
				runId,
				row,
				counts.get('questions')!,
				duplicateFingerprints,
				snapshotFingerprints
			)
		);
		const templateOrdinals = new Map<string, number>();
		await visitTable(source.path, new Set(['test_model', 'testModel']), (table, row) => {
			if (table === 'test_model') importWideTemplate(handle, runId, row, counts.get(table)!);
			else importRowTemplate(handle, runId, row, counts.get(table)!, templateOrdinals);
		});
		await visitTable(
			source.path,
			new Set(['createdTests', 'studentTestRecords', 'testResults', 'usedQuestions']),
			(table, row) => {
				const tableCount = counts.get(table)!;
				const handled =
					table === 'createdTests'
						? upsertGenerationAggregate(handle, runId, row)
						: table === 'studentTestRecords'
							? upsertAssessmentAggregate(handle, runId, row)
							: table === 'testResults'
								? upsertQuestionPerformance(handle, runId, row)
								: importSnapshot(handle, runId, row, snapshotFingerprints);
				if (table === 'usedQuestions' && !handled) tableCount.quarantined += 1;
				if (handled) tableCount.aggregated += 1;
				else if (table !== 'usedQuestions') {
					quarantine(
						handle,
						runId,
						table,
						null,
						'unreliable_historical_join',
						null,
						fingerprint([table, tableCount.source]),
						'excluded'
					);
					tableCount.excluded += 1;
				}
			}
		);

		for (const table of ['instructors', 'logins', 'stamp', 'test_info'] as const)
			counts.get(table)!.excluded = counts.get(table)!.source;
		const suppressed = finalizeAggregates(handle, runId, counts);
		for (const table of SOURCE_TABLES) {
			const value = counts.get(table)!;
			prepared(
				handle,
				`INSERT INTO source_table_inventories
				(id, import_run_id, source_table, disposition, source_count, accepted_count,
				 quarantined_count, excluded_count, aggregated_count, suppressed_count)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			).run(
				importedId(table, table, 'source_table_inventories'),
				runId,
				table,
				SOURCE_DISPOSITIONS[table],
				value.source,
				value.accepted,
				value.quarantined,
				value.excluded,
				value.aggregated,
				value.suppressed
			);
		}
		const totals = [...counts.values()].reduce(
			(sum, value) => ({
				sourceRows: sum.sourceRows + value.source,
				accepted: sum.accepted + value.accepted,
				quarantined: sum.quarantined + value.quarantined,
				excluded: sum.excluded + value.excluded,
				aggregated: sum.aggregated + value.aggregated
			}),
			{ sourceRows: 0, accepted: 0, quarantined: 0, excluded: 0, aggregated: 0 }
		);
		prepared(
			handle,
			`UPDATE import_runs SET status = 'completed', completed_at = ?, source_row_count = ?,
			accepted_count = ?, quarantined_count = ?, excluded_count = ?, aggregated_count = ?,
			suppressed_group_count = ? WHERE id = ?`
		).run(
			IMPORTED_AT,
			totals.sourceRows,
			totals.accepted,
			totals.quarantined,
			totals.excluded,
			totals.aggregated,
			suppressed,
			runId
		);
		handle.sqlite.exec('COMMIT');
		transactionOpen = false;
		return {
			...totals,
			suppressed,
			runId,
			sourceChecksum: source.sha256,
			status: 'completed',
			alreadyImported: false
		};
	} catch {
		if (transactionOpen) {
			try {
				handle.sqlite.exec('ROLLBACK');
			} catch {
				/* preserve redacted failure */
			}
		}
		throw new LegacyImportError();
	}
}
