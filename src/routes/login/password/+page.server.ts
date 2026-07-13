import { recordAuditEvent } from '$lib/server/audit';
import { PasswordActionService, SessionService } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const password = formData.get('password');
		const confirmation = formData.get('confirmation');
		if (
			typeof token !== 'string' ||
			typeof password !== 'string' ||
			typeof confirmation !== 'string' ||
			password !== confirmation
		) {
			return fail(400, { success: false, error: 'The password could not be set.' });
		}
		const sessions = new SessionService(locals.database, recordAuditEvent);
		const result = new PasswordActionService(locals.database, sessions, recordAuditEvent).consume(
			token,
			password
		);
		if (!result.ok) return fail(400, { success: false, error: 'The password could not be set.' });
		return { success: true, error: null };
	}
};
