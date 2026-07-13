import { afterEach, describe, expect, it } from 'vitest';

import {
	BASELINE_ROLES,
	PERMISSIONS,
	countEffectiveActiveAdministrators,
	hasEffectiveAdministratorCapability,
	isAdministratorRole,
	resolveEffectivePrincipal,
	seedBaselineAuthorization
} from '../../src/lib/server/authorization';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db';

const handles: DatabaseHandle[] = [];

function database(): DatabaseHandle {
	const handle = openDatabase({ path: ':memory:' });
	handles.push(handle);
	return handle;
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('authorization persistence', () => {
	it('seeds baseline roles and permissions idempotently', () => {
		const handle = database();
		handle.transaction((db) => {
			seedBaselineAuthorization(db, '2026-07-12T00:00:00.000Z');
			seedBaselineAuthorization(db, '2026-07-12T00:00:01.000Z');
		});

		expect(handle.sqlite.prepare('SELECT count(*) FROM roles').pluck().get()).toBe(5);
		expect(handle.sqlite.prepare('SELECT count(*) FROM permissions').pluck().get()).toBe(
			Object.values(PERMISSIONS).length
		);
	});

	it('resolves multi-role permissions and centralizes the active administrator invariant', () => {
		const handle = database();
		handle.transaction((db) => seedBaselineAuthorization(db, '2026-07-12T00:00:00.000Z'));
		handle.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, 'active', ?, ?)`
			)
			.run(
				'user-synthetic',
				'0007',
				'Synthetic',
				'Administrator',
				'2026-07-12T00:00:00.000Z',
				'2026-07-12T00:00:00.000Z'
			);
		const grant = handle.sqlite.prepare(
			`INSERT INTO user_roles (user_id, role_id, granted_at)
			 SELECT ?, id, ? FROM roles WHERE code = ?`
		);
		grant.run('user-synthetic', '2026-07-12T00:00:00.000Z', BASELINE_ROLES.ADMINISTRATOR);
		grant.run('user-synthetic', '2026-07-12T00:00:01.000Z', BASELINE_ROLES.INSTRUCTOR);

		const resolved = resolveEffectivePrincipal(handle.db, 'user-synthetic', 'session-hash-marker');
		expect(resolved?.roles).toEqual(['administrator', 'instructor']);
		expect(resolved?.permissions.has(PERMISSIONS.USERS_ROLES_MANAGE)).toBe(true);
		expect(hasEffectiveAdministratorCapability(handle.db, 'user-synthetic')).toBe(true);
		expect(countEffectiveActiveAdministrators(handle.db)).toBe(1);
		const administratorRoleId = handle.sqlite
			.prepare('SELECT id FROM roles WHERE code = ?')
			.pluck()
			.get(BASELINE_ROLES.ADMINISTRATOR) as string;
		expect(isAdministratorRole(handle.db, administratorRoleId)).toBe(true);
	});
});
