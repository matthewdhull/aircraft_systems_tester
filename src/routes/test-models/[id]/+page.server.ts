import { fail } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import {
	createTemplateService,
	type TemplateDraftInput,
	type TemplateResult
} from '$lib/server/templates/index.js';
import type { Actions, PageServerLoad } from './$types';
function command(data: FormData): TemplateDraftInput {
	const counts = data.getAll('ruleCount'),
		subs = data.getAll('mandatorySubtaskVersionId');
	return {
		name: data.get('name'),
		aircraftVariantId: data.get('aircraftVariantId'),
		courseTypeId: data.get('courseTypeId'),
		configuredLength: data.get('configuredLength'),
		allottedMinutes: data.get('allottedMinutes'),
		rules: data
			.getAll('ruleSubtaskVersionId')
			.map((subtaskVersionId, i) => ({ subtaskVersionId, count: counts[i] })),
		mandatoryElements: data
			.getAll('mandatoryElementVersionId')
			.map((elementVersionId, i) => ({ elementVersionId, subtaskVersionId: subs[i] }))
	};
}
function response(operation: string, result: TemplateResult<unknown>) {
	if (result.ok) return { operation, success: true };
	return fail(
		result.error === 'not_found'
			? 404
			: result.error === 'unavailable'
				? 503
				: result.error === 'conflict' || result.error === 'dependency_changed'
					? 409
					: 400,
		{ operation, ...result }
	);
}
export const load: PageServerLoad = ({ locals, params, url }) => {
	requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'browser');
	const service = createTemplateService(locals.database),
		result = service.detail(params.id, url.searchParams.get('version') ?? undefined);
	if (!result.ok) error(404, 'Template not found');
	const capacity = service.capacity(result.value.versionId);
	return {
		template: result.value,
		capacity: capacity.ok ? capacity.value : null,
		dependency: service.dependencyPreview(result.value.versionId),
		options: service.authoringOptions()
	};
};
export const actions: Actions = {
	update: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'update',
			createTemplateService(locals.database).updateDraft(
				actor.userId,
				String(data.get('versionId')),
				command(data)
			)
		);
	},
	submit: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'submit',
			createTemplateService(locals.database).submit(actor.userId, String(data.get('versionId')))
		);
	},
	returnToDraft: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'return',
			createTemplateService(locals.database).returnToDraft(
				actor.userId,
				String(data.get('versionId'))
			)
		);
	},
	publish: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'publish',
			createTemplateService(locals.database).publish(
				actor.userId,
				String(data.get('versionId')),
				data.get('effectiveFrom'),
				data.get('effectiveTo')
			)
		);
	},
	retire: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'retire',
			createTemplateService(locals.database).retire(actor.userId, String(data.get('versionId')))
		);
	},
	newVersion: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'newVersion',
			createTemplateService(locals.database).createNextDraft(
				actor.userId,
				String(data.get('versionId'))
			)
		);
	},
	delete: async ({ locals, request }) => {
		const actor = requirePermission(locals, PERMISSIONS.TEMPLATES_MANAGE, 'endpoint'),
			data = await request.formData();
		return response(
			'delete',
			createTemplateService(locals.database).deleteDraft(
				actor.userId,
				String(data.get('versionId')),
				String(data.get('revision'))
			)
		);
	}
};
