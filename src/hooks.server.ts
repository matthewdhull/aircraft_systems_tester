import { SessionService } from '$lib/server/auth';
import {
	clearSessionCookie,
	resolveEffectivePrincipal,
	SESSION_COOKIE_NAME
} from '$lib/server/authorization';
import { recordAuditEvent } from '$lib/server/audit';
import { getApplicationDatabase } from '$lib/server/config/application';
import { loadServerConfig } from '$lib/server/config';
import type { Handle } from '@sveltejs/kit';

const DATABASE_FREE_ROUTES = new Set(['/health', '/ready']);

function applySecurityHeaders(response: Response): Response {
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'no-referrer');
	response.headers.set(
		'permissions-policy',
		'camera=(), geolocation=(), microphone=(), payment=(), usb=()'
	);
	response.headers.set(
		'content-security-policy',
		"default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'"
	);
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.principal = null;
	if (!DATABASE_FREE_ROUTES.has(event.url.pathname)) {
		const config = loadServerConfig();
		const database = getApplicationDatabase();
		event.locals.database = database;
		const rawToken = event.cookies.get(SESSION_COOKIE_NAME);
		if (rawToken) {
			const session = new SessionService(database, recordAuditEvent).resolve(rawToken);
			if (session.ok) {
				event.locals.principal = resolveEffectivePrincipal(
					database.db,
					session.value.userId,
					session.value.sessionIdHash
				);
			}
			if (!event.locals.principal) {
				clearSessionCookie(event.cookies, config.appEnvironment === 'production');
			}
		}
	}

	return applySecurityHeaders(await resolve(event));
};
