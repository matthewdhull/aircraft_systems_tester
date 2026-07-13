import { cleanup, render, screen, waitFor, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import BloomVocabulary from '../../../src/lib/components/curriculum/BloomVocabulary.svelte';
import CurriculumHierarchy from '../../../src/lib/components/curriculum/CurriculumHierarchy.svelte';
import LegacyMappingReview from '../../../src/lib/components/curriculum/LegacyMappingReview.svelte';
import CurriculumPage from '../../../src/routes/admin/curriculum/+page.svelte';
import type {
	CurriculumHierarchyDto,
	CurriculumNodeDto,
	CurriculumNodeType
} from '../../../src/lib/server/curriculum/types.js';

afterEach(() => cleanup());

function node(
	id: string,
	type: CurriculumNodeType,
	name: string,
	position: number,
	parentVersionId: string | null = null
): CurriculumNodeDto {
	return {
		id,
		type,
		createdAt: '2026-07-13T12:00:00.000Z',
		retiredAt: null,
		latestVersion: {
			id: id.replace(/^1/, '2'),
			nodeId: id,
			nodeType: type,
			version: 1,
			name,
			description: null,
			position,
			status: 'draft',
			parentVersionId,
			bloomVerbId: null,
			effectiveFrom: null,
			effectiveTo: null,
			authoredByUserId: '90000000-0000-4000-8000-000000000001',
			reviewedByUserId: null,
			reviewedAt: null,
			createdAt: '2026-07-13T12:00:00.000Z',
			publishedAt: null,
			retiredAt: null
		}
	};
}

const emptyHierarchy: CurriculumHierarchyDto = {
	generatedAt: '2026-07-13T12:00:00.000Z',
	rootOrderRevision: 'empty-revision',
	phases: []
};

describe('curriculum hierarchy UI', () => {
	it('explains and supports the intentionally empty initial state', () => {
		render(CurriculumHierarchy, {
			hierarchy: emptyHierarchy,
			bloomLevels: [],
			dependencyWarnings: []
		});

		expect(screen.getByRole('heading', { name: 'The future curriculum is empty' })).toBeTruthy();
		expect(screen.getByText(/Historical TPO\/SPO\/EO records are not copied/i)).toBeTruthy();
		expect(screen.getByRole('textbox', { name: 'Phase name' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Create Phase draft' })).toBeTruthy();
	});

	it('provides keyboard-operable sibling movement with a complete deterministic order', () => {
		const first = node('10000000-0000-4000-8000-000000000001', 'phase', 'Ground', 0);
		const second = node('10000000-0000-4000-8000-000000000002', 'phase', 'Flight', 1);
		const hierarchy: CurriculumHierarchyDto = {
			...emptyHierarchy,
			rootOrderRevision: 'root-revision',
			phases: [
				{ node: first, childrenOrderRevision: 'none-1', tasks: [] },
				{ node: second, childrenOrderRevision: 'none-2', tasks: [] }
			]
		};
		render(CurriculumHierarchy, { hierarchy, bloomLevels: [], dependencyWarnings: [] });

		const moveDown = screen.getByRole('button', { name: 'Move Ground down' });
		const moveUp = screen.getByRole('button', { name: 'Move Flight up' });
		expect(moveDown).toBeTruthy();
		expect(moveUp).toBeTruthy();
		expect(moveDown.tabIndex).toBe(0);
		const form = moveDown.closest('form')!;
		expect(form.getAttribute('action')).toBe('?/reorderSiblings');
		expect(
			Array.from(form.querySelectorAll<HTMLInputElement>('input[name="orderedVersionIds"]')).map(
				(input) => input.value
			)
		).toEqual(['20000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001']);
		expect(within(form).getByDisplayValue('root-revision')).toBeTruthy();
	});

	it('does not offer partial reordering for a mixed-lifecycle sibling group', () => {
		const draft = node('10000000-0000-4000-8000-000000000001', 'phase', 'Ground', 0);
		const publishedDraft = node('10000000-0000-4000-8000-000000000002', 'phase', 'Flight', 1);
		const published: CurriculumNodeDto = {
			...publishedDraft,
			latestVersion: {
				...publishedDraft.latestVersion,
				status: 'published',
				effectiveFrom: '2026-07-13T12:00:00.000Z'
			}
		};
		const hierarchy: CurriculumHierarchyDto = {
			...emptyHierarchy,
			rootOrderRevision: 'draft-only-revision',
			phases: [
				{ node: draft, childrenOrderRevision: 'none-1', tasks: [] },
				{ node: published, childrenOrderRevision: 'none-2', tasks: [] }
			]
		};
		render(CurriculumHierarchy, { hierarchy, bloomLevels: [], dependencyWarnings: [] });

		expect(screen.queryByRole('button', { name: /Move Ground/ })).toBeNull();
		expect(screen.queryByRole('button', { name: /Move Flight/ })).toBeNull();
	});

	it('announces server validation errors and focuses the error summary', async () => {
		render(CurriculumPage, {
			data: {
				hierarchy: emptyHierarchy,
				bloomLevels: [],
				dependencyWarnings: [],
				principal: null,
				visibleNavigationItemIds: []
			},
			form: {
				operation: 'createNode',
				error: 'invalid_input',
				fields: [{ field: 'name', message: 'This field is required.' }],
				fieldPrefix: 'create-phase-root'
			}
		});

		const alert = screen.getByRole('alert');
		expect(alert.textContent).toContain('This field is required.');
		expect(screen.getByRole('link', { name: 'This field is required.' }).getAttribute('href')).toBe(
			'#create-phase-root-name'
		);
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Phase name' }).getAttribute('aria-invalid')).toBe(
				'true'
			)
		);
		await waitFor(() => expect(document.activeElement).toBe(alert));
	});
});

describe('Bloom vocabulary UI', () => {
	it('starts empty and exposes labeled level creation', () => {
		render(BloomVocabulary, { levels: [], dependencyWarnings: [] });
		expect(screen.getByRole('heading', { name: 'No Bloom vocabulary' })).toBeTruthy();
		expect(screen.getByRole('textbox', { name: 'Level name' })).toBeTruthy();
		expect(screen.getByRole('spinbutton', { name: 'Ordinal' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Create level draft' })).toBeTruthy();
	});
});

describe('legacy mapping review UI', () => {
	it('states the manual decision and question-eligibility boundary', () => {
		render(LegacyMappingReview, {
			legacyHierarchy: [],
			mappings: [],
			hierarchy: emptyHierarchy,
			reconciliation: {
				generatedAt: '2026-07-13T12:00:00.000Z',
				legacyTotals: { tpo: 0, spo: 0, eo: 0 },
				unmappedBySourceType: { tpo: 0, spo: 0, eo: 0 },
				statusCounts: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
				countsBySourceType: {
					tpo: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
					spo: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
					eo: { proposed: 0, approved: 0, rejected: 0, retired: 0 }
				},
				countsByTargetType: {
					phase: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
					task: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
					subtask: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
					element: { proposed: 0, approved: 0, rejected: 0, retired: 0 }
				},
				checks: [],
				passed: true
			}
		});

		const boundary = screen
			.getByRole('heading', { name: 'Manual review boundary' })
			.closest('section')!;
		expect(boundary.textContent).toContain('explicit attributable decision');
		expect(boundary.textContent).toMatch(/does\s+not link questions/);
		expect(screen.getByText(/Nothing is inferred automatically/i)).toBeTruthy();
	});
});
