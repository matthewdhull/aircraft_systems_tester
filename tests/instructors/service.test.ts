import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	countEffectiveActiveAdministrators,
	hasEffectiveAdministratorCapability,
	isAdministratorRole,
	seedBaselineAuthorization
} from '../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/database.js';
import {
	InstructorAdministrationService,
	createInstructorAdministrationService,
	type AuditEventInput,
	type InstructorServiceDependencies
} from '../../src/lib/server/instructors/index.js';

const AT = new Date('2026-07-12T18:00:00.000Z');
const ACTOR_ID = '10000000-0000-4000-8000-000000000001';
const TARGET_ID = '10000000-0000-4000-8000-000000000002';

let database: DatabaseHandle;
let nextId = 10;
let auditEvents: AuditEventInput[];
let revokedUsers: string[];
let dependencies: InstructorServiceDependencies;
let service: InstructorAdministrationService;

function insertUser(
	id: string,
	employeeNumber: string,
	status: 'pending' | 'active' | 'suspended' | 'retired' = 'active',
	firstName = 'Synthetic',
	lastName = 'User'
): void {
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(id, employeeNumber, firstName, lastName, status, AT.toISOString(), AT.toISOString());
}

function roleId(code: string): string {
	return String(database.sqlite.prepare('SELECT id FROM roles WHERE code = ?').pluck().get(code));
}

function grant(userId: string, code: string, at = AT.toISOString()): void {
	database.sqlite
		.prepare(
			'INSERT INTO user_roles (user_id, role_id, granted_by_user_id, granted_at) VALUES (?, ?, ?, ?)'
		)
		.run(userId, roleId(code), ACTOR_ID, at);
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	seedBaselineAuthorization(database.db, AT.toISOString());
	insertUser(ACTOR_ID, '00001', 'active', 'Admin', 'Actor');
	insertUser(TARGET_ID, '00002', 'active', 'Target', 'Person');
	grant(ACTOR_ID, 'administrator');
	auditEvents = [];
	revokedUsers = [];
	dependencies = {
		clock: { now: () => AT },
		createId: () => `10000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
		recordAuditEvent: (_tx, event) => auditEvents.push(event),
		revokeAllForUser: (userId) => {
			revokedUsers.push(userId);
		},
		isEffectiveActiveAdministrator: hasEffectiveAdministratorCapability,
		countEffectiveActiveAdministrators,
		isAdministratorRole
	};
	service = new InstructorAdministrationService(database, dependencies);
});

afterEach(() => database.close());

describe('instructor administration reads and creation', () => {
	it('lists and views synthetic users with their active roles', () => {
		grant(TARGET_ID, 'instructor');

		expect(service.list().map((user) => user.employeeNumber)).toEqual(['00001', '00002']);
		expect(service.get(TARGET_ID)?.roles.map((role) => role.code)).toEqual(['instructor']);
	});

	it('creates a pending UUID account and preserves leading zeroes', () => {
		const result = service.create(ACTOR_ID, {
			employeeNumber: '00742',
			firstName: 'New',
			lastName: 'Instructor'
		});

		expect(result).toMatchObject({
			ok: true,
			value: { employeeNumber: '00742', status: 'pending', firstName: 'New' }
		});
		expect(auditEvents).toHaveLength(1);
		expect(auditEvents[0]).toMatchObject({ action: 'user.created', actorUserId: ACTOR_ID });
		expect(
			database.sqlite
				.prepare("SELECT password_hash FROM users WHERE employee_number = '00742'")
				.pluck()
				.get()
		).toBeNull();
	});

	it('returns field-safe validation and rejects duplicate employee numbers', () => {
		expect(
			service.create(ACTOR_ID, { employeeNumber: '', firstName: '', lastName: '' })
		).toMatchObject({ ok: false, error: 'invalid_input' });
		expect(
			service.create(ACTOR_ID, {
				employeeNumber: '00002',
				firstName: 'Duplicate',
				lastName: 'User'
			})
		).toEqual({ ok: false, error: 'conflict' });
		expect(auditEvents).toHaveLength(0);
	});
});

describe('profile and employee-number history', () => {
	it('updates names and records an allow-listed audit event', () => {
		const result = service.edit(ACTOR_ID, TARGET_ID, { firstName: 'Updated', lastName: 'Name' });

		expect(result).toMatchObject({ ok: true, value: { firstName: 'Updated', lastName: 'Name' } });
		expect(auditEvents[0]).toMatchObject({ action: 'user.updated', entityId: TARGET_ID });
	});

	it('corrects employee numbers with append-only history', () => {
		const result = service.correctEmployeeNumber(ACTOR_ID, TARGET_ID, {
			employeeNumber: '00009',
			reason: 'Source record correction'
		});

		expect(result).toMatchObject({ ok: true, value: { employeeNumber: '00009' } });
		expect(service.get(TARGET_ID)?.employeeNumberHistory).toEqual([
			expect.objectContaining({
				previousValue: '00002',
				replacementValue: '00009',
				changedByUserId: ACTOR_ID,
				reason: 'Source record correction'
			})
		]);
		expect(auditEvents[0]?.action).toBe('user.employee_number.changed');
	});

	it('rejects a no-op correction without adding history', () => {
		expect(
			service.correctEmployeeNumber(ACTOR_ID, TARGET_ID, {
				employeeNumber: '00002',
				reason: 'No change'
			})
		).toMatchObject({ ok: false, error: 'invalid_input' });
		expect(
			database.sqlite.prepare('SELECT count(*) FROM employee_identifier_history').pluck().get()
		).toBe(0);
	});
});

describe('account lifecycle', () => {
	it('integrates real session revocation and audit writes atomically', () => {
		database.sqlite
			.prepare(
				`INSERT INTO sessions
				 (id_hash, user_id, created_at, last_seen_at, expires_at)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.run(
				'a'.repeat(64),
				TARGET_ID,
				AT.toISOString(),
				AT.toISOString(),
				new Date(AT.getTime() + 60_000).toISOString()
			);

		const result = createInstructorAdministrationService(database).changeStatus(
			ACTOR_ID,
			TARGET_ID,
			{ status: 'suspended' }
		);

		expect(result).toMatchObject({ ok: true, value: { status: 'suspended' } });
		expect(
			database.sqlite
				.prepare('SELECT revoked_at FROM sessions WHERE user_id = ?')
				.pluck()
				.get(TARGET_ID)
		).not.toBeNull();
		expect(
			database.sqlite
				.prepare('SELECT action FROM audit_events WHERE entity_id = ?')
				.pluck()
				.all(TARGET_ID)
				.sort()
		).toEqual(['session.revoked', 'user.status.changed']);
	});

	it('suspends an active account and revokes its sessions inside the mutation', () => {
		const result = service.changeStatus(ACTOR_ID, TARGET_ID, { status: 'suspended' });

		expect(result).toMatchObject({ ok: true, value: { status: 'suspended' } });
		expect(revokedUsers).toEqual([TARGET_ID]);
		expect(auditEvents[0]).toMatchObject({
			action: 'user.status.changed',
			before: { status: 'active' },
			after: { status: 'suspended' }
		});
	});

	it('rolls back status when session revocation fails', () => {
		dependencies.revokeAllForUser = () => {
			throw new Error('synthetic revocation failure');
		};
		service = new InstructorAdministrationService(database, dependencies);

		expect(service.changeStatus(ACTOR_ID, TARGET_ID, { status: 'suspended' })).toEqual({
			ok: false,
			error: 'unavailable'
		});
		expect(service.get(TARGET_ID)?.status).toBe('active');
	});

	it('rolls back lifecycle mutation when audit writing fails', () => {
		dependencies.recordAuditEvent = () => {
			throw new Error('synthetic audit failure');
		};
		service = new InstructorAdministrationService(database, dependencies);

		expect(service.changeStatus(ACTOR_ID, TARGET_ID, { status: 'suspended' })).toEqual({
			ok: false,
			error: 'unavailable'
		});
		expect(service.get(TARGET_ID)?.status).toBe('active');
	});

	it('makes retirement terminal', () => {
		expect(service.changeStatus(ACTOR_ID, TARGET_ID, { status: 'retired' }).ok).toBe(true);
		expect(service.changeStatus(ACTOR_ID, TARGET_ID, { status: 'active' })).toMatchObject({
			ok: false,
			error: 'invalid_input'
		});
	});
});

describe('role management and final administrator invariant', () => {
	it('grants and revokes multiple roles with audit events', () => {
		expect(service.grantRole(ACTOR_ID, TARGET_ID, { roleId: roleId('instructor') }).ok).toBe(true);
		expect(service.grantRole(ACTOR_ID, TARGET_ID, { roleId: roleId('report_viewer') }).ok).toBe(
			true
		);
		expect(
			service
				.get(TARGET_ID)
				?.roles.map((role) => role.code)
				.sort()
		).toEqual(['instructor', 'report_viewer']);
		expect(service.revokeRole(ACTOR_ID, TARGET_ID, { roleId: roleId('instructor') }).ok).toBe(true);
		expect(service.get(TARGET_ID)?.roles.map((role) => role.code)).toEqual(['report_viewer']);
		expect(auditEvents.map((event) => event.action)).toEqual([
			'user.role.granted',
			'user.role.granted',
			'user.role.revoked'
		]);
	});

	it('prevents revoking the final effective active administrator role', () => {
		const result = service.revokeRole(ACTOR_ID, ACTOR_ID, { roleId: roleId('administrator') });

		expect(result).toEqual({ ok: false, error: 'final_active_administrator' });
		expect(hasEffectiveAdministratorCapability(database.db, ACTOR_ID)).toBe(true);
	});

	it('prevents suspending the final effective active administrator', () => {
		expect(service.changeStatus(ACTOR_ID, ACTOR_ID, { status: 'suspended' })).toEqual({
			ok: false,
			error: 'final_active_administrator'
		});
		expect(service.get(ACTOR_ID)?.status).toBe('active');
	});

	it('allows administrator removal after another active administrator exists', () => {
		grant(TARGET_ID, 'administrator');

		expect(service.revokeRole(ACTOR_ID, ACTOR_ID, { roleId: roleId('administrator') }).ok).toBe(
			true
		);
		expect(hasEffectiveAdministratorCapability(database.db, ACTOR_ID)).toBe(false);
		expect(hasEffectiveAdministratorCapability(database.db, TARGET_ID)).toBe(true);
	});

	it('does not mistake revocation of another role for administrator removal', () => {
		grant(ACTOR_ID, 'instructor', '2026-07-12T18:01:00.000Z');

		expect(service.revokeRole(ACTOR_ID, ACTOR_ID, { roleId: roleId('instructor') }).ok).toBe(true);
		expect(hasEffectiveAdministratorCapability(database.db, ACTOR_ID)).toBe(true);
	});

	it('rolls back a role grant when audit persistence fails', () => {
		dependencies.recordAuditEvent = vi.fn(() => {
			throw new Error('synthetic audit failure');
		});
		service = new InstructorAdministrationService(database, dependencies);

		expect(service.grantRole(ACTOR_ID, TARGET_ID, { roleId: roleId('instructor') })).toEqual({
			ok: false,
			error: 'unavailable'
		});
		expect(service.get(TARGET_ID)?.roles).toEqual([]);
	});
});
