import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	actions as hierarchyActions,
	load as hierarchyLoad
} from '../../../src/routes/admin/curriculum/+page.server.js';
import {
	actions as bloomActions,
	load as bloomLoad
} from '../../../src/routes/admin/curriculum/bloom/+page.server.js';
import {
	actions as mappingActions,
	load as mappingLoad
} from '../../../src/routes/admin/curriculum/mappings/+page.server.js';
import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_PERMISSION_POLICY,
	ROUTE_POLICIES,
	type AuthenticatedPrincipal,
	type PermissionCode
} from '../../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

let database: DatabaseHandle;

function principal(
	roles: readonly string[],
	permissions: readonly PermissionCode[]
): AuthenticatedPrincipal {
	return {
		userId: '10000000-0000-4000-8000-000000000001',
		employeeNumber: '000001',
		displayName: 'Synthetic Curriculum Principal',
		roles,
		permissions: new Set(permissions),
		sessionIdHash: 'a'.repeat(64)
	};
}

const principals = {
	insufficient: principal([BASELINE_ROLES.REPORT_VIEWER], ROLE_PERMISSION_POLICY.report_viewer),
	instructor: principal([BASELINE_ROLES.INSTRUCTOR], ROLE_PERMISSION_POLICY.instructor),
	curriculumManager: principal(
		[BASELINE_ROLES.CURRICULUM_MANAGER],
		ROLE_PERMISSION_POLICY.curriculum_manager
	),
	administrator: principal([BASELINE_ROLES.ADMINISTRATOR], Object.values(PERMISSIONS)),
	revokedGrant: principal([], [])
};

const routeGroups = [
	{ pattern: '/admin/curriculum', load: hierarchyLoad, actions: hierarchyActions },
	{ pattern: '/admin/curriculum/bloom', load: bloomLoad, actions: bloomActions },
	{ pattern: '/admin/curriculum/mappings', load: mappingLoad, actions: mappingActions }
] as const;

function request(pattern: string, action: string): Request {
	return new Request(`https://local.invalid${pattern}?/${action}`, {
		method: 'POST',
		body: new FormData()
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

describe('Phase 5 route and mutation inventory', () => {
	it('matches all three protected route files to the 23 binding named mutations', () => {
		const policies = ROUTE_POLICIES.filter((policy) =>
			policy.pattern.startsWith('/admin/curriculum')
		);
		expect(policies.map((policy) => policy.pattern)).toEqual(
			routeGroups.map((group) => group.pattern)
		);
		expect(policies.flatMap((policy) => policy.mutations)).toHaveLength(23);
		for (const group of routeGroups) {
			const policy = policies.find((candidate) => candidate.pattern === group.pattern)!;
			expect(Object.keys(group.actions).sort()).toEqual(
				policy.mutations.map((mutation) => mutation.name).sort()
			);
			expect(policy.permission).toBe(PERMISSIONS.CURRICULUM_MANAGE);
			expect(policy.mutations.every((mutation) => mutation.permission === policy.permission)).toBe(
				true
			);
		}
	});
});

describe('real Phase 5 page-load guards', () => {
	it.each([
		['anonymous', null, 303],
		['suspended user', null, 303],
		['authenticated without permission', principals.insufficient, 403],
		['Instructor without curriculum permission', principals.instructor, 403],
		['revoked Curriculum Manager grant', principals.revokedGrant, 403]
	] as const)('denies %s on every curriculum load', async (_label, candidate, status) => {
		for (const group of routeGroups) {
			expect(
				await thrownStatus(() =>
					group.load({ locals: { principal: candidate, database } } as never)
				)
			).toBe(status);
		}
	});

	it.each([
		['Curriculum Manager', principals.curriculumManager],
		['Administrator', principals.administrator]
	] as const)('allows %s through every load guard', async (_label, candidate) => {
		for (const group of routeGroups) {
			expect(
				await group.load({ locals: { principal: candidate, database } } as never)
			).toBeTruthy();
		}
	});
});

describe('direct Phase 5 POST/action guards', () => {
	it('denies every named mutation before parsing or domain execution', async () => {
		for (const group of routeGroups) {
			for (const [name, action] of Object.entries(group.actions)) {
				if (!action) throw new Error(`Missing ${group.pattern} ${name} action.`);
				for (const candidate of [
					null,
					principals.insufficient,
					principals.instructor,
					principals.revokedGrant
				]) {
					expect(
						await thrownStatus(() =>
							action({
								locals: { principal: candidate, database },
								request: request(group.pattern, name)
							} as never)
						)
					).toBe(candidate === null ? 401 : 403);
				}
			}
		}
	});

	it('lets Curriculum Manager and Administrator reach server validation on all 23 mutations', async () => {
		let reached = 0;
		for (const group of routeGroups) {
			for (const [name, action] of Object.entries(group.actions)) {
				if (!action) throw new Error(`Missing ${group.pattern} ${name} action.`);
				for (const candidate of [principals.curriculumManager, principals.administrator]) {
					const result = await action({
						locals: { principal: candidate, database },
						request: request(group.pattern, name)
					} as never);
					expect(result).toHaveProperty('status');
					expect(Number((result as { status: number }).status)).toBeGreaterThanOrEqual(400);
					reached += 1;
				}
			}
		}
		expect(reached).toBe(46);
	});
});
