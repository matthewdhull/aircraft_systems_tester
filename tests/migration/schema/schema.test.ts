import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

const handles: DatabaseHandle[] = [];

function open(): DatabaseHandle {
	const handle = openDatabase({ path: ':memory:' });
	handles.push(handle);
	return handle;
}

function createImportRun(handle: DatabaseHandle, id = 'run-1'): void {
	handle.sqlite
		.prepare(
			`INSERT INTO import_runs
			(id, importer_version, source_checksum, source_byte_size, status, started_at)
			VALUES (?, ?, ?, ?, 'started', ?)`
		)
		.run(id, 'phase3-test', 'a'.repeat(64), 1, '2026-07-12T00:00:00.000Z');
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('canonical schema', () => {
	it('migrates an empty database with integrity and foreign keys intact', () => {
		const handle = open();
		const requiredTables = [
			'import_runs',
			'legacy_tpos',
			'phases',
			'question_versions',
			'test_template_versions',
			'exam_instances',
			'historical_assessment_aggregates',
			'quarantine_records'
		];

		for (const table of requiredTables) {
			expect(
				handle.sqlite
					.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?")
					.pluck()
					.get(table)
			).toBe(1);
		}
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
		expect(handle.sqlite.pragma('quick_check', { simple: true })).toBe('ok');
	});

	it('starts the future hierarchy and reviewed legacy mappings empty', () => {
		const handle = open();
		for (const table of [
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
			'legacy_curriculum_mappings'
		]) {
			expect(handle.sqlite.prepare(`SELECT count(*) FROM ${table}`).pluck().get()).toBe(0);
		}
	});

	it('preserves source identifiers and blocks duplicate mappings', () => {
		const handle = open();
		createImportRun(handle);
		handle.sqlite
			.prepare(
				'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
			)
			.run('tpo-a', '001', '001', 'Synthetic curriculum', 'run-1');

		expect(() =>
			handle.sqlite
				.prepare(
					'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
				)
				.run('tpo-b', '001', '002', 'Duplicate source', 'run-1')
		).toThrow();
	});

	it('restricts deletion of referenced curriculum while allowing safe leaf cleanup', () => {
		const handle = open();
		createImportRun(handle);
		handle.sqlite
			.prepare(
				'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
			)
			.run('tpo-a', '1', '1', 'Synthetic root', 'run-1');
		handle.sqlite
			.prepare(
				'INSERT INTO legacy_spos (id, source_id, legacy_tpo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.run('spo-a', '2', 'tpo-a', '2', 'Synthetic child', 'run-1');

		expect(() =>
			handle.sqlite.prepare('DELETE FROM legacy_tpos WHERE id = ?').run('tpo-a')
		).toThrow();
		handle.sqlite.prepare('DELETE FROM legacy_spos WHERE id = ?').run('spo-a');
		handle.sqlite.prepare('DELETE FROM legacy_tpos WHERE id = ?').run('tpo-a');
		expect(handle.sqlite.prepare('SELECT count(*) FROM legacy_tpos').pluck().get()).toBe(0);
	});

	it('requires published status before a question version is generation eligible', () => {
		const handle = open();
		for (const [id, employee] of [
			['author-a', '1001'],
			['reviewer-a', '1002']
		]) {
			handle.sqlite
				.prepare(
					`INSERT INTO users
					 (id, employee_number, first_name, last_name, status, created_at, updated_at)
					 VALUES (?, ?, 'Synthetic', 'Schema', 'active', ?, ?)`
				)
				.run(id, employee, '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z');
		}
		handle.sqlite
			.prepare('INSERT INTO questions (id, created_at) VALUES (?, ?)')
			.run('question-a', '2026-07-12T00:00:00.000Z');
		const insert = handle.sqlite.prepare(
			`INSERT INTO question_versions
			(id, question_id, version, question_type, lifecycle, generation_status,
			 authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at, effective_from)
			VALUES (?, ?, 1, 'single_choice', ?, ?, 'author-a', 'reviewer-a', ?, ?, ?, ?)`
		);

		expect(() =>
			insert.run(
				'version-a',
				'question-a',
				'draft',
				'eligible',
				'2026-07-12T00:00:00.000Z',
				'2026-07-12T00:00:00.000Z',
				'2026-07-12T00:00:00.000Z',
				'2026-07-12T00:00:00.000Z'
			)
		).toThrow();
		insert.run(
			'version-a',
			'question-a',
			'published',
			'eligible',
			'2026-07-12T00:00:00.000Z',
			'2026-07-12T00:00:00.000Z',
			'2026-07-12T00:00:00.000Z',
			'2026-07-12T00:00:00.000Z'
		);
		expect(() =>
			handle.sqlite.prepare('DELETE FROM questions WHERE id = ?').run('question-a')
		).toThrow();
	});

	it('enforces the quarantine taxonomy and restricted snapshot payload boundary', () => {
		const handle = open();
		createImportRun(handle);
		const insert = handle.sqlite.prepare(
			`INSERT INTO quarantine_records
			(id, import_run_id, source_table, source_id, reason_code, disposition, restricted_payload_json, created_at)
			VALUES (?, 'run-1', ?, ?, ?, 'quarantined', ?, ?)`
		);

		expect(() =>
			insert.run('q-1', 'questions', '1', 'invented_reason', null, '2026-07-12T00:00:00.000Z')
		).toThrow();
		expect(() =>
			insert.run(
				'q-2',
				'usedQuestions',
				null,
				'restricted_snapshot_only_content',
				null,
				'2026-07-12T00:00:00.000Z'
			)
		).toThrow();
		expect(() =>
			insert.run(
				'q-2',
				'usedQuestions',
				'generated-link',
				'restricted_snapshot_only_content',
				'{}',
				'2026-07-12T00:00:00.000Z'
			)
		).toThrow();
		insert.run(
			'q-2',
			'usedQuestions',
			null,
			'restricted_snapshot_only_content',
			'{}',
			'2026-07-12T00:00:00.000Z'
		);
	});

	it('prevents publication of historical aggregate groups smaller than five', () => {
		const handle = open();
		createImportRun(handle);
		const insert = handle.sqlite.prepare(
			`INSERT INTO historical_assessment_aggregates
			(id, import_run_id, calendar_year, group_size, attempt_count, publication_state)
			VALUES (?, 'run-1', 2014, ?, ?, ?)`
		);

		expect(() => insert.run('aggregate-1', 4, 4, 'published')).toThrow();
		insert.run('aggregate-1', 4, 4, 'suppressed');
		insert.run('aggregate-2', 5, 5, 'published');
	});

	it('keeps leading-zero employee identifiers distinct and unique', () => {
		const handle = open();
		const insert = handle.sqlite.prepare(
			`INSERT INTO users
			(id, employee_number, first_name, last_name, status, created_at, updated_at)
			VALUES (?, ?, 'Synthetic', 'User', 'pending', ?, ?)`
		);
		const timestamp = '2026-07-12T00:00:00.000Z';
		insert.run('user-a', '0007', timestamp, timestamp);
		insert.run('user-b', '7', timestamp, timestamp);
		expect(() => insert.run('user-c', '0007', timestamp, timestamp)).toThrow();
	});

	it('uses child-side indexes for representative future joins', () => {
		const handle = open();
		const plans = [
			handle.sqlite
				.prepare('EXPLAIN QUERY PLAN SELECT id FROM exam_attempts WHERE roster_member_id = ?')
				.all('member-a'),
			handle.sqlite
				.prepare(
					'EXPLAIN QUERY PLAN SELECT question_version_id FROM question_aircraft_applicability WHERE aircraft_variant_id = ?'
				)
				.all('variant-a')
		]
			.flat()
			.map((row) => String((row as { detail: unknown }).detail));

		expect(plans.some((detail) => detail.includes('exam_attempts_roster_member_idx'))).toBe(true);
		expect(
			plans.some((detail) => detail.includes('question_aircraft_applicability_variant_idx'))
		).toBe(true);
	});
});
