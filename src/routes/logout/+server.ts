import { recordAuditEvent } from '$lib/server/audit';
import { SessionService } from '$lib/server/auth';
import {
	clearSessionCookie,
	requireAuthenticated,
	SESSION_COOKIE_NAME
} from '$lib/server/authorization';
import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals, cookies }) => {
	requireAuthenticated(locals);
	const rawToken = cookies.get(SESSION_COOKIE_NAME);
	if (rawToken) new SessionService(locals.database, recordAuditEvent).revoke(rawToken, 'logout');
	const production = (process.env.APP_ENV ?? process.env.NODE_ENV) === 'production';
	clearSessionCookie(cookies, production);
	redirect(303, '/login');
};
