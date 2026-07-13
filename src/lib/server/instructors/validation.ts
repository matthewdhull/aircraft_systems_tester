import { USER_STATUSES, type FieldError, type UserStatus } from './types.js';

const EMPLOYEE_NUMBER_MAX_LENGTH = 64;
const NAME_MAX_LENGTH = 100;
const REASON_MAX_LENGTH = 500;

function trimmedString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateEmployeeNumber(value: unknown): { value: string; error?: FieldError } {
	const employeeNumber = trimmedString(value);
	if (employeeNumber.length === 0) {
		return {
			value: employeeNumber,
			error: { field: 'employeeNumber', message: 'Enter an employee number.' }
		};
	}
	if (employeeNumber.length > EMPLOYEE_NUMBER_MAX_LENGTH) {
		return {
			value: employeeNumber,
			error: { field: 'employeeNumber', message: 'Employee number must be 64 characters or fewer.' }
		};
	}
	if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(employeeNumber)) {
		return {
			value: employeeNumber,
			error: {
				field: 'employeeNumber',
				message: 'Use letters, numbers, periods, underscores, or hyphens.'
			}
		};
	}
	return { value: employeeNumber };
}

export function validateName(field: 'firstName' | 'lastName', value: unknown) {
	const name = trimmedString(value);
	const label = field === 'firstName' ? 'first name' : 'last name';
	if (name.length === 0) {
		return { value: name, error: { field, message: `Enter a ${label}.` } satisfies FieldError };
	}
	if (name.length > NAME_MAX_LENGTH) {
		return {
			value: name,
			error: {
				field,
				message: `${label[0]!.toUpperCase()}${label.slice(1)} must be 100 characters or fewer.`
			} satisfies FieldError
		};
	}
	return { value: name };
}

export function validateStatus(value: unknown): { value?: UserStatus; error?: FieldError } {
	if (typeof value === 'string' && USER_STATUSES.includes(value as UserStatus)) {
		return { value: value as UserStatus };
	}
	return { error: { field: 'status', message: 'Select a valid account status.' } };
}

export function validateReason(value: unknown): { value: string; error?: FieldError } {
	const reason = trimmedString(value);
	if (reason.length === 0) {
		return { value: reason, error: { field: 'reason', message: 'Enter a reason.' } };
	}
	if (reason.length > REASON_MAX_LENGTH) {
		return {
			value: reason,
			error: { field: 'reason', message: 'Reason must be 500 characters or fewer.' }
		};
	}
	return { value: reason };
}

export function validateId(field: string, value: unknown): { value: string; error?: FieldError } {
	const id = trimmedString(value);
	return id.length > 0
		? { value: id }
		: { value: id, error: { field, message: 'Select a valid value.' } };
}
