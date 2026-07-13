import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	actions as listActions,
	load as listLoad
} from '../../../src/routes/questions/+page.server.js';
import {
	actions as detailActions,
	load as detailLoad
} from '../../../src/routes/questions/[id]/+page.server.js';
import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_PERMISSION_POLICY,
	resolveEffectivePrincipal,
	seedBaselineAuthorization,
	type AuthenticatedPrincipal,
	type PermissionCode
} from '../../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

const MISSING_VERSION = '60000000-0000-4000-8000-000000000099';

let database: DatabaseHandle;

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

const identities = {
	insufficient: principal([BASELINE_ROLES.REPORT_VIEWER], ROLE_PERMISSION_POLICY.report_viewer),
	instructor: principal([BASELINE_ROLES.INSTRUCTOR], ROLE_PERMISSION_POLICY.instructor),
	curriculum: principal(
		[BASELINE_ROLES.CURRICULUM_MANAGER],
		ROLE_PERMISSION_POLICY.curriculum_manager
	),
	author: principal([BASELINE_ROLES.QUESTION_AUTHOR], ROLE_PERMISSION_POLICY.question_author),
	administrator: principal([BASELINE_ROLES.ADMINISTRATOR], Object.values(PERMISSIONS)),
	revoked: principal([], [])
};

function request(action: string, form: Readonly<Record<string, string>> = {}): Request {
	const body = new FormData();
	for (const [key, value] of Object.entries(form)) body.set(key, value);
	return new Request(`https://local.invalid/questions/${MISSING_VERSION}?/${action}`, {
		method: 'POST',
		body
	});
}

async function observedStatus(work: () => unknown | Promise<unknown>): Promise<number | undefined> {
	try {
		const result = await work();
		return typeof result === 'object' && result !== null && 'status' in result
			? Number(result.status)
			: undefined;
	} catch (error) {
		return typeof error === 'object' && error !== null && 'status' in error
			? Number(error.status)
			: undefined;
	}
}

const detailActionCases = [
	{
		name: 'updateDraft',
		permission: PERMISSIONS.QUESTIONS_CREATE,
		form: { versionId: MISSING_VERSION, expectedVersion: '1' }
	},
	{
		name: 'createVersion',
		permission: PERMISSIONS.QUESTIONS_CREATE,
		form: { questionId: MISSING_VERSION, fromVersionId: MISSING_VERSION }
	},
	{
		name: 'submitReview',
		permission: PERMISSIONS.QUESTIONS_CREATE,
		form: { versionId: MISSING_VERSION }
	},
	{
		name: 'deleteDraft',
		permission: PERMISSIONS.QUESTIONS_CREATE,
		form: { versionId: MISSING_VERSION, confirmed: 'yes', expectedDependencyRevision: 'synthetic' }
	},
	{
		name: 'proposeFutureLink',
		permission: PERMISSIONS.QUESTIONS_CREATE,
		form: { questionVersionId: MISSING_VERSION, futureTarget: MISSING_VERSION }
	},
	{
		name: 'reviewVersion',
		permission: PERMISSIONS.QUESTIONS_REVIEW,
		form: { versionId: MISSING_VERSION, decision: 'approve', rationale: 'Synthetic review' }
	},
	{
		name: 'publishVersion',
		permission: PERMISSIONS.QUESTIONS_PUBLISH,
		form: { versionId: MISSING_VERSION, effectiveFrom: '2026-07-13T00:00:00.000Z' }
	},
	{
		name: 'approveFutureLink',
		permission: PERMISSIONS.QUESTIONS_REVIEW,
		form: {
			questionVersionId: MISSING_VERSION,
			subtaskVersionId: MISSING_VERSION,
			rationale: 'Synthetic review'
		}
	},
	{
		name: 'retireFutureLink',
		permission: PERMISSIONS.QUESTIONS_REVIEW,
		form: {
			questionVersionId: MISSING_VERSION,
			subtaskVersionId: MISSING_VERSION,
			rationale: 'Synthetic retirement'
		}
	}
] as const;

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
});

afterEach(() => database.close());

describe('question safe-read authorization', () => {
	it.each([
		['anonymous', null, 303],
		['authenticated without permission', identities.insufficient, 403],
		['instructor', identities.instructor, 403],
		['curriculum manager', identities.curriculum, 403],
		['revoked role', identities.revoked, 403]
	] as const)('rejects %s from the list route', async (_label, candidate, expected) => {
		expect(
			await observedStatus(() =>
				listLoad({
					locals: { principal: candidate, database },
					url: new URL('https://local.invalid/questions')
				} as never)
			)
		).toBe(expected);
	});

	it.each([
		['question author', identities.author],
		['administrator', identities.administrator]
	] as const)('allows %s to load the safe empty list', (_label, candidate) => {
		const result = listLoad({
			locals: { principal: candidate, database },
			url: new URL('https://local.invalid/questions')
		} as never);
		expect(result).toMatchObject({ questions: { items: [], totalItems: 0 } });
		expect(JSON.stringify(result)).not.toMatch(/keyLetter|isCorrect|semanticValue|options/);
	});

	it('requires safe-read before resolving a privileged detail context', async () => {
		for (const candidate of [
			null,
			identities.insufficient,
			identities.instructor,
			identities.curriculum
		]) {
			expect(
				await observedStatus(() =>
					detailLoad({
						locals: { principal: candidate, database },
						params: { id: MISSING_VERSION },
						url: new URL(`https://local.invalid/questions/${MISSING_VERSION}`)
					} as never)
				)
			).toBe(candidate === null ? 303 : 403);
		}
	});

	it('treats a suspended question author as unauthenticated', async () => {
		const occurredAt = '2026-07-13T00:00:00.000Z';
		seedBaselineAuthorization(database.db, occurredAt);
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, '060099', 'Synthetic', 'Suspended', 'suspended', ?, ?)`
			)
			.run(MISSING_VERSION, occurredAt, occurredAt);
		database.sqlite
			.prepare(
				`INSERT INTO user_roles (user_id, role_id, granted_at)
				 SELECT ?, id, ? FROM roles WHERE code = ?`
			)
			.run(MISSING_VERSION, occurredAt, BASELINE_ROLES.QUESTION_AUTHOR);
		const suspended = resolveEffectivePrincipal(database.db, MISSING_VERSION, '6'.repeat(64));
		expect(suspended).toBeNull();
		expect(
			await observedStatus(() =>
				listLoad({
					locals: { principal: suspended, database },
					url: new URL('https://local.invalid/questions')
				} as never)
			)
		).toBe(303);
	});
});

describe('question mutation permission separation', () => {
	it('guards list creation independently of safe read', async () => {
		const action = listActions.createQuestion;
		if (!action) throw new Error('createQuestion action is missing.');
		const viewOnly = principal([], [PERMISSIONS.QUESTIONS_VIEW]);
		expect(
			await observedStatus(() =>
				action({
					locals: { principal: viewOnly, database },
					request: request('createQuestion')
				} as never)
			)
		).toBe(403);
		expect(
			await observedStatus(() =>
				action({
					locals: { principal: identities.author, database },
					request: request('createQuestion')
				} as never)
			)
		).toBe(400);
	});

	it.each(detailActionCases)(
		'enforces $permission on $name direct POSTs',
		async ({ name, permission, form }) => {
			const action = detailActions[name];
			if (!action) throw new Error(`${name} action is missing.`);
			const wrongPermission =
				permission === PERMISSIONS.QUESTIONS_CREATE
					? PERMISSIONS.QUESTIONS_REVIEW
					: PERMISSIONS.QUESTIONS_CREATE;
			for (const candidate of [
				null,
				principal([], [PERMISSIONS.QUESTIONS_VIEW]),
				principal([], [PERMISSIONS.QUESTIONS_VIEW, wrongPermission])
			]) {
				expect(
					await observedStatus(() =>
						action({
							locals: { principal: candidate, database },
							request: request(name, form)
						} as never)
					)
				).toBe(candidate === null ? 401 : 403);
			}

			const authorized = principal([], [PERMISSIONS.QUESTIONS_VIEW, permission]);
			const status = await observedStatus(() =>
				action({
					locals: { principal: authorized, database },
					request: request(name, form)
				} as never)
			);
			expect([400, 404]).toContain(status);
		}
	);

	it('requires both publish and records-retire permissions for retirement', async () => {
		const action = detailActions.retireVersion;
		if (!action) throw new Error('retireVersion action is missing.');
		const form = {
			versionId: MISSING_VERSION,
			reason: 'Synthetic retirement',
			expectedDependencyRevision: 'synthetic'
		};
		for (const permissions of [
			[PERMISSIONS.QUESTIONS_VIEW, PERMISSIONS.QUESTIONS_PUBLISH],
			[PERMISSIONS.QUESTIONS_VIEW, PERMISSIONS.RECORDS_RETIRE]
		]) {
			expect(
				await observedStatus(() =>
					action({
						locals: { principal: principal([], permissions), database },
						request: request('retireVersion', form)
					} as never)
				)
			).toBe(403);
		}
		expect(
			await observedStatus(() =>
				action({
					locals: {
						principal: principal(
							[],
							[
								PERMISSIONS.QUESTIONS_VIEW,
								PERMISSIONS.QUESTIONS_PUBLISH,
								PERMISSIONS.RECORDS_RETIRE
							]
						),
						database
					},
					request: request('retireVersion', form)
				} as never)
			)
		).toBe(404);
	});
});
