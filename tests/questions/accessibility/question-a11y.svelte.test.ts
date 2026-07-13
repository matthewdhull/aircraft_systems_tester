import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import QuestionEditorForm from '../../../src/lib/components/questions/QuestionEditorForm.svelte';
import QuestionFilters from '../../../src/lib/components/questions/QuestionFilters.svelte';
import QuestionPreview from '../../../src/lib/components/questions/QuestionPreview.svelte';
import QuestionTypeSelector from '../../../src/lib/components/questions/QuestionTypeSelector.svelte';
import type { CanonicalQuestionDisplayDto } from '../../../src/lib/server/questions/index.js';

afterEach(() => cleanup());

const display: CanonicalQuestionDisplayDto = {
	questionType: 'two_correct_compound',
	prompt: 'Synthetic systems statement.',
	choices: [
		{ letter: 'A', text: 'Synthetic statement alpha.', isCorrect: true },
		{ letter: 'B', text: 'Synthetic statement beta.', isCorrect: false },
		{ letter: 'C', text: 'Synthetic statement gamma.', isCorrect: true },
		{ letter: 'D', text: 'A and C are correct.', isCorrect: true }
	],
	keyLetter: 'D'
};

describe('Phase 6 question accessibility contract', () => {
	it('uses ordinary labeled controls and a POST form for semantic authoring', () => {
		render(QuestionEditorForm, {
			action: '?/createQuestion',
			submitLabel: 'Create draft',
			questionType: 'two_correct_compound',
			aircraftOptions: [
				{
					aircraftVariantId: '60000000-0000-4000-8000-000000000010',
					code: 'SYN-A',
					name: 'Synthetic aircraft A'
				}
			]
		});

		const primary = screen.getByRole('textbox', { name: 'Primary prompt' });
		primary.focus();
		expect(document.activeElement).toBe(primary);
		expect(primary.hasAttribute('required')).toBe(true);
		expect(screen.getAllByRole('checkbox', { name: /Mark statement/ })).toHaveLength(3);
		const submit = screen.getByRole('button', { name: 'Create draft' });
		const form = submit.closest('form')!;
		expect(form.getAttribute('method')).toBe('POST');
		expect(form.getAttribute('action')).toBe('?/createQuestion');
		expect(within(form).getByText(/Choice D is derived by the server/)).toBeTruthy();
	});

	it('associates safe server field errors with the invalid control', () => {
		render(QuestionEditorForm, {
			action: '?/createQuestion',
			submitLabel: 'Create draft',
			questionType: 'single_choice',
			aircraftOptions: [],
			fields: [{ field: 'prompts.0.text', message: 'This field is required.' }]
		});
		const primary = screen.getByRole('textbox', { name: 'Primary prompt' });
		expect(primary.getAttribute('aria-invalid')).toBe('true');
		const describedBy = primary.getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();
		expect(document.getElementById(describedBy!)?.textContent).toContain('This field is required.');
	});

	it('hides answer-key material unless the server-authorized view enables it', () => {
		const hidden = render(QuestionPreview, { display, showKey: false });
		expect(screen.getByText('Answer-key material is hidden in this view.')).toBeTruthy();
		expect(screen.queryByText('Correct answer')).toBeNull();
		hidden.unmount();

		render(QuestionPreview, { display, showKey: true });
		expect(screen.getByText('Correct answer')).toBeTruthy();
	});

	it('provides keyboard-operable type selection and native search/filter controls', () => {
		render(QuestionTypeSelector, { selectedType: 'true_false', action: '/questions' });
		const select = screen.getByRole('combobox', { name: 'Question type' });
		select.focus();
		expect(document.activeElement).toBe(select);
		expect(select.closest('form')?.getAttribute('method')).toBe('GET');

		cleanup();
		render(QuestionFilters, {
			filters: {
				search: '',
				types: [],
				lifecycles: [],
				generationStatuses: [],
				aircraftVariantIds: [],
				futureLinkStatuses: [],
				pageSize: 25
			},
			aircraftOptions: []
		});
		expect(screen.getByRole('searchbox', { name: 'Prompt search' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Apply filters' })).toBeTruthy();
		expect(screen.getByText('Search and filter questions').closest('summary')).toBeTruthy();
	});

	it('retains explicit narrow-screen behavior without drag-only controls', () => {
		const source = (name: string) =>
			readFileSync(resolve('src/lib/components/questions', name), 'utf8');
		for (const name of ['QuestionEditorForm.svelte', 'QuestionTypeSelector.svelte']) {
			expect(source(name)).toContain('@media (max-width: 32rem)');
		}
		const combined = [
			'QuestionEditorForm.svelte',
			'QuestionFilters.svelte',
			'QuestionList.svelte',
			'QuestionPreview.svelte',
			'QuestionTypeSelector.svelte'
		]
			.map(source)
			.join('\n');
		expect(combined).not.toMatch(/draggable|ondrag|dragstart/i);
	});
});
