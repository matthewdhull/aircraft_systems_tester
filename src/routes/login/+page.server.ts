import { randomBytes } from 'node:crypto';

import { recordAuditEvent } from '$lib/server/audit';
import { AuthenticationService, hashPassword, SessionService } from '$lib/server/auth';
import {
	SESSION_COOKIE_NAME,
	safeLocalRedirect,
	setSessionCookie
} from '$lib/server/authorization';
import { createLoginRateLimiter } from '$lib/server/security';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

const loginRateLimiter = createLoginRateLimiter();
const dummyPasswordHash = hashPassword(`Synthetic-${randomBytes(24).toString('base64url')}`);

function productionCookies(): boolean {
	return (process.env.APP_ENV ?? process.env.NODE_ENV) === 'production';
}

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.principal) redirect(303, safeLocalRedirect(url.searchParams.get('next')));
	return { next: safeLocalRedirect(url.searchParams.get('next')) };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const rawEmployeeNumber = formData.get('employeeNumber');
		const rawPassword = formData.get('password');
		const employeeNumber = typeof rawEmployeeNumber === 'string' ? rawEmployeeNumber.trim() : '';
		const password = typeof rawPassword === 'string' ? rawPassword : '';
		const next = safeLocalRedirect(formData.get('next'));
		const sessions = new SessionService(locals.database, recordAuditEvent);
		const authentication = new AuthenticationService(
			locals.database,
			sessions,
			recordAuditEvent,
			loginRateLimiter,
			dummyPasswordHash
		);
		const existingSessionToken = cookies.get(SESSION_COOKIE_NAME);
		const result = authentication.login(employeeNumber, password, {
			networkKey: getClientAddress(),
			...(existingSessionToken ? { existingSessionToken } : {})
		});
		if (!result.ok) {
			return fail(result.error === 'rate_limited' ? 429 : 400, {
				employeeNumber,
				next,
				error: 'Unable to sign in with those credentials.',
				retryAfterSeconds: result.error === 'rate_limited' ? result.retryAfterSeconds : null
			});
		}
		setSessionCookie(
			cookies,
			result.value.session.rawToken,
			result.value.session.expiresAt,
			productionCookies()
		);
		redirect(303, next);
	}
};
