import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE_NAME = 'ast_session';
export const SESSION_COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;

function baseOptions(production: boolean) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: production
	};
}

export function setSessionCookie(
	cookies: Cookies,
	rawToken: string,
	expiresAt: Date,
	production: boolean
): void {
	const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1_000));
	cookies.set(SESSION_COOKIE_NAME, rawToken, {
		...baseOptions(production),
		maxAge: Math.min(remainingSeconds, SESSION_COOKIE_MAX_AGE_SECONDS)
	});
}

export function clearSessionCookie(cookies: Cookies, production: boolean): void {
	cookies.delete(SESSION_COOKIE_NAME, baseOptions(production));
}
