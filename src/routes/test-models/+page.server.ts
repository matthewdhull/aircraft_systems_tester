import { fail, redirect } from '@sveltejs/kit';
import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import { createTemplateService, type TemplateDraftInput } from '$lib/server/templates/index.js';
import type { Actions, PageServerLoad } from './$types';

function command(data: FormData): TemplateDraftInput {
	const ruleCounts = data.getAll('ruleCount');
	const requiredSubtasks = data.getAll('mandatorySubtaskVersionId');
	return {
		name: data.get('name'),
		aircraftVariantId: data.get('aircraftVariantId'),
		courseTypeId: data.get('courseTypeId'),
		configuredLength: data.get('configuredLength'),
		allottedMinutes: data.get('allottedMinutes'),
		rules: data
			.getAll('ruleSubtaskVersionId')
			.map((subtaskVersionId, i) => ({ subtaskVersionId, count: ruleCounts[i] })),
		mandatoryElements: data
			.getAll('mandatoryElementVersionId')
			.map((elementVersionId, i) => ({ elementVersionId, subtaskVersionId: requiredSubtasks[i] }))
	};
}
export const load: PageServerLoad = ({ locals }) => {
	requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'browser');
	const service = createTemplateService(locals.database);
	return {
		templates: service.list(),
		options: service.authoringOptions(),
		legacySources: service.legacySources()
	};
};
export const actions: Actions = {
	create: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint');
		const result = createTemplateService(locals.database).create(
			actor.userId,
			command(await request.formData())
		);
		if (!result.ok)
			return fail(result.error === 'unavailable' ? 503 : 400, { operation: 'create', ...result });
		redirect(303, `/test-models/${result.value.templateId}?version=${result.value.versionId}`);
	},
	adopt: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createTemplateService(locals.database).adoptLegacy(
			actor.userId,
			String(data.get('legacySourceId')),
			command(data)
		);
		if (!result.ok)
			return fail(result.error === 'unavailable' ? 503 : result.error === 'conflict' ? 409 : 400, {
				operation: 'adopt',
				...result
			});
		redirect(303, `/test-models/${result.value.templateId}?version=${result.value.versionId}`);
	}
};
