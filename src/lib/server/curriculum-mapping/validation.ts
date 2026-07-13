import {
	CURRICULUM_NODE_TYPES,
	LEGACY_ENTITY_TYPES,
	type CurriculumNodeType,
	type FieldError,
	type LegacyEntityType
} from './types.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RATIONALE_MAX_LENGTH = 2_000;

function trimmedString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateUuid(field: string, value: unknown): { value: string; error?: FieldError } {
	const id = trimmedString(value);
	if (!UUID_PATTERN.test(id)) {
		return { value: id, error: { field, message: 'Select a valid value.' } };
	}
	return { value: id };
}

export function validateLegacyEntityType(value: unknown): {
	value?: LegacyEntityType;
	error?: FieldError;
} {
	if (typeof value === 'string' && LEGACY_ENTITY_TYPES.includes(value as LegacyEntityType)) {
		return { value: value as LegacyEntityType };
	}
	return { error: { field: 'legacyEntityType', message: 'Select a valid legacy type.' } };
}

export function validateTargetEntityType(value: unknown): {
	value?: CurriculumNodeType;
	error?: FieldError;
} {
	if (typeof value === 'string' && CURRICULUM_NODE_TYPES.includes(value as CurriculumNodeType)) {
		return { value: value as CurriculumNodeType };
	}
	return { error: { field: 'targetEntityType', message: 'Select a valid curriculum type.' } };
}

export function validateRationale(value: unknown): { value: string; error?: FieldError } {
	const rationale = trimmedString(value);
	if (rationale.length === 0) {
		return { value: rationale, error: { field: 'rationale', message: 'Enter a rationale.' } };
	}
	if (rationale.length > RATIONALE_MAX_LENGTH) {
		return {
			value: rationale,
			error: { field: 'rationale', message: 'Rationale must be 2,000 characters or fewer.' }
		};
	}
	return { value: rationale };
}

export function fieldErrors(fields: Array<FieldError | undefined>): readonly FieldError[] | null {
	const errors = fields.filter((field): field is FieldError => Boolean(field));
	return errors.length > 0 ? errors : null;
}
