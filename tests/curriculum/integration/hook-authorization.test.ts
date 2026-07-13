import { randomBytes, randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { recordAuditEvent } from '../../../src/lib/server/audit/index.js';
import { SessionService } from '../../../src/lib/server/auth/index.js';
import {
	BASELINE_ROLES,
	SESSION_COOKIE_NAME
} from '../../../src/lib/server/authorization/index.js';
import {
	closeApplicationDatabase,
	getApplicationDatabase
} from '../../../src/lib/server/config/application.js';
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
import { handle } from '../../../src/hooks.server.js';

type Identity =
	| 'anonymous'
	| 'insufficient'
	| 'instructor'
	| 'curriculum-manager'
	| 'administrator'
	| 'revoked-grant'
	| 'suspended-user';

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

async function localsFromRealHook(identity: Identity): Promise<App.Locals> {
	const database = getApplicationDatabase();
	let rawToken: string | undefined;
	if (identity !== 'anonymous') {
		const userId = randomUUID();
		const now = new Date().toISOString();
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, ?, 'Synthetic', 'Curriculum Principal', 'active', ?, ?)`
			)
			.run(userId, randomBytes(6).toString('hex'), now, now);
		const role =
			identity === 'administrator'
				? BASELINE_ROLES.ADMINISTRATOR
				: identity === 'curriculum-manager' || identity === 'revoked-grant'
					? BASELINE_ROLES.CURRICULUM_MANAGER
					: identity === 'instructor'
						? BASELINE_ROLES.INSTRUCTOR
						: BASELINE_ROLES.REPORT_VIEWER;
		database.sqlite
			.prepare(
				`INSERT INTO user_roles (user_id, role_id, granted_at)
				 SELECT ?, id, ? FROM roles WHERE code = ?`
			)
			.run(userId, now, role);
		rawToken = new SessionService(database, recordAuditEvent).create(userId).rawToken;
		if (identity === 'revoked-grant') {
			database.sqlite
				.prepare('UPDATE user_roles SET revoked_at = ? WHERE user_id = ?')
				.run(now, userId);
		}
		if (identity === 'suspended-user') {
			database.sqlite.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(userId);
		}
	}

	const event = {
		url: new URL('https://local.invalid/admin/curriculum'),
		locals: {},
		cookies: {
			get: (name: string) => (name === SESSION_COOKIE_NAME ? rawToken : undefined),
			delete: () => undefined
		}
	};
	await handle({ event: event as never, resolve: async () => new Response('ok') });
	return event.locals as App.Locals;
}

function emptyRequest(path: string, action: string): Request {
	return new Request(`https://local.invalid${path}?/${action}`, {
		method: 'POST',
		body: new FormData()
	});
}

beforeEach(() => {
	vi.stubEnv('APP_ENV', 'test');
	vi.stubEnv('DATABASE_PATH', ':memory:');
});

afterEach(() => {
	closeApplicationDatabase();
	vi.unstubAllEnvs();
});

describe('real cookie/session/hook Phase 5 authorization', () => {
	it.each([
		['anonymous', 303, 401],
		['insufficient', 403, 403],
		['instructor', 403, 403],
		['curriculum-manager', undefined, 400],
		['administrator', undefined, 400],
		['revoked-grant', 403, 403],
		['suspended-user', 303, 401]
	] as const)(
		'enforces %s across all three route families',
		async (identity, loadStatus, actionStatus) => {
			const locals = await localsFromRealHook(identity);
			for (const load of [hierarchyLoad, bloomLoad, mappingLoad]) {
				if (loadStatus === undefined) {
					expect(await load({ locals } as never)).toBeTruthy();
				} else {
					expect(await thrownStatus(() => load({ locals } as never))).toBe(loadStatus);
				}
			}

			for (const [path, name, action] of [
				['/admin/curriculum', 'createNode', hierarchyActions.createNode],
				['/admin/curriculum/bloom', 'createLevel', bloomActions.createLevel],
				['/admin/curriculum/mappings', 'proposeMapping', mappingActions.proposeMapping]
			] as const) {
				if (!action) throw new Error(`Missing ${name} action.`);
				const observed = await thrownStatus(async () => {
					const result = await action({ locals, request: emptyRequest(path, name) } as never);
					if (typeof result === 'object' && result !== null && 'status' in result) {
						throw Object.assign(new Error('Action failure result.'), { status: result.status });
					}
				});
				expect(observed).toBe(actionStatus);
			}
		}
	);
});
