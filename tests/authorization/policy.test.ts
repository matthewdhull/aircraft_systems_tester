import { describe, expect, it } from 'vitest';

import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_PERMISSION_POLICY,
	ROUTE_POLICIES,
	requirePermission,
	safeLocalRedirect
} from '../../src/lib/server/authorization';

const principal = {
	userId: '36df36b0-d3ad-4b93-ab87-00e975a5a030',
	employeeNumber: '0007',
	displayName: 'Synthetic User',
	roles: [BASELINE_ROLES.INSTRUCTOR],
	permissions: new Set([PERMISSIONS.ROSTERS_ASSIGNED_MANAGE]),
	sessionIdHash: 'synthetic-hash-marker'
};

describe('authorization policy', () => {
	it('defines five baseline roles with granular server permissions', () => {
		expect(Object.values(BASELINE_ROLES)).toHaveLength(5);
		expect(ROLE_PERMISSION_POLICY.administrator).toContain(PERMISSIONS.USERS_ROLES_MANAGE);
		expect(ROLE_PERMISSION_POLICY.instructor).not.toContain(PERMISSIONS.USERS_VIEW);
		expect(ROLE_PERMISSION_POLICY.report_viewer).not.toContain(PERMISSIONS.ANSWER_KEYS_VIEW);
	});

	it('allows a held permission and rejects a missing permission', () => {
		expect(requirePermission({ principal }, PERMISSIONS.ROSTERS_ASSIGNED_MANAGE)).toBe(principal);
		expect(() => requirePermission({ principal }, PERMISSIONS.USERS_VIEW)).toThrow();
	});

	it('rejects external, protocol-relative, and malformed redirect targets', () => {
		expect(safeLocalRedirect('/admin/instructors?status=active')).toBe(
			'/admin/instructors?status=active'
		);
		expect(safeLocalRedirect('//external.invalid/path')).toBe('/');
		expect(safeLocalRedirect('https://external.invalid/path')).toBe('/');
		expect(safeLocalRedirect(null)).toBe('/');
	});

	it('inventories every current route pattern and mutation permission', () => {
		expect(ROUTE_POLICIES).toHaveLength(19);
		const mutations = ROUTE_POLICIES.flatMap((route) => route.mutations);
		expect(mutations).toHaveLength(53);
		expect(
			mutations.filter((mutation) => mutation.permission).map((mutation) => mutation.permission)
		).toEqual([
			PERMISSIONS.USERS_CREATE,
			PERMISSIONS.USERS_EDIT,
			PERMISSIONS.USERS_EDIT,
			PERMISSIONS.USERS_LIFECYCLE,
			PERMISSIONS.USERS_ROLES_MANAGE,
			PERMISSIONS.USERS_ROLES_MANAGE,
			...Array.from({ length: 23 }, () => PERMISSIONS.CURRICULUM_MANAGE),
			PERMISSIONS.QUESTIONS_CREATE,
			...Array.from({ length: 5 }, () => PERMISSIONS.QUESTIONS_CREATE),
			PERMISSIONS.QUESTIONS_REVIEW,
			PERMISSIONS.QUESTIONS_PUBLISH,
			PERMISSIONS.QUESTIONS_PUBLISH,
			PERMISSIONS.QUESTIONS_REVIEW,
			PERMISSIONS.QUESTIONS_REVIEW,
			...Array.from({ length: 9 }, () => PERMISSIONS.TEMPLATES_MANAGE),
			PERMISSIONS.EXAMS_PUBLISH
		]);
	});
});
