import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { selectQuestions, type SelectionCandidate } from '$lib/server/generation/selection';

const fixture = JSON.parse(
	readFileSync('fixtures/phase-1/golden-behavior/test-generation.json', 'utf8')
) as { cases: { id: string }[] };
const manifest = JSON.parse(
	readFileSync('fixtures/phase-1/golden-behavior/manifest.json', 'utf8')
) as { entries: { case_ids: string[] }[] };

const candidate = (
	questionVersionId: string,
	subtaskVersionIds: string[],
	elementVersionIds: string[] = []
): SelectionCandidate => ({
	questionVersionId,
	eligible: true,
	subtaskVersionIds,
	elementVersionIds
});

describe('Phase 7 generation golden fixture', () => {
	it('traces every in-scope generation case through the manifest', () => {
		const required = [
			'gen-legacy-mandatory-first-fill',
			'gen-legacy-shortage-silently-shortens',
			'gen-target-exact-composition',
			'gen-target-every-mandatory-element',
			'gen-target-mandatory-shortage-rollback',
			'gen-target-category-shortage-rollback',
			'gen-target-seeded-replay',
			'gen-legacy-snapshot-content',
			'gen-target-snapshot-immutable-after-source-change',
			'gen-target-shared-content-distinct-attempt-order'
		];
		const fixtureIds = new Set(fixture.cases.map(({ id }) => id));
		const manifestIds = new Set(manifest.entries.flatMap(({ case_ids }) => case_ids));
		for (const id of required) {
			expect(fixtureIds.has(id), `${id} fixture`).toBe(true);
			expect(manifestIds.has(id), `${id} manifest trace`).toBe(true);
		}
	});

	it('executes exact composition, mandatory coverage, replay, and shortage regressions', () => {
		const input = {
			algorithmVersion: 'ast-selection-v1',
			seedBytes: Uint8Array.of(11, 22, 33, 44),
			rules: [
				{ id: 'a', position: 1, subtaskVersionId: 'cat-a', count: 3 },
				{ id: 'b', position: 2, subtaskVersionId: 'cat-b', count: 2 }
			],
			mandatoryElements: [
				{ elementVersionId: 'el-a', subtaskVersionId: 'cat-a', position: 1 },
				{ elementVersionId: 'el-b', subtaskVersionId: 'cat-b', position: 2 }
			],
			candidates: [
				candidate('q1', ['cat-a'], ['el-a']),
				candidate('q2', ['cat-a']),
				candidate('q3', ['cat-a']),
				candidate('q4', ['cat-a', 'cat-b']),
				candidate('q5', ['cat-b'], ['el-b']),
				candidate('q6', ['cat-b'])
			]
		} as const;
		const first = selectQuestions(input);
		expect(first).toEqual(selectQuestions(input));
		expect(first.ok).toBe(true);
		if (first.ok) {
			expect(first.assignments).toHaveLength(5);
			expect(
				new Set(first.assignments.map(({ questionVersionId }) => questionVersionId)).size
			).toBe(5);
			expect(
				first.mandatoryAssignments.map(({ elementVersionId }) => elementVersionId).sort()
			).toEqual(['el-a', 'el-b']);
		}
		const shortage = selectQuestions({ ...input, candidates: input.candidates.slice(0, 2) });
		expect(shortage).toMatchObject({ ok: false, code: 'SELECTION_SHORTAGE' });
		expect(shortage).not.toHaveProperty('assignments');
	});
});
