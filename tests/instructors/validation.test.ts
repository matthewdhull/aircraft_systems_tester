import { describe, expect, it } from 'vitest';

import {
	validateEmployeeNumber,
	validateName,
	validateReason,
	validateStatus
} from '../../src/lib/server/instructors/validation.js';

describe('instructor administration validation', () => {
	it('preserves employee-number leading zeroes and rejects unsafe characters', () => {
		expect(validateEmployeeNumber(' 00125 ').value).toBe('00125');
		expect(validateEmployeeNumber('12 34').error?.field).toBe('employeeNumber');
	});

	it('normalizes names and requires a correction reason', () => {
		expect(validateName('firstName', ' Ada ').value).toBe('Ada');
		expect(validateReason('  ').error?.field).toBe('reason');
	});

	it('accepts only persisted lifecycle states', () => {
		expect(validateStatus('active')).toEqual({ value: 'active' });
		expect(validateStatus('deleted').error?.field).toBe('status');
	});
});
