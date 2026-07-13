import { fail } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import {
	createCurriculumService,
	type CurriculumMutationResult,
	type CurriculumNodeDto,
	type CurriculumNodeType,
	type DependencyWarningResult
} from '$lib/server/curriculum/index.js';
import type { Actions, PageServerLoad } from './$types';

function allNodes(hierarchy: ReturnType<ReturnType<typeof createCurriculumService>['hierarchy']>) {
	const nodes: CurriculumNodeDto[] = [];
	for (const phase of hierarchy.phases) {
		nodes.push(phase.node);
		for (const task of phase.tasks) {
			nodes.push(task.node);
			for (const subtask of task.subtasks) {
				nodes.push(subtask.node, ...subtask.elements);
			}
		}
	}
	return nodes;
}

function actionFailure(
	operation: string,
	result: Exclude<CurriculumMutationResult<unknown>, { ok: true }>,
	fieldPrefix: string | null = null
) {
	const status =
		result.error === 'not_found'
			? 404
			: ['conflict', 'stale_version', 'stale_order', 'dependency_changed'].includes(result.error)
				? 409
				: result.error === 'unavailable'
					? 503
					: 400;
	return fail(status, { operation, error: result.error, fields: result.fields ?? [], fieldPrefix });
}

export const load: PageServerLoad = ({ locals }) => {
	requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'browser');
	const service = createCurriculumService(locals.database);
	const hierarchy = service.hierarchy();
	const dependencyWarnings: DependencyWarningResult[] = [];
	for (const node of allNodes(hierarchy)) {
		const version = node.latestVersion;
		if (version.status === 'draft') {
			dependencyWarnings.push(service.dependencyPreview(node.type, node.id, 'delete'));
			if (node.type !== 'phase') {
				dependencyWarnings.push(service.dependencyPreview(node.type, node.id, 'parent_change'));
			}
		}
		if (version.status === 'published') {
			dependencyWarnings.push(service.dependencyPreview(node.type, node.id, 'retire'));
		}
	}
	return { hierarchy, bloomLevels: service.listBloomVocabulary(), dependencyWarnings };
};

export const actions: Actions = {
	createNode: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const type = data.get('type') as CurriculumNodeType;
		const parentVersionId = data.get('parentVersionId')?.toString() || null;
		const result = createCurriculumService(locals.database).createNode(principal.userId, {
			type,
			parentVersionId,
			name: data.get('name'),
			description: data.get('description'),
			bloomVerbId: data.get('bloomVerbId'),
			position: data.get('position')
		});
		return result.ok
			? { operation: 'createNode', success: true, focusId: `node-${result.value.latestVersion.id}` }
			: actionFailure('createNode', result, `create-${type}-${parentVersionId ?? 'root'}`);
	},
	createVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).createDraftVersion(principal.userId, {
			nodeId: String(data.get('nodeId') ?? ''),
			fromVersionId: String(data.get('fromVersionId') ?? '')
		});
		return result.ok
			? {
					operation: 'createVersion',
					success: true,
					focusId: `node-${result.value.latestVersion.id}`
				}
			: actionFailure('createVersion', result);
	},
	updateDraft: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createCurriculumService(locals.database).updateDraftVersion(principal.userId, {
			versionId,
			expectedVersion: Number(data.get('expectedVersion')),
			name: data.get('name'),
			description: data.get('description'),
			bloomVerbId: data.get('bloomVerbId'),
			parentVersionId: data.get('parentVersionId') ?? undefined,
			expectedDependencyRevision: data.get('expectedDependencyRevision')?.toString()
		});
		return result.ok
			? {
					operation: 'updateDraft',
					success: true,
					focusId: `node-${result.value.latestVersion.id}`
				}
			: actionFailure('updateDraft', result, `edit-${versionId}`);
	},
	submitReview: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createCurriculumService(locals.database).submitForReview(
			principal.userId,
			versionId
		);
		return result.ok
			? { operation: 'submitReview', success: true, focusId: `node-${versionId}` }
			: actionFailure('submitReview', result);
	},
	reviewVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createCurriculumService(locals.database).reviewVersion(principal.userId, {
			versionId,
			decision: data.get('decision') as 'approve' | 'return',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'reviewVersion', success: true, focusId: `node-${versionId}` }
			: actionFailure('reviewVersion', result, `review-${versionId}`);
	},
	publishVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createCurriculumService(locals.database).publishVersion(principal.userId, {
			versionId,
			effectiveFrom: data.get('effectiveFrom'),
			effectiveTo: data.get('effectiveTo')
		});
		return result.ok
			? { operation: 'publishVersion', success: true, focusId: `node-${versionId}` }
			: actionFailure('publishVersion', result, `publish-${versionId}`);
	},
	retireVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createCurriculumService(locals.database).retireVersion(principal.userId, {
			versionId,
			reason: data.get('reason'),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'retireVersion', success: true, focusId: `node-${versionId}` }
			: actionFailure('retireVersion', result, `retire-${versionId}`);
	},
	deleteDraft: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		if (data.get('confirmed') !== 'yes') {
			return fail(400, {
				operation: 'deleteDraft',
				error: 'invalid_input',
				fields: [{ field: 'confirmed', message: 'Confirm permanent draft deletion.' }],
				fieldPrefix: `delete-${versionId}`
			});
		}
		const result = createCurriculumService(locals.database).deleteDraft(principal.userId, {
			versionId,
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'deleteDraft', success: true, focusId: 'curriculum-heading' }
			: actionFailure('deleteDraft', result, `delete-${versionId}`);
	},
	reorderSiblings: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, 'endpoint');
		const data = await request.formData();
		const result = createCurriculumService(locals.database).reorderSiblings(principal.userId, {
			parentVersionId: data.get('parentVersionId')?.toString() || null,
			nodeType: data.get('nodeType') as CurriculumNodeType,
			orderedVersionIds: data.getAll('orderedVersionIds').map(String),
			expectedOrderRevision: String(data.get('expectedOrderRevision') ?? '')
		});
		return result.ok
			? {
					operation: 'reorderSiblings',
					success: true,
					focusId: String(data.get('focusId') ?? 'curriculum-heading')
				}
			: actionFailure('reorderSiblings', result);
	}
};
