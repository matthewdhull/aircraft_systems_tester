import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import CreateNodeForm from '../../../src/lib/components/curriculum/CreateNodeForm.svelte';
import CurriculumHierarchy from '../../../src/lib/components/curriculum/CurriculumHierarchy.svelte';
import DependencyWarning from '../../../src/lib/components/curriculum/DependencyWarning.svelte';
import CurriculumPage from '../../../src/routes/admin/curriculum/+page.svelte';
import type {
	CurriculumHierarchyDto,
	CurriculumNodeDto,
	DependencyWarningResult
} from '../../../src/lib/server/curriculum/index.js';

afterEach(() => cleanup());

const first: CurriculumNodeDto = {
	id: '10000000-0000-4000-8000-000000000001',
	type: 'phase',
	createdAt: '2026-07-13T12:00:00.000Z',
	retiredAt: null,
	latestVersion: {
		id: '20000000-0000-4000-8000-000000000001',
		nodeId: '10000000-0000-4000-8000-000000000001',
		nodeType: 'phase',
		version: 1,
		name: 'Ground systems',
		description: 'A draft phase.',
		position: 0,
		status: 'draft',
		parentVersionId: null,
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

const second: CurriculumNodeDto = {
	...first,
	id: '10000000-0000-4000-8000-000000000002',
	latestVersion: {
		...first.latestVersion,
		id: '20000000-0000-4000-8000-000000000002',
		nodeId: '10000000-0000-4000-8000-000000000002',
		name: 'Flight systems',
		position: 1
	}
};

const hierarchy: CurriculumHierarchyDto = {
	generatedAt: '2026-07-13T12:00:00.000Z',
	rootOrderRevision: 'root-revision',
	phases: [
		{ node: first, childrenOrderRevision: 'first-children', tasks: [] },
		{ node: second, childrenOrderRevision: 'second-children', tasks: [] }
	]
};

describe('curriculum accessibility contract', () => {
	it('uses native disclosure and named button controls for keyboard hierarchy operation', async () => {
		render(CurriculumHierarchy, {
			hierarchy,
			bloomLevels: [],
			dependencyWarnings: []
		});

		const add = screen.getByText('Add Phase').closest('summary');
		expect(add).toBeTruthy();
		add!.focus();
		expect(document.activeElement).toBe(add);
		await fireEvent.click(add!);
		expect(document.getElementById('create-phase-root-name')).toBeTruthy();

		const moveDown = screen.getByRole('button', { name: 'Move Ground systems down' });
		moveDown.focus();
		expect(document.activeElement).toBe(moveDown);
		const form = moveDown.closest('form')!;
		expect(form.getAttribute('method')).toBe('POST');
		expect(
			within(form).getByDisplayValue('node-20000000-0000-4000-8000-000000000001')
		).toBeTruthy();
	});

	it('restores focus to the changed hierarchy heading after a successful enhanced response', async () => {
		render(CurriculumPage, {
			data: {
				hierarchy,
				bloomLevels: [],
				dependencyWarnings: [],
				principal: null,
				visibleNavigationItemIds: []
			},
			form: {
				operation: 'reorderSiblings',
				success: true,
				focusId: 'node-20000000-0000-4000-8000-000000000001'
			}
		});

		expect(screen.getByRole('status').textContent).toContain('Sibling order updated');
		await waitFor(() =>
			expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Ground systems' }))
		);
	});

	it('announces server-derived dependency counts and retirement guidance', () => {
		const warning: DependencyWarningResult = {
			entityId: first.id,
			entityType: 'phase',
			operation: 'delete',
			revision: 'warning-revision',
			items: [{ kind: 'child_version', count: 2, blocking: true }],
			totalCount: 2,
			blocksHardDelete: true,
			requiresRetirement: true
		};
		render(DependencyWarning, { warning });

		const status = screen.getByRole('status');
		expect(status.textContent).toContain('server found 2');
		expect(status.textContent).toContain('must be retired instead of deleted');
		expect(status.textContent).toContain('child version: 2 (blocking)');
	});

	it('associates field errors with the invalid control for an enhanced validation response', () => {
		render(CreateNodeForm, {
			type: 'phase',
			bloomLevels: [],
			fields: [{ field: 'name', message: 'Enter a phase name.' }],
			open: true
		});

		const name = screen.getByRole('textbox', { name: /Phase name/ });
		expect(name.getAttribute('aria-invalid')).toBe('true');
		const describedBy = name.getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();
		expect(document.getElementById(describedBy!)?.textContent).toContain('Enter a phase name.');
	});

	it('keeps lifecycle state as visible text rather than color alone', () => {
		render(CurriculumHierarchy, {
			hierarchy,
			bloomLevels: [],
			dependencyWarnings: []
		});
		expect(screen.getAllByText('draft')).toHaveLength(2);
		expect(screen.getAllByText('Version 1')).toHaveLength(2);
	});

	it('retains the narrow-layout rules for hierarchy and multi-column management panels', () => {
		const source = (name: string) =>
			readFileSync(resolve(process.cwd(), 'src/lib/components/curriculum', name), 'utf8');
		const nodeCard = source('CurriculumNodeCard.svelte');
		expect(nodeCard).toContain('@media (max-width: 35rem)');
		expect(nodeCard).toMatch(/header\s*\{[^}]*flex-direction:\s*column/s);
		expect(source('NodeLifecycle.svelte')).toContain('minmax(min(100%, 18rem), 1fr)');
		expect(source('BloomVocabulary.svelte')).toContain('@media (max-width: 42rem)');
		expect(source('LegacyMappingReview.svelte')).toContain('minmax(min(100%, 22rem), 1fr)');
	});
});
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
