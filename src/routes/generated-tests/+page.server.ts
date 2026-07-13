import { fail } from '@sveltejs/kit';
import { PERMISSIONS, requirePermission } from '$lib/server/authorization';
import { loadServerConfig } from '$lib/server/config';
import { GenerationError } from '$lib/server/generation/snapshot';
import { createGenerationService, listGeneratedExams } from '$lib/server/generation/service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const principal = requirePermission(locals, PERMISSIONS.EXAMS_PUBLISH, 'browser');
	const all = principal.permissions.has(PERMISSIONS.RECORDS_ALL_MANAGE) ? 1 : 0;
	return {
		exams: listGeneratedExams(locals.database, principal),
		templates: locals.database.sqlite
			.prepare(
				`SELECT id, name, version FROM test_template_versions WHERE lifecycle='published' AND effective_from<=? AND (effective_to IS NULL OR ?<effective_to) ORDER BY name, version`
			)
			.all(new Date().toISOString(), new Date().toISOString()) as {
			id: string;
			name: string;
			version: number;
		}[],
		rosters: locals.database.sqlite
			.prepare(
				`SELECT id, name FROM class_rosters WHERE retired_at IS NULL AND (?=1 OR instructor_user_id=?) ORDER BY starts_on DESC, name`
			)
			.all(all, principal.userId) as { id: string; name: string }[]
	};
};

export const actions: Actions = {
	generate: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.EXAMS_PUBLISH);
		const data = await request.formData();
		try {
			const result = createGenerationService({
				database: locals.database,
				principal,
				config: loadServerConfig(process.env)
			}).generate({
				templateVersionId: String(data.get('templateVersionId') ?? ''),
				classRosterId: String(data.get('classRosterId') ?? '')
			});
			return { success: true, examId: result.examId, rawAccessCode: result.rawAccessCode };
		} catch (cause) {
			if (cause instanceof GenerationError)
				return fail(
					cause.code === 'PERMISSION_DENIED' || cause.code === 'ROSTER_SCOPE_DENIED' ? 403 : 400,
					{ success: false, error: cause.code, shortages: cause.shortages }
				);
			return fail(503, { success: false, error: 'SNAPSHOT_WRITE_FAILED' });
		}
	}
};
