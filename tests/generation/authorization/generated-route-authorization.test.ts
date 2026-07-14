import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	BASELINE_ROLES,
	PERMISSIONS,
	type AuthenticatedPrincipal
} from '$lib/server/authorization';
import { openDatabase, type DatabaseHandle } from '$lib/server/db';
import { load as detailLoad } from '../../../src/routes/generated-tests/[id]/+page.server.js';
import { load as previewLoad } from '../../../src/routes/generated-tests/[id]/preview/+page.server.js';
import { load as printLoad } from '../../../src/routes/generated-tests/[id]/print/+page.server.js';

const MISSING_EXAM = '70000000-0000-4000-8000-000000000099';
let database: DatabaseHandle;

function principal(permissions: readonly string[]): AuthenticatedPrincipal {
	return {
		userId: '70000000-0000-4000-8000-000000000001',
		employeeNumber: '070001',
		displayName: 'Synthetic Phase 7 Principal',
		roles: [BASELINE_ROLES.INSTRUCTOR],
		permissions: new Set(permissions as never),
		sessionIdHash: '7'.repeat(64)
	};
}

async function status(work: () => unknown): Promise<number | undefined> {
	try {
		const result = await work();
		return typeof result === 'object' && result && 'status' in result
			? Number(result.status)
			: undefined;
	} catch (error) {
		return typeof error === 'object' && error && 'status' in error
			? Number(error.status)
			: undefined;
	}
}

function event(candidate: AuthenticatedPrincipal | null, path: string, answerKey = false) {
	return {
		locals: { principal: candidate, database },
		params: { id: MISSING_EXAM },
		url: new URL(`https://local.invalid${path}${answerKey ? '?answerKey=1' : ''}`)
	} as never;
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
});

afterEach(() => database.close());

describe('Phase 7 generated-test route authorization', () => {
	it('redirects anonymous preview requests to login', async () => {
		expect(await status(() => previewLoad(event(null, '/generated-tests/x/preview')))).toBe(303);
	});

	it.each([
		['detail', detailLoad, '/generated-tests/x'],
		['preview', previewLoad, '/generated-tests/x/preview'],
		['ordinary print', printLoad, '/generated-tests/x/print']
	] as const)('requires exams.preview for %s', async (_name, load, path) => {
		expect(await status(() => load(event(principal([]), path)))).toBe(403);
		expect(await status(() => load(event(principal([PERMISSIONS.EXAMS_PREVIEW]), path)))).toBe(404);
	});

	it('requires answer_keys.view independently for answer-key print', async () => {
		expect(
			await status(() =>
				printLoad(event(principal([PERMISSIONS.EXAMS_PREVIEW]), '/generated-tests/x/print', true))
			)
		).toBe(403);
		expect(
			await status(() =>
				printLoad(
					event(
						principal([PERMISSIONS.EXAMS_PREVIEW, PERMISSIONS.ANSWER_KEYS_VIEW]),
						'/generated-tests/x/print',
						true
					)
				)
			)
		).toBe(404);
	});
});
