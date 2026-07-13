import type {
	MandatoryElementInput,
	TemplateDraftInput,
	TemplateFieldError,
	TemplateRuleInput
} from './types.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ValidatedTemplateDraft {
	name: string;
	aircraftVariantId: string;
	courseTypeId: string | null;
	configuredLength: number;
	allottedMinutes: number;
	rules: readonly { subtaskVersionId: string; count: number }[];
	mandatoryElements: readonly { elementVersionId: string; subtaskVersionId: string }[];
}

function integer(field: string, value: unknown, errors: TemplateFieldError[]): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isSafeInteger(parsed) || parsed <= 0) {
		errors.push({ field, message: 'Enter a positive whole number.' });
		return 0;
	}
	return parsed;
}

function identifier(field: string, value: unknown, errors: TemplateFieldError[]): string {
	if (typeof value !== 'string' || !UUID.test(value)) {
		errors.push({ field, message: 'Select a valid item.' });
		return '';
	}
	return value;
}

export function validateTemplateDraft(
	input: TemplateDraftInput
): { ok: true; value: ValidatedTemplateDraft } | { ok: false; fields: TemplateFieldError[] } {
	const errors: TemplateFieldError[] = [];
	const name = typeof input.name === 'string' ? input.name.trim() : '';
	if (!name || name.length > 160)
		errors.push({ field: 'name', message: 'Enter a name of 160 characters or fewer.' });
	const aircraftVariantId = identifier('aircraftVariantId', input.aircraftVariantId, errors);
	const courseTypeId =
		input.courseTypeId == null || input.courseTypeId === ''
			? null
			: identifier('courseTypeId', input.courseTypeId, errors);
	const configuredLength = integer('configuredLength', input.configuredLength, errors);
	const allottedMinutes = integer('allottedMinutes', input.allottedMinutes, errors);
	const rules = input.rules.map((rule: TemplateRuleInput, position) => ({
		subtaskVersionId: identifier(
			`rules.${position}.subtaskVersionId`,
			rule.subtaskVersionId,
			errors
		),
		count: integer(`rules.${position}.count`, rule.count, errors)
	}));
	if (!rules.length) errors.push({ field: 'rules', message: 'Add at least one Subtask rule.' });
	if (new Set(rules.map((rule) => rule.subtaskVersionId)).size !== rules.length)
		errors.push({ field: 'rules', message: 'Each Subtask may appear only once.' });
	if (rules.reduce((sum, rule) => sum + rule.count, 0) !== configuredLength)
		errors.push({
			field: 'configuredLength',
			message: 'Rule counts must equal the configured length.'
		});
	const mandatoryElements = (input.mandatoryElements ?? []).map(
		(requirement: MandatoryElementInput, position) => ({
			elementVersionId: identifier(
				`mandatoryElements.${position}.elementVersionId`,
				requirement.elementVersionId,
				errors
			),
			subtaskVersionId: identifier(
				`mandatoryElements.${position}.subtaskVersionId`,
				requirement.subtaskVersionId,
				errors
			)
		})
	);
	if (
		new Set(mandatoryElements.map((item) => item.elementVersionId)).size !==
		mandatoryElements.length
	)
		errors.push({
			field: 'mandatoryElements',
			message: 'Each Element may be mandatory only once.'
		});
	const quotas = new Map(rules.map((rule) => [rule.subtaskVersionId, rule.count]));
	for (const [position, requirement] of mandatoryElements.entries()) {
		if (!quotas.has(requirement.subtaskVersionId))
			errors.push({
				field: `mandatoryElements.${position}.subtaskVersionId`,
				message: 'The Element must belong to a selected Subtask.'
			});
	}
	for (const [subtaskVersionId, quota] of quotas) {
		if (
			mandatoryElements.filter((item) => item.subtaskVersionId === subtaskVersionId).length > quota
		)
			errors.push({
				field: 'mandatoryElements',
				message: 'Mandatory Elements must fit their Subtask quota.'
			});
	}
	return errors.length
		? { ok: false, fields: errors }
		: {
				ok: true,
				value: {
					name,
					aircraftVariantId,
					courseTypeId,
					configuredLength,
					allottedMinutes,
					rules,
					mandatoryElements
				}
			};
}
