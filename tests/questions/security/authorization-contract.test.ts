import { describe, expect, it } from 'vitest';

import { load as layoutLoad } from '../../../src/routes/+layout.server.js';
import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_PERMISSION_POLICY,
	ROUTE_POLICIES,
	type AuthenticatedPrincipal,
	type PermissionCode
} from '../../../src/lib/server/authorization/index.js';

function principal(
	roles: readonly string[],
	permissions: readonly PermissionCode[]
): AuthenticatedPrincipal {
	return {
		userId: '60000000-0000-4000-8000-000000000001',
		employeeNumber: '060001',
		displayName: 'Synthetic Question Principal',
		roles,
		permissions: new Set(permissions),
		sessionIdHash: '6'.repeat(64)
	};
}

describe('Phase 6 central authorization contract', () => {
	it('inventories two question routes and all eleven named mutations', () => {
		const policies = ROUTE_POLICIES.filter((policy) => policy.pattern.startsWith('/questions'));
		expect(policies.map((policy) => policy.pattern)).toEqual(['/questions', '/questions/[id]']);
		expect(policies.flatMap((policy) => policy.mutations)).toHaveLength(11);
		expect(policies.every((policy) => policy.permission === PERMISSIONS.QUESTIONS_VIEW)).toBe(true);

		const mutations = Object.fromEntries(
			policies.flatMap((policy) => policy.mutations).map((mutation) => [mutation.name, mutation])
		);
		for (const name of [
			'createQuestion',
			'updateDraft',
			'createVersion',
			'submitReview',
			'deleteDraft',
			'proposeFutureLink'
		]) {
			expect(mutations[name]?.permission).toBe(PERMISSIONS.QUESTIONS_CREATE);
		}
		for (const name of ['reviewVersion', 'approveFutureLink', 'retireFutureLink']) {
			expect(mutations[name]?.permission).toBe(PERMISSIONS.QUESTIONS_REVIEW);
		}
		for (const name of ['publishVersion', 'retireVersion']) {
			expect(mutations[name]?.permission).toBe(PERMISSIONS.QUESTIONS_PUBLISH);
		}
	});

	it('keeps create, review, publish, retirement, and key viewing granular', () => {
		expect(
			new Set([
				PERMISSIONS.QUESTIONS_VIEW,
				PERMISSIONS.QUESTIONS_CREATE,
				PERMISSIONS.QUESTIONS_REVIEW,
				PERMISSIONS.QUESTIONS_PUBLISH,
				PERMISSIONS.RECORDS_RETIRE,
				PERMISSIONS.ANSWER_KEYS_VIEW
			]).size
		).toBe(6);
		expect(ROLE_PERMISSION_POLICY.question_author).toEqual([
			PERMISSIONS.QUESTIONS_VIEW,
			PERMISSIONS.QUESTIONS_CREATE,
			PERMISSIONS.QUESTIONS_REVIEW,
			PERMISSIONS.QUESTIONS_PUBLISH
		]);
		expect(ROLE_PERMISSION_POLICY.curriculum_manager).not.toContain(PERMISSIONS.QUESTIONS_CREATE);
		expect(ROLE_PERMISSION_POLICY.instructor).not.toContain(PERMISSIONS.QUESTIONS_CREATE);
	});

	it('shows question navigation only from the server-held safe-read permission', () => {
		const denied = layoutLoad({
			locals: {
				principal: principal(
					[BASELINE_ROLES.CURRICULUM_MANAGER],
					ROLE_PERMISSION_POLICY.curriculum_manager
				)
			}
		} as never) as { visibleNavigationItemIds: string[] };
		const allowed = layoutLoad({
			locals: {
				principal: principal(
					[BASELINE_ROLES.QUESTION_AUTHOR],
					ROLE_PERMISSION_POLICY.question_author
				)
			}
		} as never) as { visibleNavigationItemIds: string[] };
		expect(denied.visibleNavigationItemIds).not.toContain('questions');
		expect(allowed.visibleNavigationItemIds).toContain('questions');
	});
});
