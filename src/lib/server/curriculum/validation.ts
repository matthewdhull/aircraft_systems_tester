import type { FieldError } from './types.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface Validated<T> {
	value: T;
	error?: FieldError;
}

export function text(
	field: string,
	value: unknown,
	options: { required: boolean; max: number }
): Validated<string | null> {
	if (value == null && !options.required) return { value: null };
	if (typeof value !== 'string') {
		return { value: null, error: { field, message: 'Enter a valid value.' } };
	}
	const normalized = value.trim();
	if (options.required && normalized.length === 0) {
		return { value: null, error: { field, message: 'This field is required.' } };
	}
	if (normalized.length > options.max) {
		return { value: null, error: { field, message: `Use ${options.max} characters or fewer.` } };
	}
	return { value: normalized.length === 0 ? null : normalized };
}

export function uuid(field: string, value: unknown, nullable = false): Validated<string | null> {
	if (value == null && nullable) return { value: null };
	if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
		return { value: null, error: { field, message: 'Enter a valid identifier.' } };
	}
	return { value };
}

export function integer(
	field: string,
	value: unknown,
	options: { min: number; optional?: boolean }
): Validated<number | null> {
	if ((value == null || value === '') && options.optional) return { value: null };
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < options.min) {
		return { value: null, error: { field, message: 'Enter a valid whole number.' } };
	}
	return { value: parsed };
}

export function date(field: string, value: unknown, optional = false): Validated<string | null> {
	if ((value == null || value === '') && optional) return { value: null };
	if (typeof value !== 'string') {
		return { value: null, error: { field, message: 'Enter a valid date and time.' } };
	}
	const parsed = new Date(value);
	if (!Number.isFinite(parsed.getTime())) {
		return { value: null, error: { field, message: 'Enter a valid date and time.' } };
	}
	return { value: parsed.toISOString() };
}

export function errors(...values: Array<Validated<unknown>>): readonly FieldError[] {
	return values.flatMap((value) => (value.error ? [value.error] : []));
}
