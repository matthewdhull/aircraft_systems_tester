import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	actions as listActions,
	load as listLoad
} from '../../src/routes/admin/instructors/+page.server.js';
import {
	actions as detailActions,
	load as detailLoad
} from '../../src/routes/admin/instructors/[id]/+page.server.js';
import { POST as logout } from '../../src/routes/logout/+server.js';
import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_PERMISSION_POLICY,
	type AuthenticatedPrincipal,
	type PermissionCode
} from '../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/index.js';

let database: DatabaseHandle;

function principal(
	roles: readonly string[],
	permissions: readonly PermissionCode[]
): AuthenticatedPrincipal {
	return {
		userId: '10000000-0000-4000-8000-000000000001',
		employeeNumber: '000001',
		displayName: 'Synthetic Principal',
		roles,
		permissions: new Set(permissions),
		sessionIdHash: 'a'.repeat(64)
	};
}

const principalCases = {
	insufficient: principal([BASELINE_ROLES.REPORT_VIEWER], ROLE_PERMISSION_POLICY.report_viewer),
	instructor: principal([BASELINE_ROLES.INSTRUCTOR], ROLE_PERMISSION_POLICY.instructor),
	administrator: principal([BASELINE_ROLES.ADMINISTRATOR], Object.values(PERMISSIONS)),
	multiRole: principal(
		[BASELINE_ROLES.ADMINISTRATOR, BASELINE_ROLES.INSTRUCTOR],
		Object.values(PERMISSIONS)
	),
	revokedGrant: principal([], [])
};

const adminActions = [
	{
		name: 'create',
		permission: PERMISSIONS.USERS_CREATE,
		action: listActions.create,
		form: { employeeNumber: '', firstName: '', lastName: '' }
	},
	{
		name: 'edit',
		permission: PERMISSIONS.USERS_EDIT,
		action: detailActions.edit,
		form: { firstName: '', lastName: '' }
	},
	{
		name: 'correctEmployeeNumber',
		permission: PERMISSIONS.USERS_EDIT,
		action: detailActions.correctEmployeeNumber,
		form: { employeeNumber: '', reason: '' }
	},
	{
		name: 'changeStatus',
		permission: PERMISSIONS.USERS_LIFECYCLE,
		action: detailActions.changeStatus,
		form: { status: '' }
	},
	{
		name: 'grantRole',
		permission: PERMISSIONS.USERS_ROLES_MANAGE,
		action: detailActions.grantRole,
		form: { roleId: '' }
	},
	{
		name: 'revokeRole',
		permission: PERMISSIONS.USERS_ROLES_MANAGE,
		action: detailActions.revokeRole,
		form: { roleId: '' }
	}
] as const;

function request(form: Readonly<Record<string, string>>): Request {
	const body = new FormData();
	for (const [key, value] of Object.entries(form)) body.set(key, value);
	return new Request('https://local.invalid/admin/instructors/synthetic?/action', {
		method: 'POST',
		body
	});
}

function thrownStatus(work: () => unknown | Promise<unknown>): Promise<number | undefined> {
	return Promise.resolve()
		.then(work)
		.then(
			() => undefined,
			(error: unknown) =>
				typeof error === 'object' && error !== null && 'status' in error
					? Number(error.status)
					: undefined
		);
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
});

afterEach(() => database.close());

describe('real protected page-load authorization matrix', () => {
	it.each([
		['anonymous', null, 303],
		['inactive session', null, 303],
		['insufficient', principalCases.insufficient, 403],
		['instructor', principalCases.instructor, 403],
		['revoked grant', principalCases.revokedGrant, 403]
	] as const)('rejects %s on both administrator page loads', async (_label, candidate, status) => {
		const locals = { principal: candidate, database };
		expect(await thrownStatus(() => listLoad({ locals } as never))).toBe(status);
		expect(
			await thrownStatus(() => detailLoad({ locals, params: { id: 'missing' } } as never))
		).toBe(status);
	});

	it.each([
		['administrator', principalCases.administrator],
		['multi-role', principalCases.multiRole]
	] as const)('allows %s through both page guards', async (_label, candidate) => {
		const locals = { principal: candidate, database };
		expect(listLoad({ locals } as never)).toMatchObject({ instructors: [] });
		expect(
			await thrownStatus(() => detailLoad({ locals, params: { id: 'missing' } } as never))
		).toBe(404);
	});
});

describe('real administrator action authorization matrix', () => {
	it.each(adminActions)('enforces $permission on the $name action', async ({ action, form }) => {
		if (!action) throw new Error('A route-matrix action is missing.');
		for (const candidate of [
			null,
			principalCases.insufficient,
			principalCases.instructor,
			principalCases.revokedGrant
		]) {
			const expectedStatus = candidate === null ? 401 : 403;
			expect(
				await thrownStatus(() =>
					action({
						locals: { principal: candidate, database },
						params: { id: 'missing' },
						request: request(form)
					} as never)
				)
			).toBe(expectedStatus);
		}

		for (const candidate of [principalCases.administrator, principalCases.multiRole]) {
			const result = await action({
				locals: { principal: candidate, database },
				params: { id: 'missing' },
				request: request(form)
			} as never);
			expect(result).toMatchObject({ status: 400 });
		}
	});
});

describe('real authenticated logout endpoint matrix', () => {
	it.each([
		['anonymous', null, 401],
		['inactive session', null, 401]
	] as const)('rejects %s direct POST with %i', async (_label, candidate, status) => {
		expect(
			await thrownStatus(() =>
				logout({
					locals: { principal: candidate, database },
					cookies: { get: () => undefined, delete: () => undefined }
				} as never)
			)
		).toBe(status);
	});

	it.each([
		['authenticated without admin permission', principalCases.insufficient],
		['instructor', principalCases.instructor],
		['administrator', principalCases.administrator],
		['multi-role', principalCases.multiRole],
		['revoked administrator grant', principalCases.revokedGrant]
	] as const)('allows %s to revoke its own session', async (_label, candidate) => {
		const deleted: string[] = [];
		expect(
			await thrownStatus(() =>
				logout({
					locals: { principal: candidate, database },
					cookies: {
						get: () => undefined,
						delete: (name: string) => deleted.push(name)
					}
				} as never)
			)
		).toBe(303);
		expect(deleted).toEqual(['ast_session']);
	});
});
