import { error, fail } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import { createInstructorAdministrationService } from '$lib/server/instructors/composition.js';
import type { MutationResult } from '$lib/server/instructors/types.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	requirePermission(locals, PERMISSIONS.USERS_VIEW, 'browser');
	const service = createInstructorAdministrationService(locals.database);
	const instructor = service.get(params.id);
	if (!instructor) error(404, 'User not found.');
	return { instructor, roles: service.availableRoles() };
};

function actionFailure(operation: string, result: Exclude<MutationResult<unknown>, { ok: true }>) {
	const status =
		result.error === 'not_found'
			? 404
			: result.error === 'conflict'
				? 409
				: result.error === 'unavailable'
					? 503
					: 400;
	return fail(status, { operation, error: result.error, fields: result.fields ?? [] });
}

export const actions: Actions = {
	edit: async ({ locals, params, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_EDIT, 'endpoint');
		const data = await request.formData();
		const result = createInstructorAdministrationService(locals.database).edit(
			principal.userId,
			params.id,
			{ firstName: data.get('firstName'), lastName: data.get('lastName') }
		);
		return result.ok ? { operation: 'edit', success: true } : actionFailure('edit', result);
	},
	correctEmployeeNumber: async ({ locals, params, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_EDIT, 'endpoint');
		const data = await request.formData();
		const result = createInstructorAdministrationService(locals.database).correctEmployeeNumber(
			principal.userId,
			params.id,
			{ employeeNumber: data.get('employeeNumber'), reason: data.get('reason') }
		);
		return result.ok
			? { operation: 'correctEmployeeNumber', success: true }
			: actionFailure('correctEmployeeNumber', result);
	},
	changeStatus: async ({ locals, params, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_LIFECYCLE, 'endpoint');
		const data = await request.formData();
		const result = createInstructorAdministrationService(locals.database).changeStatus(
			principal.userId,
			params.id,
			{ status: data.get('status') }
		);
		return result.ok
			? { operation: 'changeStatus', success: true }
			: actionFailure('changeStatus', result);
	},
	grantRole: async ({ locals, params, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_ROLES_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createInstructorAdministrationService(locals.database).grantRole(
			principal.userId,
			params.id,
			{ roleId: data.get('roleId') }
		);
		return result.ok
			? { operation: 'grantRole', success: true }
			: actionFailure('grantRole', result);
	},
	revokeRole: async ({ locals, params, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_ROLES_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createInstructorAdministrationService(locals.database).revokeRole(
			principal.userId,
			params.id,
			{ roleId: data.get('roleId') }
		);
		return result.ok
			? { operation: 'revokeRole', success: true }
			: actionFailure('revokeRole', result);
	}
};
