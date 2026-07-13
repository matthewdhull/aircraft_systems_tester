import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';

const handles: DatabaseHandle[] = [];

function database(): DatabaseHandle {
	const handle = openDatabase({ path: ':memory:' });
	handles.push(handle);
	return handle;
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('Phase 6 ordered question-bank migration', () => {
	it('initializes 65 application tables through 0011 with integrity intact', () => {
		const handle = database();
		expect(handle.sqlite.prepare('SELECT count(*) FROM __drizzle_migrations').pluck().get()).toBe(
			12
		);
		expect(
			handle.sqlite
				.prepare(
					"SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> '__drizzle_migrations'"
				)
				.pluck()
				.get()
		).toBe(65);
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
		expect(handle.sqlite.prepare('PRAGMA table_info(question_versions)').all()).toEqual(
			expect.arrayContaining([expect.objectContaining({ name: 'reviewed_at' })])
		);
		expect(
			handle.sqlite.prepare('PRAGMA table_info(question_future_curriculum_links)').all()
		).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'proposed_by_user_id', notnull: 1 }),
				expect.objectContaining({ name: 'proposed_at', notnull: 1 }),
				expect.objectContaining({ name: 'reviewed_at' })
			])
		);
	});

	it('enforces distinct review attribution and publication completeness', () => {
		const handle = database();
		const at = '2026-07-13T16:00:00.000Z';
		const author = '10000000-0000-4000-8000-000000000001';
		const reviewer = '10000000-0000-4000-8000-000000000002';
		for (const [id, employee] of [
			[author, '1'],
			[reviewer, '2']
		])
			handle.sqlite
				.prepare(
					`INSERT INTO users
					 (id, employee_number, first_name, last_name, status, created_at, updated_at)
					 VALUES (?, ?, 'Synthetic', 'User', 'active', ?, ?)`
				)
				.run(id, employee, at, at);
		handle.sqlite
			.prepare('INSERT INTO questions (id, created_at) VALUES (?, ?)')
			.run('20000000-0000-4000-8000-000000000001', at);
		expect(() =>
			handle.sqlite
				.prepare(
					`INSERT INTO question_versions
					 (id, question_id, version, question_type, lifecycle, generation_status,
					  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at)
					 VALUES (?, ?, 1, 'single_choice', 'review', 'blocked', ?, ?, ?, ?)`
				)
				.run(
					'20000000-0000-4000-8000-000000000002',
					'20000000-0000-4000-8000-000000000001',
					author,
					author,
					at,
					at
				)
		).toThrow(/CHECK/);
		expect(() =>
			handle.sqlite
				.prepare(
					`INSERT INTO question_versions
					 (id, question_id, version, question_type, lifecycle, generation_status,
					  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at)
					 VALUES (?, ?, 1, 'single_choice', 'published', 'blocked', ?, ?, ?, ?)`
				)
				.run(
					'20000000-0000-4000-8000-000000000003',
					'20000000-0000-4000-8000-000000000001',
					author,
					reviewer,
					at,
					at
				)
		).toThrow(/CHECK/);
	});

	it('uses Phase 6 filter and applicability indexes without reading answer rows', () => {
		const handle = database();
		const filterPlan = handle.sqlite
			.prepare(
				`EXPLAIN QUERY PLAN SELECT id FROM question_versions
				 WHERE question_type = 'single_choice' AND lifecycle = 'published'
				 AND generation_status = 'eligible' ORDER BY created_at`
			)
			.all()
			.map((row) => String((row as { detail: string }).detail))
			.join(' ');
		expect(filterPlan).toContain('question_versions_filter_idx');
		expect(filterPlan).not.toContain('question_options');

		const aircraftPlan = handle.sqlite
			.prepare(
				`EXPLAIN QUERY PLAN SELECT question_version_id
				 FROM question_aircraft_applicability WHERE aircraft_variant_id = ?`
			)
			.all('30000000-0000-4000-8000-000000000001')
			.map((row) => String((row as { detail: string }).detail))
			.join(' ');
		expect(aircraftPlan).toContain('question_aircraft_applicability_variant_idx');
	});
});
