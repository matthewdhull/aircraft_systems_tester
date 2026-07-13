import { describe, expect, it } from 'vitest';

import { selectQuestions, type SelectionInput } from '$lib/server/generation/selection/index.js';

const seed = (value: number) => Uint8Array.of(value, 2, 3, 4);
const base = (overrides: Partial<SelectionInput> = {}): SelectionInput => ({
	algorithmVersion: 'ast-selection-v1',
	seedBytes: seed(1),
	rules: [{ id: 'rule-a', position: 1, subtaskVersionId: 'sub-a', count: 2 }],
	mandatoryElements: [{ elementVersionId: 'element-a', subtaskVersionId: 'sub-a', position: 1 }],
	candidates: [
		{
			questionVersionId: 'q1',
			eligible: true,
			subtaskVersionIds: ['sub-a'],
			elementVersionIds: ['element-a']
		},
		{
			questionVersionId: 'q2',
			eligible: true,
			subtaskVersionIds: ['sub-a'],
			elementVersionIds: []
		},
		{
			questionVersionId: 'q3',
			eligible: false,
			subtaskVersionIds: ['sub-a'],
			elementVersionIds: ['element-a']
		}
	],
	...overrides
});

describe('ast-selection-v1', () => {
	it('returns the exact quota and covers mandatory elements with distinct questions', () => {
		const result = selectQuestions(base());
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.assignments).toHaveLength(2);
		expect(new Set(result.assignments.map((item) => item.questionVersionId)).size).toBe(2);
		expect(result.mandatoryAssignments).toEqual([
			{ elementVersionId: 'element-a', questionVersionId: 'q1' }
		]);
	});

	it('solves overlapping categories instead of committing to a greedy dead end', () => {
		const result = selectQuestions(
			base({
				rules: [
					{ id: 'a', position: 1, subtaskVersionId: 'sub-a', count: 1 },
					{ id: 'b', position: 2, subtaskVersionId: 'sub-b', count: 1 }
				],
				mandatoryElements: [],
				candidates: [
					{
						questionVersionId: 'flex',
						eligible: true,
						subtaskVersionIds: ['sub-a', 'sub-b'],
						elementVersionIds: []
					},
					{
						questionVersionId: 'only-a',
						eligible: true,
						subtaskVersionIds: ['sub-a'],
						elementVersionIds: []
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (result.ok)
			expect(result.assignments.find((item) => item.ruleId === 'b')?.questionVersionId).toBe(
				'flex'
			);
	});

	it('returns safe deterministic category and mandatory shortages without a partial success', () => {
		const input = base({ candidates: [] });
		expect(selectQuestions(input)).toEqual(selectQuestions(input));
		expect(selectQuestions(input)).toMatchObject({ ok: false, code: 'SELECTION_SHORTAGE' });
		expect(JSON.stringify(selectQuestions(input))).not.toContain('1,2,3,4');
	});

	it('rejects unsupported versions, invalid quotas, and conflicting duplicate candidate facts', () => {
		expect(selectQuestions(base({ algorithmVersion: 'future' }))).toMatchObject({
			ok: false,
			code: 'UNSUPPORTED_ALGORITHM'
		});
		expect(
			selectQuestions(base({ rules: [{ id: 'a', position: 1, subtaskVersionId: 'a', count: 0 }] }))
		).toMatchObject({ ok: false, code: 'INVALID_SELECTION_INPUT' });
		const duplicate = base().candidates[0]!;
		expect(
			selectQuestions(base({ candidates: [duplicate, { ...duplicate, eligible: false }] }))
		).toMatchObject({ ok: false, code: 'INVALID_SELECTION_INPUT' });
	});

	it('canonicalizes candidate order and identical duplicate rows', () => {
		const input = base();
		const reordered = base({
			candidates: [
				input.candidates[1]!,
				input.candidates[0]!,
				input.candidates[0]!,
				input.candidates[2]!
			]
		});
		expect(selectQuestions(reordered)).toEqual(selectQuestions(input));
	});

	it('replays the same versioned input exactly', () => {
		expect(selectQuestions(base())).toEqual(selectQuestions(base()));
	});
});
