import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	QuestionService,
	buildCanonicalDisplay,
	defaultQuestionDependencies,
	normalizeQuestionType,
	validateQuestionContent,
	type CreateQuestionCommand,
	type QuestionOptionInput
} from '../../../src/lib/server/questions/index.js';
import { openDatabase } from '../../../src/lib/server/db/index.js';

interface GoldenCase {
	id: string;
	input: Record<string, unknown>;
	expected: Record<string, unknown>;
}

interface QuestionsFixture {
	cases: GoldenCase[];
}

const fixture = JSON.parse(
	readFileSync(resolve('fixtures/phase-1/golden-behavior/questions.json'), 'utf8')
) as QuestionsFixture;

const PROMPT = [{ text: 'Synthetic primary prompt.' }];
const AUTHOR = '61000000-0000-4000-8000-000000000001';
const REVIEWER = '61000000-0000-4000-8000-000000000002';
const PUBLISHER = '61000000-0000-4000-8000-000000000003';
const AIRCRAFT = '61000000-0000-4000-8000-000000000004';
const AT = new Date('2026-07-13T00:00:00.000Z');

function option(text: string, isCorrect: boolean, semanticValue?: string): QuestionOptionInput {
	return { text, isCorrect, semanticValue };
}

function singleChoice() {
	return [
		option('Synthetic correct', true),
		option('Synthetic wrong 1', false),
		option('Synthetic wrong 2', false),
		option('Synthetic wrong 3', false)
	];
}

function lifecycleService(): {
	service: QuestionService;
	close: () => void;
	command: CreateQuestionCommand;
} {
	const database = openDatabase({ path: ':memory:' });
	for (const [id, employee] of [
		[AUTHOR, '061001'],
		[REVIEWER, '061002'],
		[PUBLISHER, '061003']
	] as const) {
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, ?, 'Synthetic', 'Golden', 'active', ?, ?)`
			)
			.run(id, employee, AT.toISOString(), AT.toISOString());
	}
	database.sqlite
		.prepare(
			`INSERT INTO aircraft_variants
			 (id, code, name, effective_from, status, created_at)
			 VALUES (?, 'GOLD', 'Synthetic golden aircraft', ?, 'active', ?)`
		)
		.run(AIRCRAFT, AT.toISOString(), AT.toISOString());
	let sequence = 10;
	const service = new QuestionService(
		database,
		defaultQuestionDependencies({
			clock: { now: () => AT },
			ids: {
				create: () => `61000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`
			},
			recordAuditEvent: () => undefined
		})
	);
	return {
		service,
		close: () => database.close(),
		command: {
			questionType: 'mc',
			prompts: PROMPT,
			options: singleChoice(),
			aircraftVariantIds: [AIRCRAFT]
		}
	};
}

const execute: Record<string, (testCase: GoldenCase) => void> = {
	'q-legacy-tf-nontrue-falls-through': (testCase) => {
		const stored = String(testCase.input.stored_correct);
		const legacyKey = stored === 'TRUE' ? 'a' : 'b';
		expect(legacyKey).toBe(testCase.expected.key);
		const target = validateQuestionContent('tf', PROMPT, [
			option('True', true, stored),
			option('False', false, 'false')
		]);
		expect(buildCanonicalDisplay(target, { includeKey: true }).keyLetter).toBe('A');
	},
	'q-target-tf-valid-normalized': () => {
		const content = validateQuestionContent(' TF ', PROMPT, [
			option('True', true, 'true'),
			option('False', false, 'false')
		]);
		expect(content.questionType).toBe('true_false');
		expect(buildCanonicalDisplay(content, { includeKey: true })).toMatchObject({
			keyLetter: 'A',
			choices: [{ text: 'True' }, { text: 'False' }]
		});
	},
	'q-target-tf-invalid-blank': () => {
		expect(() =>
			validateQuestionContent('tf', PROMPT, [option('True', true), option('False', false, 'false')])
		).toThrow();
	},
	'q-legacy-mc-layout': () => {
		const display = buildCanonicalDisplay(validateQuestionContent('mc', PROMPT, singleChoice()), {
			includeKey: true
		});
		expect(display.choices).toHaveLength(4);
		expect(display.choices.filter((choice) => choice.isCorrect)).toHaveLength(1);
	},
	'q-legacy-mc-all-none-distractor': () => {
		const display = buildCanonicalDisplay(validateQuestionContent('mc', PROMPT, singleChoice()), {
			includeKey: true
		});
		expect(display.choices.map((choice) => choice.text)).not.toContain('All of the above.');
		expect(display.choices.map((choice) => choice.text)).not.toContain('None of the above.');
	},
	'q-target-mc-valid': () => {
		const content = validateQuestionContent('MC', PROMPT, singleChoice());
		expect(content.questionType).toBe('single_choice');
		expect(content.options).toHaveLength(4);
		expect(content.options.filter((item) => item.isCorrect)).toHaveLength(1);
	},
	'q-target-mc-invalid-duplicate': () => {
		expect(() =>
			validateQuestionContent('mc', PROMPT, [
				option('Repeated synthetic choice', true),
				option('Repeated synthetic choice ', false),
				option('Synthetic wrong 2', false),
				option('Synthetic wrong 3', false)
			])
		).toThrow();
	},
	'q-target-c2-valid': () => {
		const display = buildCanonicalDisplay(
			validateQuestionContent('c2', PROMPT, [
				option('Synthetic true alpha', true),
				option('Synthetic false gamma', false),
				option('Synthetic true beta', true)
			]),
			{ includeKey: true }
		);
		expect(display).toMatchObject({ keyLetter: 'D' });
		expect(display.choices[3]?.text).toBe('A and C are correct.');
	},
	'q-target-c2-invalid-third-correct': () => {
		expect(() =>
			validateQuestionContent('c2', PROMPT, [
				option('Synthetic alpha', true),
				option('Synthetic beta', true),
				option('Synthetic gamma', true)
			])
		).toThrow();
	},
	'q-target-ac-valid': () => {
		const display = buildCanonicalDisplay(
			validateQuestionContent('AC', PROMPT, [
				option('Synthetic true alpha', true),
				option('Synthetic true beta', true),
				option('Synthetic true gamma', true)
			]),
			{ includeKey: true }
		);
		expect(display).toMatchObject({ keyLetter: 'D' });
		expect(display.choices[3]?.text).toBe('All of the above.');
	},
	'q-target-nc-valid': () => {
		const display = buildCanonicalDisplay(
			validateQuestionContent('nc', PROMPT, [
				option('Synthetic false alpha', false),
				option('Synthetic false beta', false),
				option('Synthetic false gamma', false)
			]),
			{ includeKey: true }
		);
		expect(display).toMatchObject({ keyLetter: 'D' });
		expect(display.choices[3]?.text).toBe('None of the above.');
	},
	'q-target-all-types-blank-choice-rejected': () => {
		const shapes = {
			mc: [option('A', true), option(' ', false), option('C', false), option('D', false)],
			c2: [option('A', true), option(' ', true), option('C', false)],
			ac: [option('A', true), option(' ', true), option('C', true)],
			nc: [option('A', false), option(' ', false), option('C', false)]
		};
		for (const [type, options] of Object.entries(shapes)) {
			expect(() => validateQuestionContent(type, PROMPT, options)).toThrow();
		}
	},
	'q-legacy-primary-only-prompt': () => {
		const content = validateQuestionContent('mc', PROMPT, singleChoice());
		expect(content.prompts).toEqual(['Synthetic primary prompt.']);
	},
	'q-legacy-alternate-prompt': () => {
		const content = validateQuestionContent(
			'mc',
			[{ text: 'Synthetic primary prompt.' }, { text: 'Synthetic alternate prompt.' }],
			singleChoice()
		);
		expect(content.prompts).toEqual(['Synthetic primary prompt.', 'Synthetic alternate prompt.']);
	},
	'q-target-prompt-selection-recorded': () => {
		const content = validateQuestionContent(
			'mc',
			[{ text: 'Synthetic primary prompt.' }, { text: 'Synthetic alternate prompt.' }],
			singleChoice()
		);
		const first = buildCanonicalDisplay(content, { includeKey: false, promptPosition: 1 });
		const replay = buildCanonicalDisplay(content, { includeKey: false, promptPosition: 1 });
		expect(content.prompts).toContain(first.prompt);
		expect(replay.prompt).toBe(first.prompt);
	},
	'q-target-retired-not-eligible': () => {
		const context = lifecycleService();
		try {
			const created = context.service.createQuestion(AUTHOR, context.command);
			if (!created.ok) throw new Error(created.error);
			const versionId = created.value.latestVersion.id;
			expect(context.service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
			expect(
				context.service.reviewVersion(REVIEWER, {
					versionId,
					decision: 'approve',
					rationale: 'Synthetic golden review'
				}).ok
			).toBe(true);
			expect(
				context.service.publishVersion(PUBLISHER, {
					versionId,
					effectiveFrom: AT.toISOString()
				}).ok
			).toBe(true);
			const dependencies = context.service.dependencyPreview(versionId, 'retire');
			if (!dependencies.ok) throw new Error(dependencies.error);
			expect(
				context.service.retireVersion(PUBLISHER, {
					versionId,
					reason: 'Synthetic golden retirement',
					expectedDependencyRevision: dependencies.value.revision
				}).ok
			).toBe(true);
			const eligibility = context.service.deriveGenerationEligibility(versionId);
			expect(eligibility).toMatchObject({
				ok: true,
				value: { eligible: false, status: 'blocked' }
			});
			if (!eligibility.ok) throw new Error(eligibility.error);
			expect(eligibility.value.reasons).toContain('retired');
		} finally {
			context.close();
		}
	},
	'q-target-self-publish-denied': () => {
		const context = lifecycleService();
		try {
			const created = context.service.createQuestion(AUTHOR, context.command);
			if (!created.ok) throw new Error(created.error);
			const versionId = created.value.latestVersion.id;
			expect(context.service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
			expect(
				context.service.reviewVersion(AUTHOR, {
					versionId,
					decision: 'approve',
					rationale: 'Synthetic self review'
				})
			).toEqual({ ok: false, error: 'distinct_reviewer_required' });
		} finally {
			context.close();
		}
	}
};

describe('Phase 6 executes every golden question case', () => {
	it('has exactly one executable assertion group for every manifest case', () => {
		expect(Object.keys(execute).sort()).toEqual(fixture.cases.map((item) => item.id).sort());
		expect(new Set(fixture.cases.map((item) => item.id)).size).toBe(fixture.cases.length);
	});

	it.each(fixture.cases)('$id', (testCase) => {
		expect(execute[testCase.id]).toBeTypeOf('function');
		execute[testCase.id]!(testCase);
	});

	it('keeps canonical production vocabulary distinct from normalized legacy aliases', () => {
		expect(['tf', 'mc', 'c2', 'ac', 'nc'].map(normalizeQuestionType)).toEqual([
			'true_false',
			'single_choice',
			'two_correct_compound',
			'all_correct',
			'none_correct'
		]);
	});
});
