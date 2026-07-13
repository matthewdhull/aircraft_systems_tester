import { fail } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import { createInstructorAdministrationService } from '$lib/server/instructors/composition.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requirePermission(locals, PERMISSIONS.USERS_VIEW, 'browser');
	const service = createInstructorAdministrationService(locals.database);
	return { instructors: service.list() };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.USERS_CREATE, 'endpoint');
		const data = await request.formData();
		const input = {
			employeeNumber: data.get('employeeNumber'),
			firstName: data.get('firstName'),
			lastName: data.get('lastName')
		};
		const result = createInstructorAdministrationService(locals.database).create(
			principal.userId,
			input
		);
		if (!result.ok) {
			return fail(result.error === 'conflict' ? 409 : result.error === 'unavailable' ? 503 : 400, {
				operation: 'create',
				error: result.error,
				fields: result.fields ?? [],
				values: input
			});
		}
		return { operation: 'create', success: true, userId: result.value.id };
	}
};
