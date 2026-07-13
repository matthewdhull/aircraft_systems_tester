import { randomBytes, randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import { SessionService } from '../../src/lib/server/auth/index.js';
import { BASELINE_ROLES, SESSION_COOKIE_NAME } from '../../src/lib/server/authorization/index.js';
import {
	closeApplicationDatabase,
	getApplicationDatabase
} from '../../src/lib/server/config/application.js';
import { actions, load } from '../../src/routes/admin/instructors/+page.server.js';
import { handle } from '../../src/hooks.server.js';

type MatrixIdentity =
	| 'anonymous'
	| 'insufficient'
	| 'instructor'
	| 'administrator'
	| 'multi-role'
	| 'revoked-grant'
	| 'inactive-session';

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

function invalidCreateRequest(): Request {
	const body = new FormData();
	body.set('employeeNumber', '');
	body.set('firstName', '');
	body.set('lastName', '');
	return new Request('https://local.invalid/admin/instructors?/create', {
		method: 'POST',
		body
	});
}

async function localsFromRealHook(identity: MatrixIdentity): Promise<App.Locals> {
	const database = getApplicationDatabase();
	let rawToken: string | undefined;
	if (identity !== 'anonymous') {
		const userId = randomUUID();
		const now = new Date().toISOString();
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, ?, 'Synthetic', 'Principal', 'active', ?, ?)`
			)
			.run(userId, randomBytes(6).toString('hex'), now, now);
		const roles =
			identity === 'administrator' || identity === 'revoked-grant'
				? [BASELINE_ROLES.ADMINISTRATOR]
				: identity === 'multi-role'
					? [BASELINE_ROLES.ADMINISTRATOR, BASELINE_ROLES.INSTRUCTOR]
					: identity === 'instructor'
						? [BASELINE_ROLES.INSTRUCTOR]
						: [BASELINE_ROLES.REPORT_VIEWER];
		for (const role of roles) {
			database.sqlite
				.prepare(
					`INSERT INTO user_roles (user_id, role_id, granted_at)
					 SELECT ?, id, ? FROM roles WHERE code = ?`
				)
				.run(userId, now, role);
		}
		rawToken = new SessionService(database, recordAuditEvent).create(userId).rawToken;
		if (identity === 'revoked-grant') {
			database.sqlite
				.prepare('UPDATE user_roles SET revoked_at = ? WHERE user_id = ?')
				.run(now, userId);
		}
		if (identity === 'inactive-session') {
			database.sqlite.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(userId);
		}
	}

	const deleted: string[] = [];
	const event = {
		url: new URL('https://local.invalid/admin/instructors'),
		locals: {},
		cookies: {
			get: (name: string) => (name === SESSION_COOKIE_NAME ? rawToken : undefined),
			delete: (name: string) => deleted.push(name)
		}
	};
	await handle({ event: event as never, resolve: async () => new Response('ok') });
	if (identity === 'inactive-session') expect(deleted).toEqual([SESSION_COOKIE_NAME]);
	return event.locals as App.Locals;
}

beforeEach(() => {
	vi.stubEnv('APP_ENV', 'test');
	vi.stubEnv('DATABASE_PATH', ':memory:');
});

afterEach(() => {
	closeApplicationDatabase();
	vi.unstubAllEnvs();
});

describe('hook-to-route authorization integration', () => {
	it.each([
		['anonymous', 303, 401],
		['insufficient', 403, 403],
		['instructor', 403, 403],
		['administrator', undefined, 400],
		['multi-role', undefined, 400],
		['revoked-grant', 403, 403],
		['inactive-session', 303, 401]
	] as const)(
		'resolves %s via a real cookie/session/hook and enforces load/action',
		async (identity, loadStatus, actionStatus) => {
			const locals = await localsFromRealHook(identity);
			if (loadStatus === undefined) {
				expect(load({ locals } as never)).toHaveProperty('instructors');
			} else {
				expect(await thrownStatus(() => load({ locals } as never))).toBe(loadStatus);
			}
			const action = actions.create;
			if (!action) throw new Error('Create action is absent from the route matrix.');
			const resultStatus = await thrownStatus(async () => {
				const result = await action({
					locals,
					request: invalidCreateRequest()
				} as never);
				if (typeof result === 'object' && result !== null && 'status' in result) {
					throw Object.assign(new Error('Action failure result.'), { status: result.status });
				}
			});
			expect(resultStatus).toBe(actionStatus);
		}
	);
});
