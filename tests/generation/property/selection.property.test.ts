import { describe, expect, it } from 'vitest';

import { AstSelectionV1Random, selectQuestions } from '$lib/server/generation/selection/index.js';

describe('selection invariants', () => {
	it('maintains exact counts, uniqueness, and mandatory coverage over representative seeds', () => {
		for (let seed = 1; seed <= 128; seed += 1) {
			const result = selectQuestions({
				algorithmVersion: 'ast-selection-v1',
				seedBytes: Uint8Array.of(seed),
				rules: [
					{ id: 'a', position: 1, subtaskVersionId: 'a', count: 5 },
					{ id: 'b', position: 2, subtaskVersionId: 'b', count: 5 }
				],
				mandatoryElements: [
					{ elementVersionId: 'ea', subtaskVersionId: 'a', position: 1 },
					{ elementVersionId: 'eb', subtaskVersionId: 'b', position: 2 }
				],
				candidates: Array.from({ length: 30 }, (_, index) => ({
					questionVersionId: `q-${index.toString().padStart(2, '0')}`,
					eligible: true,
					subtaskVersionIds: index < 10 ? ['a'] : index < 20 ? ['b'] : ['a', 'b'],
					elementVersionIds: index === 0 ? ['ea'] : index === 10 ? ['eb'] : []
				}))
			});
			expect(result.ok).toBe(true);
			if (!result.ok) continue;
			expect(result.assignments).toHaveLength(10);
			expect(new Set(result.assignments.map((item) => item.questionVersionId)).size).toBe(10);
			expect(result.assignments.filter((item) => item.ruleId === 'a')).toHaveLength(5);
			expect(result.assignments.filter((item) => item.ruleId === 'b')).toHaveLength(5);
			expect(result.mandatoryAssignments).toHaveLength(2);
		}
	});

	it('uses rejection sampling at the 32-bit boundary', () => {
		const random = new AstSelectionV1Random(Uint8Array.of(9));
		for (const bound of [1, 2, 3, 7, 255, 65_537, 2 ** 32]) {
			for (let index = 0; index < 100; index += 1) {
				const value = random.nextBoundedInt(bound);
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(bound);
			}
		}
	});

	it('handles empty inventory as a failure and never success with a partial result', () => {
		const result = selectQuestions({
			algorithmVersion: 'ast-selection-v1',
			seedBytes: Uint8Array.of(1),
			rules: [{ id: 'a', position: 1, subtaskVersionId: 'a', count: 1 }],
			mandatoryElements: [],
			candidates: []
		});
		expect(result).toMatchObject({ ok: false, code: 'SELECTION_SHORTAGE' });
		expect('assignments' in result).toBe(false);
	});
});
