import { describe, expect, it } from 'vitest';

import {
	buildCanonicalDisplay,
	normalizeQuestionType,
	validateQuestionContent,
	type QuestionOptionInput
} from '../../../src/lib/server/questions/index.js';

const prompt = [{ text: '  Synthetic prompt?  ' }];
const option = (
	text: string,
	isCorrect: boolean,
	semanticValue: string | null = null
): QuestionOptionInput => ({ text, isCorrect, semanticValue });

describe('canonical question type vocabulary', () => {
	it.each([
		[' TF ', 'true_false'],
		['mc', 'single_choice'],
		['C2', 'two_correct_compound'],
		['ac', 'all_correct'],
		['NC', 'none_correct'],
		['true_false', 'true_false']
	] as const)('normalizes %s', (input, expected) => {
		expect(normalizeQuestionType(input)).toBe(expected);
	});

	it.each(['', 'multiple_choice', 'all', null, 2])('rejects unknown type %j', (input) => {
		expect(() => normalizeQuestionType(input)).toThrowError('invalid_question_type');
	});
});

describe('server-authoritative shape validation and deterministic display', () => {
	it('canonicalizes true/false semantics and exactly one Boolean key', () => {
		const content = validateQuestionContent('tf', prompt, [
			option(' false presentation ', true, ' FALSE '),
			option(' true presentation ', false, 'TRUE')
		]);
		expect(content.prompts).toEqual(['Synthetic prompt?']);
		expect(content.options).toEqual([
			{ position: 0, text: 'True', isCorrect: false, semanticValue: 'true' },
			{ position: 1, text: 'False', isCorrect: true, semanticValue: 'false' }
		]);
		expect(buildCanonicalDisplay(content, { includeKey: true })).toMatchObject({
			keyLetter: 'B',
			choices: [{ text: 'True' }, { text: 'False' }]
		});
	});

	it('accepts semantic Boolean values while persisting canonical strings', () => {
		const content = validateQuestionContent('true_false', prompt, [
			{ text: 'True', isCorrect: true, semanticValue: true },
			{ text: 'False', isCorrect: false, semanticValue: false }
		]);
		expect(content.options.map((choice) => choice.semanticValue)).toEqual(['true', 'false']);
	});

	it('validates four-choice single answer without synthetic distractors', () => {
		const content = validateQuestionContent('mc', prompt, [
			option('Alpha', false),
			option('Bravo', true),
			option('Charlie', false),
			option('Delta', false)
		]);
		const display = buildCanonicalDisplay(content, { includeKey: true });
		expect(display.choices.map((choice) => choice.text)).toEqual([
			'Alpha',
			'Bravo',
			'Charlie',
			'Delta'
		]);
		expect(display.keyLetter).toBe('B');
	});

	it('derives deterministic compound D from the sorted correct letters', () => {
		const content = validateQuestionContent('c2', prompt, [
			option('Alpha', true),
			option('Bravo', false),
			option('Charlie', true)
		]);
		expect(buildCanonicalDisplay(content, { includeKey: true })).toMatchObject({
			keyLetter: 'D',
			choices: [{}, {}, {}, { text: 'A and C are correct.', isCorrect: true }]
		});
	});

	it.each([
		[
			'ac',
			[option('Alpha', true), option('Bravo', true), option('Charlie', true)],
			'All of the above.'
		],
		[
			'nc',
			[option('Alpha', false), option('Bravo', false), option('Charlie', false)],
			'None of the above.'
		]
	] as const)('validates %s and derives canonical D', (type, choices, compound) => {
		const display = buildCanonicalDisplay(validateQuestionContent(type, prompt, choices), {
			includeKey: true
		});
		expect(display.choices[3]).toEqual({ letter: 'D', text: compound, isCorrect: true });
		expect(display.keyLetter).toBe('D');
	});

	it('supports ordered distinct alternate prompts', () => {
		const content = validateQuestionContent(
			'mc',
			[{ text: 'Primary' }, { text: 'Alternate' }],
			[
				option('Alpha', true),
				option('Bravo', false),
				option('Charlie', false),
				option('Delta', false)
			]
		);
		expect(buildCanonicalDisplay(content, { includeKey: false, promptPosition: 1 })).toMatchObject({
			prompt: 'Alternate'
		});
		expect(buildCanonicalDisplay(content).choices.every((choice) => !('isCorrect' in choice))).toBe(
			true
		);
	});

	it.each([
		['tf missing semantic', 'tf', [option('True', true), option('False', false, 'false')]],
		['tf ambiguous key', 'tf', [option('True', true, 'true'), option('False', true, 'false')]],
		['mc wrong cardinality', 'mc', [option('A', true), option('B', false), option('C', false)]],
		[
			'mc two keys',
			'mc',
			[option('A', true), option('B', true), option('C', false), option('D', false)]
		],
		['c2 one key', 'c2', [option('A', true), option('B', false), option('C', false)]],
		['c2 three keys', 'c2', [option('A', true), option('B', true), option('C', true)]],
		['ac not all keyed', 'ac', [option('A', true), option('B', true), option('C', false)]],
		['nc keyed statement', 'nc', [option('A', false), option('B', false), option('C', true)]],
		[
			'duplicate text',
			'mc',
			[option('A', true), option('A ', false), option('C', false), option('D', false)]
		],
		[
			'blank option',
			'mc',
			[option('A', true), option(' ', false), option('C', false), option('D', false)]
		]
	] as const)('rejects invalid shape: %s', (_name, type, choices) => {
		expect(() => validateQuestionContent(type, prompt, choices)).toThrow();
	});

	it.each([[[]], [[{ text: ' ' }]], [[{ text: 'Same' }, { text: 'Same ' }]]] as const)(
		'rejects missing, blank, or duplicate prompts',
		(prompts) => {
			expect(() =>
				validateQuestionContent('nc', prompts, [
					option('A', false),
					option('B', false),
					option('C', false)
				])
			).toThrow();
		}
	);
});
