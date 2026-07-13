import { randomBytes, randomUUID } from 'node:crypto';

import { recordAuditEvent } from '../../../src/lib/server/audit/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

export class MutableClock {
	constructor(public current = new Date('2040-01-01T00:00:00.000Z')) {}
	now(): Date {
		return new Date(this.current);
	}
	advance(milliseconds: number): void {
		this.current = new Date(this.current.getTime() + milliseconds);
	}
}

export function syntheticPassword(): string {
	return `Synthetic-${randomBytes(18).toString('base64url')}`;
}

export function openTestDatabase(): DatabaseHandle {
	return openDatabase({ path: ':memory:' });
}

export function insertUser(
	handle: DatabaseHandle,
	input: {
		employeeNumber?: string;
		firstName?: string;
		lastName?: string;
		passwordHash?: string | null;
		status?: 'pending' | 'active' | 'suspended' | 'retired';
	} = {}
): string {
	const id = randomUUID();
	const now = '2040-01-01T00:00:00.000Z';
	handle.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, password_hash, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			id,
			input.employeeNumber ?? randomBytes(6).toString('hex'),
			input.firstName ?? 'Synthetic',
			input.lastName ?? 'Operator',
			input.passwordHash ?? null,
			input.status ?? 'active',
			now,
			now
		);
	return id;
}

export { recordAuditEvent };
