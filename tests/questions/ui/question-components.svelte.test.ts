import { cleanup, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import QuestionApplicability from '../../../src/lib/components/questions/QuestionApplicability.svelte';
import QuestionEditorForm from '../../../src/lib/components/questions/QuestionEditorForm.svelte';
import QuestionLifecycleControls from '../../../src/lib/components/questions/QuestionLifecycleControls.svelte';
import QuestionList from '../../../src/lib/components/questions/QuestionList.svelte';
import QuestionPreview from '../../../src/lib/components/questions/QuestionPreview.svelte';
import QuestionTypeSelector from '../../../src/lib/components/questions/QuestionTypeSelector.svelte';
import type {
	CanonicalQuestionDisplayDto,
	PrivilegedQuestionDetailDto,
	QuestionSearchResult,
	QuestionType
} from '../../../src/lib/server/questions/types.js';

afterEach(() => cleanup());

const aircraft = [
	{
		aircraftVariantId: '10000000-0000-4000-8000-000000000001',
		code: 'SYN-1',
		name: 'Synthetic trainer'
	}
];

function renderEditor(questionType: QuestionType) {
	return render(QuestionEditorForm, {
		action: '?/createQuestion',
		submitLabel: 'Create question draft',
		questionType,
		aircraftOptions: aircraft,
		futureCurriculumOptions: [],
		allowInitialFutureLink: true
	});
}

function display(
	questionType: QuestionType,
	choices: readonly string[],
	keyLetter: 'A' | 'B' | 'C' | 'D'
): CanonicalQuestionDisplayDto {
	return {
		questionType,
		prompt: `Synthetic ${questionType} prompt?`,
		choices: choices.map((text, position) => ({
			letter: ['A', 'B', 'C', 'D'][position] as 'A' | 'B' | 'C' | 'D',
			text
		})),
		keyLetter
	};
}

const detail: PrivilegedQuestionDetailDto = {
	id: '20000000-0000-4000-8000-000000000001',
	questionId: '30000000-0000-4000-8000-000000000001',
	version: 1,
	questionType: 'single_choice',
	lifecycle: 'draft',
	generationStatus: 'blocked',
	authoredByUserId: '40000000-0000-4000-8000-000000000001',
	reviewedByUserId: null,
	createdAt: '2026-07-13T12:00:00.000Z',
	submittedAt: null,
	publishedAt: null,
	effectiveFrom: null,
	effectiveTo: null,
	retiredAt: null,
	promptCount: 1,
	aircraftCount: 1,
	legacyLinkCount: 0,
	futureLinkCounts: { review: 0, approved: 0, retired: 0 },
	prompts: [
		{
			id: '50000000-0000-4000-8000-000000000001',
			position: 0,
			text: 'Synthetic primary prompt?'
		}
	],
	options: ['Alpha', 'Bravo', 'Charlie', 'Delta'].map((text, position) => ({
		id: `60000000-0000-4000-8000-00000000000${position + 1}`,
		position,
		text,
		isCorrect: position === 0,
		semanticValue: null
	})),
	display: display('single_choice', ['Alpha', 'Bravo', 'Charlie', 'Delta'], 'A'),
	aircraft,
	legacyCurriculum: [],
	futureCurriculum: [],
	dependencies: {
		operation: 'delete',
		items: [],
		totalCount: 0,
		blocksHardDelete: false,
		requiresRetirement: false,
		revision: 'safe-revision'
	}
};

describe('question type-specific authoring forms', () => {
	it('uses canonical semantic True and False and exactly one radio key', () => {
		renderEditor('true_false');
		const shape = screen.getByRole('group', { name: 'True / false answer shape' });
		expect(within(shape).getByRole('radio', { name: /A\. True/ })).toBeTruthy();
		expect(within(shape).getByRole('radio', { name: /B\. False/ })).toBeTruthy();
		expect(within(shape).getAllByRole('radio')).toHaveLength(2);
		expect(shape.querySelectorAll('input[name="semanticValue"]')).toHaveLength(2);
	});

	it('renders four single-choice fields and one radio key group', () => {
		renderEditor('single_choice');
		const shape = screen.getByRole('group', {
			name: 'Single-answer multiple choice answer shape'
		});
		expect(within(shape).getAllByRole('textbox')).toHaveLength(4);
		expect(within(shape).getAllByRole('radio')).toHaveLength(4);
		expect(shape.textContent).not.toContain('All of the above');
		expect(shape.textContent).not.toContain('None of the above');
	});

	it('renders three compound statements, two-select controls, and a derived D notice', () => {
		renderEditor('two_correct_compound');
		const shape = screen.getByRole('group', { name: 'Two-correct compound answer shape' });
		expect(within(shape).getAllByRole('textbox')).toHaveLength(3);
		expect(within(shape).getAllByRole('checkbox')).toHaveLength(3);
		expect(shape.textContent).toContain('The server derives the two correct letters');
	});

	it('renders canonical all-correct D without an editable fourth statement', () => {
		renderEditor('all_correct');
		const shape = screen.getByRole('group', { name: 'All correct answer shape' });
		expect(within(shape).getAllByRole('textbox')).toHaveLength(3);
		expect(shape.textContent).toContain('D. All of the above.');
		expect(shape.querySelectorAll('input[name="keyedPosition"]')).toHaveLength(3);
	});

	it('renders canonical none-correct D without client-authored key fields', () => {
		renderEditor('none_correct');
		const shape = screen.getByRole('group', { name: 'None correct answer shape' });
		expect(within(shape).getAllByRole('textbox')).toHaveLength(3);
		expect(shape.textContent).toContain('D. None of the above.');
		expect(shape.querySelectorAll('input[name="keyedPosition"]')).toHaveLength(0);
	});

	it('keeps alternate prompts, aircraft, and future targets in a normal POST form', () => {
		renderEditor('single_choice');
		const submit = screen.getByRole('button', { name: 'Create question draft' });
		const form = submit.closest('form')!;
		expect(form.method).toMatch(/post/i);
		expect(form.getAttribute('action')).toBe('?/createQuestion');
		expect(screen.getByRole('textbox', { name: 'Alternate prompt 1' })).toBeTruthy();
		expect(screen.getByRole('checkbox', { name: /SYN-1/ })).toBeTruthy();
		expect(screen.getByRole('combobox', { name: 'Initial future curriculum link' })).toBeTruthy();
	});

	it('switches type through an ordinary GET form without requiring client JavaScript', () => {
		render(QuestionTypeSelector, { selectedType: 'none_correct' });
		const submit = screen.getByRole('button', { name: 'Use this type' });
		expect(submit.closest('form')?.method).toMatch(/get/i);
		expect(
			(screen.getByRole('combobox', { name: 'Question type' }) as HTMLSelectElement).value
		).toBe('none_correct');
	});
});

describe('question preview and safe list projections', () => {
	it.each([
		['true_false', ['True', 'False'], 'A'],
		['single_choice', ['Alpha', 'Bravo', 'Charlie', 'Delta'], 'B'],
		['two_correct_compound', ['Alpha', 'Bravo', 'Charlie', 'A and C are correct.'], 'D'],
		['all_correct', ['Alpha', 'Bravo', 'Charlie', 'All of the above.'], 'D'],
		['none_correct', ['Alpha', 'Bravo', 'Charlie', 'None of the above.'], 'D']
	] as const)('renders the deterministic %s server preview', (type, choices, key) => {
		render(QuestionPreview, { display: display(type, choices, key), showKey: true });
		const preview = screen.getByRole('heading', { name: 'Question preview' }).closest('section')!;
		for (const choice of choices) expect(preview.textContent).toContain(choice);
		expect(within(preview).getByText('Correct answer')).toBeTruthy();
	});

	it('hides key labeling in a non-key preview', () => {
		render(QuestionPreview, {
			display: display('true_false', ['True', 'False'], 'A'),
			showKey: false
		});
		expect(screen.queryByText('Correct answer')).toBeNull();
		expect(screen.getByText('Answer-key material is hidden in this view.')).toBeTruthy();
	});

	it('renders a safe list item without option or key material', () => {
		const result: QuestionSearchResult = {
			items: [
				{
					id: detail.id,
					questionId: detail.questionId,
					version: detail.version,
					questionType: detail.questionType,
					lifecycle: detail.lifecycle,
					generationStatus: detail.generationStatus,
					authoredByUserId: detail.authoredByUserId,
					reviewedByUserId: detail.reviewedByUserId,
					createdAt: detail.createdAt,
					submittedAt: detail.submittedAt,
					publishedAt: detail.publishedAt,
					effectiveFrom: detail.effectiveFrom,
					effectiveTo: detail.effectiveTo,
					retiredAt: detail.retiredAt,
					promptCount: detail.promptCount,
					aircraftCount: detail.aircraftCount,
					legacyLinkCount: detail.legacyLinkCount,
					futureLinkCounts: detail.futureLinkCounts,
					primaryPrompt: 'Synthetic list prompt?',
					aircraft
				}
			],
			page: 1,
			pageSize: 25,
			totalItems: 1,
			totalPages: 1
		};
		render(QuestionList, { result });
		expect(screen.getByRole('link', { name: 'Synthetic list prompt?' })).toBeTruthy();
		expect(document.body.textContent).not.toContain('Alpha');
		expect(document.body.textContent).not.toContain('Correct answer');
	});
});

describe('question lifecycle and applicability controls', () => {
	it('offers draft submit and confirmed hard deletion as named form actions', () => {
		render(QuestionLifecycleControls, {
			detail,
			canEdit: true,
			canReview: false,
			canPublish: false,
			canRetire: false
		});
		expect(
			screen
				.getByRole('button', { name: 'Submit version 1' })
				.closest('form')
				?.getAttribute('action')
		).toBe('?/submitReview');
		expect(
			screen.getByRole('button', { name: 'Delete draft' }).closest('form')?.getAttribute('action')
		).toBe('?/deleteDraft');
		expect(screen.getByRole('checkbox', { name: /permanently deletes/i })).toBeTruthy();
	});

	it('offers distinct review decisions and publication only after review attribution', () => {
		const reviewed = {
			...detail,
			lifecycle: 'review' as const,
			reviewedByUserId: '70000000-0000-4000-8000-000000000001'
		};
		render(QuestionLifecycleControls, {
			detail: reviewed,
			canEdit: true,
			canReview: true,
			canPublish: true,
			canRetire: false
		});
		expect(screen.getByRole('button', { name: 'Approve version' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Return to draft' })).toBeTruthy();
		expect(
			screen
				.getByRole('button', { name: 'Publish version' })
				.closest('form')
				?.getAttribute('action')
		).toBe('?/publishVersion');
	});

	it('labels imported review content as an attributable adoption workflow', () => {
		render(QuestionLifecycleControls, {
			detail: { ...detail, lifecycle: 'review', authoredByUserId: null },
			canEdit: true,
			canReview: true,
			canPublish: true,
			canRetire: false
		});
		expect(screen.getByRole('button', { name: 'Create adoption draft' })).toBeTruthy();
		expect(screen.getByText(/imported version remains unchanged and blocked/i)).toBeTruthy();
	});

	it('shows aircraft, faithful legacy ancestry, and explicit future-link review controls', () => {
		const linked: PrivilegedQuestionDetailDto = {
			...detail,
			legacyCurriculum: [
				{ legacyTpoId: 'synthetic-tpo', legacySpoId: 'synthetic-spo', legacyEoId: 'synthetic-eo' }
			],
			futureCurriculum: [
				{
					questionVersionId: detail.id,
					subtaskVersionId: '80000000-0000-4000-8000-000000000001',
					elementVersionId: null,
					status: 'review',
					proposedByUserId: '40000000-0000-4000-8000-000000000001',
					proposedAt: '2026-07-13T12:00:00.000Z',
					reviewedByUserId: null,
					reviewedAt: null
				}
			]
		};
		render(QuestionApplicability, {
			detail: linked,
			futureCurriculumOptions: [
				{
					subtaskVersionId: '80000000-0000-4000-8000-000000000001',
					subtaskName: 'Synthetic subtask',
					elementVersionId: null,
					elementName: null,
					ancestryLabel: 'Synthetic phase → task → subtask'
				}
			],
			canPropose: true,
			canReview: true
		});
		expect(
			screen.getByText(/TPO synthetic-tpo → SPO synthetic-spo → EO synthetic-eo/)
		).toBeTruthy();
		expect(screen.getByText(/never interpreted as future hierarchy IDs/)).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Approve link' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Retire link' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Propose link for review' })).toBeTruthy();
	});

	it('allows approved-link retirement without offering a new proposal on published content', () => {
		const published: PrivilegedQuestionDetailDto = {
			...detail,
			lifecycle: 'published',
			futureCurriculum: [
				{
					questionVersionId: detail.id,
					subtaskVersionId: '80000000-0000-4000-8000-000000000002',
					elementVersionId: null,
					status: 'approved',
					proposedByUserId: detail.authoredByUserId!,
					proposedAt: '2026-07-13T12:00:00.000Z',
					reviewedByUserId: '80000000-0000-4000-8000-000000000003',
					reviewedAt: '2026-07-13T13:00:00.000Z'
				}
			]
		};
		render(QuestionApplicability, {
			detail: published,
			futureCurriculumOptions: [],
			canPropose: true,
			canReview: true
		});
		expect(screen.getByRole('button', { name: 'Retire link' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Approve link' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Propose link for review' })).toBeNull();
	});
});
