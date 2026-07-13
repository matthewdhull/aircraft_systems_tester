import { PERMISSIONS } from '$lib/server/authorization';
import type { NavigationItemId } from '$lib/navigation/navigation';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const principal = locals.principal;
	const visible = new Set<NavigationItemId>(['exam-access']);
	if (!principal) {
		visible.add('staff-login');
	} else {
		visible.add('dashboard');
		if (principal.permissions.has(PERMISSIONS.CURRICULUM_MANAGE)) visible.add('curriculum');
		if (principal.permissions.has(PERMISSIONS.QUESTIONS_CREATE)) visible.add('questions');
		if (principal.permissions.has(PERMISSIONS.TEMPLATES_MANAGE)) visible.add('test-models');
		if (principal.permissions.has(PERMISSIONS.EXAMS_PUBLISH)) visible.add('generated-tests');
		if (
			principal.permissions.has(PERMISSIONS.REPORTS_ASSIGNED_VIEW) ||
			principal.permissions.has(PERMISSIONS.REPORTS_ORGANIZATION_VIEW)
		) {
			visible.add('reports');
		}
		if (principal.permissions.has(PERMISSIONS.USERS_VIEW)) visible.add('instructors');
	}

	return {
		principal: principal ? { displayName: principal.displayName } : null,
		visibleNavigationItemIds: [...visible]
	};
};
