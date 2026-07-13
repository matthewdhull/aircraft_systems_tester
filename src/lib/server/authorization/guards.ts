import { error, redirect } from '@sveltejs/kit';

import { PERMISSIONS, type PermissionCode } from './policy.js';
import type { AuthenticatedPrincipal } from './types.js';

export type GuardMode = 'browser' | 'endpoint';

interface PrincipalLocals {
	principal: AuthenticatedPrincipal | null;
}

export function requireAuthenticated(
	locals: PrincipalLocals,
	mode: GuardMode = 'endpoint'
): AuthenticatedPrincipal {
	if (locals.principal) return locals.principal;
	if (mode === 'browser') redirect(303, '/login');
	return error(401, 'Authentication required.');
}

export function requirePermission(
	locals: PrincipalLocals,
	permission: PermissionCode,
	mode: GuardMode = 'endpoint'
): AuthenticatedPrincipal {
	const principal = requireAuthenticated(locals, mode);
	if (principal.permissions.has(permission)) return principal;
	return error(403, 'Access denied.');
}

export function requireInstructorCapability(
	locals: PrincipalLocals,
	mode: GuardMode = 'endpoint'
): AuthenticatedPrincipal {
	return requirePermission(locals, PERMISSIONS.ROSTERS_ASSIGNED_MANAGE, mode);
}

export function requireAdministratorCapability(
	locals: PrincipalLocals,
	mode: GuardMode = 'endpoint'
): AuthenticatedPrincipal {
	return requirePermission(locals, PERMISSIONS.USERS_VIEW, mode);
}

export function safeLocalRedirect(target: FormDataEntryValue | string | null | undefined): string {
	if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) return '/';
	try {
		const parsed = new URL(target, 'https://local.invalid');
		return parsed.origin === 'https://local.invalid' ? `${parsed.pathname}${parsed.search}` : '/';
	} catch {
		return '/';
	}
}
