import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionService } from '../../src/lib/server/auth';
import { BASELINE_ROLES, SESSION_COOKIE_NAME } from '../../src/lib/server/authorization';
import { recordAuditEvent } from '../../src/lib/server/audit';
import {
	closeApplicationDatabase,
	getApplicationDatabase
} from '../../src/lib/server/config/application';
import { handle } from '../../src/hooks.server';

afterEach(() => {
	closeApplicationDatabase();
	vi.unstubAllEnvs();
});

function cookies(rawToken?: string) {
	const deleted: string[] = [];
	return {
		deleted,
		api: {
			get: (name: string) => (name === SESSION_COOKIE_NAME ? rawToken : undefined),
			delete: (name: string) => deleted.push(name)
		}
	};
}

describe('server authentication hook', () => {
	it('keeps health database-free and applies security headers', async () => {
		const jar = cookies();
		const event = {
			url: new URL('https://local.invalid/health'),
			locals: {},
			cookies: jar.api
		};
		const response = await handle({
			event: event as never,
			resolve: async () => new Response('ok')
		});

		expect(response.headers.get('x-frame-options')).toBe('DENY');
		expect(response.headers.get('content-security-policy')).toContain("form-action 'self'");
		expect('database' in event.locals).toBe(false);
	});

	it('resolves an active session into current effective permissions', async () => {
		vi.stubEnv('APP_ENV', 'test');
		vi.stubEnv('DATABASE_PATH', ':memory:');
		const database = getApplicationDatabase();
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES ('hook-user', '0008', 'Hook', 'User', 'active', ?, ?)`
			)
			.run('2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z');
		database.sqlite
			.prepare(
				`INSERT INTO user_roles (user_id, role_id, granted_at)
				 SELECT 'hook-user', id, ? FROM roles WHERE code = ?`
			)
			.run('2026-07-12T00:00:00.000Z', BASELINE_ROLES.INSTRUCTOR);
		const created = new SessionService(database, recordAuditEvent).create('hook-user');
		const jar = cookies(created.rawToken);
		const event = {
			url: new URL('https://local.invalid/'),
			locals: {},
			cookies: jar.api
		};

		await handle({ event: event as never, resolve: async () => new Response('ok') });

		expect((event.locals as App.Locals).principal?.employeeNumber).toBe('0008');
		expect((event.locals as App.Locals).principal?.roles).toEqual(['instructor']);
		expect(jar.deleted).toEqual([]);
	});
});
