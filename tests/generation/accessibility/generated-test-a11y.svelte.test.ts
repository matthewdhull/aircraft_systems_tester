import { cleanup, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import GeneratedExamSummary from '$lib/components/generated-tests/GeneratedExamSummary.svelte';
import SnapshotView from '$lib/components/generated-tests/SnapshotView.svelte';

afterEach(() => cleanup());

const summary = {
	id: '70000000-0000-4000-8000-000000000001',
	status: 'published',
	templateName: 'Synthetic Phase 7 template',
	templateVersion: 2,
	questionCount: 1,
	algorithmVersion: 'ast-selection-v1',
	publishedAt: '2026-07-13T00:00:00.000Z',
	startClosesAt: '2026-07-13T01:00:00.000Z'
};

const questions = [
	{
		id: 'q1',
		position: 0,
		promptText: 'Synthetic prompt text.',
		questionType: 'true_false',
		choices: [
			{ id: 'a', position: 0, text: 'True', isCorrect: true },
			{ id: 'b', position: 1, text: 'False', isCorrect: false }
		]
	}
];

describe('Phase 7 generated-test accessibility', () => {
	it('exposes a keyboard-focusable generated-test link and semantic metadata', () => {
		render(GeneratedExamSummary, { exam: summary });
		const link = screen.getByRole('link', { name: summary.templateName });
		link.focus();
		expect(document.activeElement).toBe(link);
		const article = link.closest('article')!;
		expect(within(article).getByText('Algorithm')).toBeTruthy();
		expect(within(article).getByText('ast-selection-v1')).toBeTruthy();
		expect(within(article).getByText('New starts close')).toBeTruthy();
	});

	it('uses ordered question and choice structure without leaking keys in preview mode', () => {
		const { container } = render(SnapshotView, { questions, showKeys: false });
		expect(container.querySelectorAll('ol.questions > li')).toHaveLength(1);
		expect(container.querySelectorAll('ol.choices > li')).toHaveLength(2);
		expect(screen.getByRole('heading', { name: 'Question 1' })).toBeTruthy();
		expect(screen.queryByText(/response key/i)).toBeNull();
	});

	it('adds a textual key indicator in the privileged projection, not color alone', () => {
		render(SnapshotView, { questions, showKeys: true });
		expect(screen.getByText(/response key/i)).toBeTruthy();
	});
});
