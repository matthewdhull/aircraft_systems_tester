import type {
	CanonicalQuestionDisplayDto,
	FieldError,
	QuestionOptionInput,
	QuestionPromptInput,
	QuestionType,
	ValidatedQuestionContent
} from './types.js';

const TYPE_ALIASES: Readonly<Record<string, QuestionType>> = {
	true_false: 'true_false',
	tf: 'true_false',
	single_choice: 'single_choice',
	mc: 'single_choice',
	two_correct_compound: 'two_correct_compound',
	c2: 'two_correct_compound',
	all_correct: 'all_correct',
	ac: 'all_correct',
	none_correct: 'none_correct',
	nc: 'none_correct'
};

export class QuestionValidationError extends Error {
	constructor(
		readonly code: 'invalid_input' | 'invalid_question_type' | 'invalid_question_shape',
		readonly fields: readonly FieldError[] = []
	) {
		super(code);
		this.name = 'QuestionValidationError';
	}
}

export function normalizeQuestionType(value: unknown): QuestionType {
	if (typeof value !== 'string') throw new QuestionValidationError('invalid_question_type');
	const normalized = TYPE_ALIASES[value.trim().toLowerCase()];
	if (!normalized) throw new QuestionValidationError('invalid_question_type');
	return normalized;
}

function safeText(field: string, value: unknown, max: number): string {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new QuestionValidationError('invalid_input', [
			{ field, message: 'This field is required.' }
		]);
	}
	const normalized = value.trim();
	if (normalized.length > max) {
		throw new QuestionValidationError('invalid_input', [
			{ field, message: `Use ${max} characters or fewer.` }
		]);
	}
	return normalized;
}

function boolean(field: string, value: unknown): boolean {
	if (typeof value === 'boolean') return value;
	if (value === 1 || (typeof value === 'string' && value.trim() === '1')) return true;
	if (value === 0 || (typeof value === 'string' && value.trim() === '0')) return false;
	if (typeof value === 'string' && value.trim().toLowerCase() === 'true') return true;
	if (typeof value === 'string' && value.trim().toLowerCase() === 'false') return false;
	throw new QuestionValidationError('invalid_question_shape', [
		{ field, message: 'Select whether this option is correct.' }
	]);
}

function semantic(value: unknown): string | null {
	if (value == null || value === '') return null;
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return typeof value === 'string' ? value.trim().toLowerCase() : '__invalid__';
}

function distinct(values: readonly string[], field: string): void {
	if (new Set(values).size !== values.length) {
		throw new QuestionValidationError('invalid_question_shape', [
			{ field, message: 'Values must be distinct.' }
		]);
	}
}

export function validateQuestionContent(
	questionTypeInput: unknown,
	promptInputs: readonly QuestionPromptInput[],
	optionInputs: readonly QuestionOptionInput[]
): ValidatedQuestionContent {
	const questionType = normalizeQuestionType(questionTypeInput);
	if (!Array.isArray(promptInputs) || promptInputs.length === 0) {
		throw new QuestionValidationError('invalid_input', [
			{ field: 'prompts', message: 'Add at least one prompt.' }
		]);
	}
	const prompts = promptInputs.map((prompt, position) =>
		safeText(`prompts.${position}.text`, prompt?.text, 4_000)
	);
	distinct(prompts, 'prompts');
	if (!Array.isArray(optionInputs)) throw new QuestionValidationError('invalid_question_shape');
	const raw = optionInputs.map((option, position) => ({
		position,
		text: safeText(`options.${position}.text`, option?.text, 4_000),
		isCorrect: boolean(`options.${position}.isCorrect`, option?.isCorrect),
		semanticValue: semantic(option?.semanticValue)
	}));
	distinct(
		raw.map((option) => option.text),
		'options'
	);

	if (questionType === 'true_false') {
		if (raw.length !== 2) throw new QuestionValidationError('invalid_question_shape');
		const semantics = raw.map((option) => option.semanticValue);
		if (
			semantics.filter((value) => value === 'true').length !== 1 ||
			semantics.filter((value) => value === 'false').length !== 1
		) {
			throw new QuestionValidationError('invalid_question_shape', [
				{ field: 'options', message: 'Provide one unambiguous True and False semantic value.' }
			]);
		}
		if (raw.filter((option) => option.isCorrect).length !== 1)
			throw new QuestionValidationError('invalid_question_shape');
		const bySemantic = new Map(raw.map((option) => [option.semanticValue, option]));
		return {
			questionType,
			prompts,
			options: (['true', 'false'] as const).map((value, position) => ({
				position,
				text: value === 'true' ? 'True' : 'False',
				isCorrect: bySemantic.get(value)!.isCorrect,
				semanticValue: value
			}))
		};
	}

	const requiredCount = questionType === 'single_choice' ? 4 : 3;
	if (raw.length !== requiredCount) throw new QuestionValidationError('invalid_question_shape');
	const correctCount = raw.filter((option) => option.isCorrect).length;
	const expectedCorrect =
		questionType === 'single_choice'
			? 1
			: questionType === 'two_correct_compound'
				? 2
				: questionType === 'all_correct'
					? 3
					: 0;
	if (correctCount !== expectedCorrect) throw new QuestionValidationError('invalid_question_shape');
	const semanticValue =
		questionType === 'two_correct_compound'
			? 'compound'
			: questionType === 'all_correct'
				? 'all'
				: questionType === 'none_correct'
					? 'none'
					: null;
	return {
		questionType,
		prompts,
		options: raw.map((option) => ({
			position: option.position,
			text: option.text,
			isCorrect: option.isCorrect,
			semanticValue
		}))
	};
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

export function buildCanonicalDisplay(
	content: ValidatedQuestionContent,
	options: { includeKey: boolean; promptPosition?: number } = { includeKey: false }
): CanonicalQuestionDisplayDto {
	const prompt = content.prompts[options.promptPosition ?? 0];
	if (!prompt) throw new QuestionValidationError('invalid_input');
	const choices = content.options.map((option, position) => ({
		letter: LETTERS[position]!,
		text: option.text,
		...(options.includeKey ? { isCorrect: option.isCorrect } : {})
	}));
	let keyLetter: 'A' | 'B' | 'C' | 'D';
	if (content.questionType === 'two_correct_compound') {
		const correct = content.options
			.filter((option) => option.isCorrect)
			.map((option) => LETTERS[option.position])
			.sort();
		choices.push({
			letter: 'D',
			text: `${correct[0]} and ${correct[1]} are correct.`,
			...(options.includeKey ? { isCorrect: true } : {})
		});
		keyLetter = 'D';
	} else if (content.questionType === 'all_correct') {
		choices.push({
			letter: 'D',
			text: 'All of the above.',
			...(options.includeKey ? { isCorrect: true } : {})
		});
		keyLetter = 'D';
	} else if (content.questionType === 'none_correct') {
		choices.push({
			letter: 'D',
			text: 'None of the above.',
			...(options.includeKey ? { isCorrect: true } : {})
		});
		keyLetter = 'D';
	} else {
		const correct = content.options.find((option) => option.isCorrect);
		if (!correct) throw new QuestionValidationError('invalid_question_shape');
		keyLetter = LETTERS[correct.position]!;
	}
	return {
		questionType: content.questionType,
		prompt,
		choices,
		...(options.includeKey ? { keyLetter } : {})
	};
}
