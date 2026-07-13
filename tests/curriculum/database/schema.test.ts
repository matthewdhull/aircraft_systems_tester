import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';

const handles: DatabaseHandle[] = [];

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

function database(): DatabaseHandle {
	const handle = openDatabase({ path: ':memory:' });
	handles.push(handle);
	return handle;
}

describe('Phase 5 ordered curriculum migrations', () => {
	it('initializes cleanly through 0009 with foreign-key and integrity checks', () => {
		const handle = database();
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
		expect(handle.sqlite.prepare('SELECT count(*) FROM __drizzle_migrations').pluck().get()).toBe(
			10
		);
		for (const table of [
			'phases',
			'tasks',
			'subtasks',
			'elements',
			'bloom_levels',
			'bloom_verbs'
		]) {
			expect(handle.sqlite.prepare(`SELECT count(*) FROM ${table}`).pluck().get()).toBe(0);
		}
	});

	it('rolls back a failed migration transaction without a partial target table', () => {
		const sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');
		const db = drizzle(sqlite);
		expect(() => migrate(db, { migrationsFolder: 'tests/curriculum/database/missing' })).toThrow();
		expect(
			sqlite.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'phases'").pluck().get()
		).toBe(0);
		sqlite.close();
	});

	it('rejects duplicate editable sibling positions and invalid lifecycle data', () => {
		const handle = database();
		const now = '2026-07-13T16:00:00.000Z';
		handle.sqlite
			.prepare(
				"INSERT INTO users (id, employee_number, first_name, last_name, status, created_at, updated_at) VALUES ('u1', '1', 'A', 'A', 'active', ?, ?)"
			)
			.run(now, now);
		handle.sqlite
			.prepare("INSERT INTO phases (id, created_at) VALUES ('p1', ?), ('p2', ?)")
			.run(now, now);
		handle.sqlite
			.prepare(
				"INSERT INTO phase_versions (id, phase_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('v1', 'p1', 1, 'One', 0, 'draft', 'u1', ?)"
			)
			.run(now);
		expect(() =>
			handle.sqlite
				.prepare(
					"INSERT INTO phase_versions (id, phase_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('v2', 'p2', 1, 'Two', 0, 'draft', 'u1', ?)"
				)
				.run(now)
		).toThrow(/UNIQUE/);
		expect(() =>
			handle.sqlite
				.prepare(
					"INSERT INTO phase_versions (id, phase_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('bad', 'p2', 1, 'Bad', 1, 'invented', 'u1', ?)"
				)
				.run(now)
		).toThrow(/CHECK/);
	});

	it('enforces parent foreign keys, referenced delete restrictions, and mapping review consistency', () => {
		const handle = database();
		const now = '2026-07-13T16:00:00.000Z';
		handle.sqlite
			.prepare(
				"INSERT INTO users (id, employee_number, first_name, last_name, status, created_at, updated_at) VALUES ('u1', '1', 'A', 'A', 'active', ?, ?)"
			)
			.run(now, now);
		expect(() =>
			handle.sqlite
				.prepare(
					"INSERT INTO task_versions (id, task_id, phase_version_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('tv', 'missing-task', 'missing-phase', 1, 'Task', 0, 'draft', 'u1', ?)"
				)
				.run(now)
		).toThrow(/FOREIGN KEY/);
		handle.sqlite.prepare("INSERT INTO phases (id, created_at) VALUES ('p', ?)").run(now);
		handle.sqlite
			.prepare(
				"INSERT INTO phase_versions (id, phase_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('pv', 'p', 1, 'Phase', 0, 'draft', 'u1', ?)"
			)
			.run(now);
		handle.sqlite.prepare("INSERT INTO tasks (id, created_at) VALUES ('t', ?)").run(now);
		handle.sqlite
			.prepare(
				"INSERT INTO task_versions (id, task_id, phase_version_id, version, name, position, status, authored_by_user_id, created_at) VALUES ('tv', 't', 'pv', 1, 'Task', 0, 'draft', 'u1', ?)"
			)
			.run(now);
		expect(() => handle.sqlite.prepare("DELETE FROM phase_versions WHERE id = 'pv'").run()).toThrow(
			/FOREIGN KEY/
		);

		expect(() =>
			handle.sqlite
				.prepare(
					"INSERT INTO legacy_curriculum_mappings (id, legacy_entity_type, legacy_entity_id, target_entity_type, target_entity_id, status, proposed_by_user_id, proposed_at, reviewed_by_user_id, rationale) VALUES ('m', 'tpo', 'legacy', 'phase', 'target', 'proposed', 'u1', ?, 'u1', 'Proposal')"
				)
				.run(now)
		).toThrow(/CHECK/);
	});
});
