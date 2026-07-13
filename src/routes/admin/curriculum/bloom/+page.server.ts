import { fail } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import {
	createCurriculumService,
	type CurriculumMutationResult,
	type DependencyWarningResult
} from '$lib/server/curriculum/index.js';
import type { Actions, PageServerLoad } from './$types';

function actionFailure(
	operation: string,
	result: Exclude<CurriculumMutationResult<unknown>, { ok: true }>,
	fieldPrefix: string | null = null
) {
	const status =
		result.error === 'not_found'
			? 404
			: ['conflict', 'dependency_changed'].includes(result.error)
				? 409
				: result.error === 'unavailable'
					? 503
					: 400;
	return fail(status, { operation, error: result.error, fields: result.fields ?? [], fieldPrefix });
}

export const load: PageServerLoad = ({ locals }) => {
	requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'browser');
	const service = createCurriculumService(locals.database);
	const levels = service.listBloomVocabulary();
	const dependencyWarnings: DependencyWarningResult[] = [];
	for (const level of levels) {
		dependencyWarnings.push(
			service.dependencyPreview(
				'bloom_level',
				level.id,
				level.status === 'draft' ? 'delete' : 'retire'
			)
		);
		for (const verb of level.verbs) {
			dependencyWarnings.push(
				service.dependencyPreview(
					'bloom_verb',
					verb.id,
					verb.status === 'draft' ? 'delete' : 'retire'
				)
			);
		}
	}
	return { levels, dependencyWarnings };
};

export const actions: Actions = {
	createLevel: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).upsertBloomLevel(principal.userId, {
			ordinal: data.get('ordinal'),
			name: data.get('name')
		});
		return result.ok
			? { operation: 'createLevel', success: true, focusId: `level-${result.value.id}` }
			: actionFailure('createLevel', result, 'createLevel');
	},
	updateLevel: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).upsertBloomLevel(principal.userId, {
			id: String(data.get('id') ?? ''),
			ordinal: data.get('ordinal'),
			name: data.get('name')
		});
		return result.ok
			? { operation: 'updateLevel', success: true, focusId: `level-${result.value.id}` }
			: actionFailure('updateLevel', result, `updateLevel-${String(data.get('id') ?? '')}`);
	},
	publishLevel: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).publishBloomLevel(
			principal.userId,
			String(data.get('id') ?? '')
		);
		return result.ok
			? { operation: 'publishLevel', success: true, focusId: `level-${result.value.id}` }
			: actionFailure('publishLevel', result);
	},
	retireLevel: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const result = createCurriculumService(locals.database).retireBloomLevel(principal.userId, {
			id,
			reason: data.get('reason'),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'retireLevel', success: true, focusId: `level-${id}` }
			: actionFailure('retireLevel', result, `retireLevel-${id}`);
	},
	deleteLevel: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).deleteBloomLevel(principal.userId, {
			id: String(data.get('id') ?? ''),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'deleteLevel', success: true, focusId: 'bloom-heading' }
			: actionFailure('deleteLevel', result);
	},
	createVerb: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).upsertBloomVerb(principal.userId, {
			bloomLevelId: data.get('bloomLevelId'),
			verb: data.get('verb')
		});
		return result.ok
			? { operation: 'createVerb', success: true, focusId: `verbs-${result.value.bloomLevelId}` }
			: actionFailure('createVerb', result, `createVerb-${String(data.get('bloomLevelId') ?? '')}`);
	},
	updateVerb: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).upsertBloomVerb(principal.userId, {
			id: String(data.get('id') ?? ''),
			bloomLevelId: data.get('bloomLevelId'),
			verb: data.get('verb')
		});
		return result.ok
			? { operation: 'updateVerb', success: true, focusId: `verbs-${result.value.bloomLevelId}` }
			: actionFailure('updateVerb', result, `updateVerb-${String(data.get('id') ?? '')}`);
	},
	publishVerb: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).publishBloomVerb(
			principal.userId,
			String(data.get('id') ?? '')
		);
		return result.ok
			? { operation: 'publishVerb', success: true, focusId: `verbs-${result.value.bloomLevelId}` }
			: actionFailure('publishVerb', result);
	},
	retireVerb: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const result = createCurriculumService(locals.database).retireBloomVerb(principal.userId, {
			id,
			reason: data.get('reason'),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'retireVerb', success: true, focusId: 'bloom-heading' }
			: actionFailure('retireVerb', result, `retireVerb-${id}`);
	},
	deleteVerb: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).deleteBloomVerb(principal.userId, {
			id: String(data.get('id') ?? ''),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'deleteVerb', success: true, focusId: 'bloom-heading' }
			: actionFailure('deleteVerb', result);
	}
};
