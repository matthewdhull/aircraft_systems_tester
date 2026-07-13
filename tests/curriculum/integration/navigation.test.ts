import { describe, expect, it } from 'vitest';

import {
	PERMISSIONS,
	type AuthenticatedPrincipal
} from '../../../src/lib/server/authorization/index.js';
import { navigationGroups } from '../../../src/lib/navigation/navigation.js';
import { load } from '../../../src/routes/+layout.server.js';

function principal(permissions: readonly string[]): AuthenticatedPrincipal {
	return {
		userId: '10000000-0000-4000-8000-000000000001',
		employeeNumber: '000001',
		displayName: 'Synthetic Curriculum User',
		roles: [],
		permissions: new Set(permissions),
		sessionIdHash: 'a'.repeat(64)
	};
}

describe('curriculum navigation presentation', () => {
	it('points the curriculum item at the protected Phase 5 route', () => {
		const item = navigationGroups
			.flatMap((group) => group.items)
			.find((candidate) => candidate.id === 'curriculum');
		expect(item).toMatchObject({ href: '/admin/curriculum', audience: 'staff' });
	});

	it('shows curriculum only when the server principal holds curriculum.manage', () => {
		const anonymous = load({ locals: { principal: null } } as never) as {
			visibleNavigationItemIds: string[];
		};
		const instructorOnly = load({
			locals: { principal: principal([PERMISSIONS.ROSTERS_ASSIGNED_MANAGE]) }
		} as never) as { visibleNavigationItemIds: string[] };
		const revokedGrant = load({ locals: { principal: principal([]) } } as never) as {
			visibleNavigationItemIds: string[];
		};
		const curriculumManager = load({
			locals: { principal: principal([PERMISSIONS.CURRICULUM_MANAGE]) }
		} as never) as { visibleNavigationItemIds: string[] };

		for (const denied of [anonymous, instructorOnly, revokedGrant]) {
			expect(denied.visibleNavigationItemIds).not.toContain('curriculum');
		}
		expect(curriculumManager.visibleNavigationItemIds).toContain('curriculum');
	});
});
