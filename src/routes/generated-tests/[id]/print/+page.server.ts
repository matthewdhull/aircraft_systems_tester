import { error } from '@sveltejs/kit';
import { PERMISSIONS, requirePermission } from '$lib/server/authorization';
import { auditGeneratedExamView, getGeneratedExam } from '$lib/server/generation/service';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, params, url }) => {
	const principal = requirePermission(locals, PERMISSIONS.EXAMS_PREVIEW, 'browser');
	const showKeys = url.searchParams.get('answerKey') === '1';
	if (showKeys) requirePermission(locals, PERMISSIONS.ANSWER_KEYS_VIEW, 'browser');
	const exam = getGeneratedExam(locals.database, principal, params.id, showKeys);
	if (!exam) error(404, 'Generated test not found.');
	auditGeneratedExamView({
		database: locals.database,
		principal,
		examId: params.id,
		questionCount: exam.questionCount,
		keyView: showKeys
	});
	return { exam, showKeys };
};
