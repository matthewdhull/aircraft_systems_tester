import { error } from '@sveltejs/kit';
import { PERMISSIONS, requirePermission } from '$lib/server/authorization';
import { getGeneratedExam } from '$lib/server/generation/service';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, params }) => {
	const principal = requirePermission(locals, PERMISSIONS.EXAMS_PREVIEW, 'browser');
	const exam = getGeneratedExam(locals.database, principal, params.id);
	if (!exam) error(404, 'Generated test not found.');
	return { exam, canViewKeys: principal.permissions.has(PERMISSIONS.ANSWER_KEYS_VIEW) };
};
