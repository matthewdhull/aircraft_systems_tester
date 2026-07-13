import { fail } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import { createCurriculumService } from '$lib/server/curriculum/index.js';
import {
	createCurriculumMappingService,
	type CurriculumNodeType,
	type LegacyEntityType,
	type MappingMutationResult
} from '$lib/server/curriculum-mapping/index.js';
import type { Actions, PageServerLoad } from './$types';

function actionFailure(
	operation: string,
	result: Exclude<MappingMutationResult<unknown>, { ok: true }>,
	fieldPrefix: string | null = null
) {
	const status =
		result.error === 'not_found'
			? 404
			: ['conflict', 'mapping_conflict'].includes(result.error)
				? 409
				: result.error === 'unavailable'
					? 503
					: 400;
	return fail(status, { operation, error: result.error, fields: result.fields ?? [], fieldPrefix });
}

function splitSelection(value: FormDataEntryValue | null): [string, string] {
	const text = String(value ?? '');
	const separator = text.indexOf(':');
	return separator < 0 ? ['', ''] : [text.slice(0, separator), text.slice(separator + 1)];
}

export const load: PageServerLoad = ({ locals }) => {
	requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'browser');
	const mappingService = createCurriculumMappingService(locals.database);
	return {
		legacyHierarchy: mappingService.listLegacyHierarchy(),
		mappings: mappingService.listMappings(),
		reconciliation: mappingService.reconcile(),
		hierarchy: createCurriculumService(locals.database).hierarchy()
	};
};

export const actions: Actions = {
	proposeMapping: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const [legacyEntityType, legacyEntityId] = splitSelection(data.get('source'));
		const [targetEntityType, targetEntityId] = splitSelection(data.get('target'));
		const result = createCurriculumMappingService(locals.database).propose(principal.userId, {
			legacyEntityType: legacyEntityType as LegacyEntityType,
			legacyEntityId,
			targetEntityType: targetEntityType as CurriculumNodeType,
			targetEntityId,
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'proposeMapping', success: true, focusId: 'mapping-list-heading' }
			: actionFailure('proposeMapping', result, 'propose');
	},
	approveMapping: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumMappingService(locals.database).decide(principal.userId, {
			mappingId: String(data.get('mappingId') ?? ''),
			decision: 'approve',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'approveMapping', success: true, focusId: 'mapping-list-heading' }
			: actionFailure('approveMapping', result, `approve-${String(data.get('mappingId') ?? '')}`);
	},
	rejectMapping: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumMappingService(locals.database).decide(principal.userId, {
			mappingId: String(data.get('mappingId') ?? ''),
			decision: 'reject',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'rejectMapping', success: true, focusId: 'mapping-list-heading' }
			: actionFailure('rejectMapping', result, `reject-${String(data.get('mappingId') ?? '')}`);
	},
	retireMapping: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumMappingService(locals.database).retire(principal.userId, {
			mappingId: String(data.get('mappingId') ?? ''),
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'retireMapping', success: true, focusId: 'mapping-list-heading' }
			: actionFailure('retireMapping', result, `retire-${String(data.get('mappingId') ?? '')}`);
	}
};
