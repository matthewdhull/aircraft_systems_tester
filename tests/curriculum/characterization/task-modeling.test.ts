import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { REJECTED_LEGACY_DEFECTS, TASK_MODELING_CASES } from './cases.js';

const handles: DatabaseHandle[] = [];

function source(path: string): string {
	return readFileSync(resolve(process.cwd(), path), 'utf8');
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('legacy task-modeling characterization inventory', () => {
	it('catalogs every required Phase 5 workflow with repository evidence', () => {
		const ids = new Set(TASK_MODELING_CASES.map((item) => item.id));
		for (const required of [
			'read-hierarchy',
			'create-phase',
			'create-task',
			'create-subtask',
			'create-element',
			'edit-phase',
			'edit-task',
			'edit-subtask',
			'edit-element',
			'reorder-siblings',
			'bloom-selection',
			'safe-draft-delete',
			'retire-published-or-referenced',
			'parent-dependency-warning',
			'invalid-fields',
			'authorization-denial',
			'atomic-rollback'
		]) {
			expect(ids.has(required), required).toBe(true);
		}

		for (const item of TASK_MODELING_CASES) {
			expect(item.targetAssertion.trim().length).toBeGreaterThan(0);
			for (const evidence of item.legacyEvidence) {
				expect(source(evidence).length, evidence).toBeGreaterThan(0);
			}
		}
	});

	it('captures the nested endpoint families and Bloom lookups without treating them as authorization', () => {
		const page = source('taskModeling.php');
		for (const endpoint of [
			'getPhases.php',
			'getTasks.php',
			'getSubtasks.php',
			'getElements.php',
			'createPhase.php',
			'updateTask.php',
			'deleteElement.php',
			'getBlooms.php',
			'getBloomsVerbs.php'
		]) {
			expect(page).toContain(endpoint);
		}
		expect(page).not.toMatch(/requirePermission|curriculum\.manage/);
	});

	it('records the complete rejected-defect boundary', () => {
		expect(REJECTED_LEGACY_DEFECTS).toEqual([
			'unauthenticated task-modeling access',
			'hard deletion of referenced content',
			'missing server validation',
			'guessed legacy-to-future mappings',
			'client-side-only authorization',
			'partial reorder writes',
			'malformed content-bearing errors',
			'invented fixed vocabulary'
		]);
	});
});

describe('empty future-curriculum boundary', () => {
	it('applies every prior migration with no future hierarchy, Bloom, or mapping rows', () => {
		const handle = openDatabase({ path: ':memory:' });
		handles.push(handle);
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
			expect(handle.sqlite.prepare(`SELECT count(*) FROM ${table}`).pluck().get(), table).toBe(0);
		}
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
	});

	it('keeps all fifteen Phase 3 source dispositions explicit and unchanged', () => {
		const disposition = source('docs/discovery/phase-0/SOURCE_EXPORT_DISPOSITION.md');
		for (const table of [
			'TPO',
			'SPO',
			'EO',
			'variant',
			'questions',
			'test_model',
			'testModel',
			'createdTests',
			'usedQuestions',
			'studentTestRecords',
			'testResults',
			'instructors',
			'logins',
			'stamp',
			'test_info'
		]) {
			expect(disposition).toContain(`\`${table}\``);
		}
		expect(disposition).toContain('Do not reinterpret legacy');
	});
});
