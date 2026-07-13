import { error, fail, redirect } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import {
	createQuestionService,
	normalizeQuestionType,
	type CreateQuestionCommand,
	type QuestionMutationResult,
	type QuestionType
} from '$lib/server/questions/index.js';
import type { Actions, PageServerLoad } from './$types';

function actionFailure(
	operation: string,
	result: Exclude<QuestionMutationResult<unknown>, { ok: true }>,
	fieldPrefix: string | null = null
) {
	const status =
		result.error === 'not_found'
			? 404
			: ['conflict', 'stale_version', 'future_link_conflict', 'dependency_changed'].includes(
						result.error
				  )
				? 409
				: result.error === 'unavailable'
					? 503
					: 400;
	return fail(status, {
		operation,
		error: result.error,
		fields: result.fields ?? [],
		fieldPrefix
	});
}

function questionCommand(data: FormData): CreateQuestionCommand {
	const promptValues = data.getAll('prompts');
	const keyedPositions = new Set(data.getAll('keyedPosition').map(String));
	const semanticValues = data.getAll('semanticValue');
	const legacySpoIds = data.getAll('legacySpoId');
	const legacyEoIds = data.getAll('legacyEoId');
	return {
		questionType: data.get('questionType'),
		prompts: promptValues
			.filter((value, position) => position === 0 || String(value).trim().length > 0)
			.map((text) => ({ text })),
		options: data.getAll('optionText').map((text, position) => ({
			text,
			isCorrect: keyedPositions.has(String(position)),
			semanticValue: semanticValues[position] ?? null
		})),
		aircraftVariantIds: data.getAll('aircraftVariantId'),
		legacyCurriculumLinks: data.getAll('legacyTpoId').map((legacyTpoId, position) => ({
			legacyTpoId,
			legacySpoId: legacySpoIds[position],
			legacyEoId: legacyEoIds[position]
		}))
	};
}

function splitTarget(value: FormDataEntryValue | null): [string, string | undefined] {
	const encoded = String(value ?? '');
	const separator = encoded.indexOf(':');
	return separator < 0
		? [encoded, undefined]
		: [encoded.slice(0, separator), encoded.slice(separator + 1) || undefined];
}

function selectedType(value: string | null, fallback: QuestionType): QuestionType {
	if (value === null) return fallback;
	try {
		return normalizeQuestionType(value);
	} catch {
		return fallback;
	}
}

export const load: PageServerLoad = ({ locals, params, url }) => {
	const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_VIEW, 'browser');
	const service = createQuestionService(locals.database);
	const selection = url.searchParams.get('version')
		? { versionId: url.searchParams.get('version')! }
		: {};
	const summary = service.versionSummary(params.id, selection);
	if (!summary.ok) {
		if (summary.error === 'not_found') error(404, 'Question version not found.');
		if (summary.error === 'invalid_input') error(400, 'Invalid question identifier.');
		error(503, 'Question detail is unavailable.');
	}
	const has = (permission: string) => principal.permissions.has(permission);
	const answerKeyContext =
		has(PERMISSIONS.ANSWER_KEYS_VIEW) ||
		has(PERMISSIONS.QUESTIONS_CREATE) ||
		(summary.value.lifecycle === 'review' &&
			summary.value.authoredByUserId !== principal.userId &&
			has(PERMISSIONS.QUESTIONS_REVIEW)) ||
		(summary.value.lifecycle === 'review' &&
			Boolean(summary.value.reviewedByUserId) &&
			summary.value.authoredByUserId !== principal.userId &&
			has(PERMISSIONS.QUESTIONS_PUBLISH));
	if (!answerKeyContext) error(403, 'Answer-key access is not authorized for this workflow.');
	const detail = service.detail(params.id, selection);
	if (!detail.ok) {
		if (detail.error === 'not_found') error(404, 'Question version not found.');
		error(503, 'Question detail is unavailable.');
	}
	return {
		detail: detail.value,
		aircraftOptions: service.aircraftOptions(),
		futureCurriculumOptions: service.futureCurriculumOptions(),
		selectedType: selectedType(url.searchParams.get('editType'), detail.value.questionType),
		capabilities: {
			canEdit: has(PERMISSIONS.QUESTIONS_CREATE),
			canReview: has(PERMISSIONS.QUESTIONS_REVIEW),
			canPublish: has(PERMISSIONS.QUESTIONS_PUBLISH),
			canRetire: has(PERMISSIONS.QUESTIONS_PUBLISH) && has(PERMISSIONS.RECORDS_RETIRE),
			canViewAnswerKey: answerKeyContext
		}
	};
};

export const actions: Actions = {
	updateDraft: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createQuestionService(locals.database).updateDraft(principal.userId, {
			...questionCommand(data),
			versionId,
			expectedVersion: Number(data.get('expectedVersion'))
		});
		return result.ok
			? { operation: 'updateDraft', success: true, focusId: 'question-detail-heading' }
			: actionFailure('updateDraft', result, `question-${versionId}`);
	},
	createVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
		const data = await request.formData();
		const result = createQuestionService(locals.database).createVersion(principal.userId, {
			questionId: String(data.get('questionId') ?? ''),
			fromVersionId: String(data.get('fromVersionId') ?? '')
		});
		return result.ok
			? { operation: 'createVersion', success: true, focusId: 'question-detail-heading' }
			: actionFailure('createVersion', result);
	},
	submitReview: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
		const data = await request.formData();
		const result = createQuestionService(locals.database).submitReview(principal.userId, {
			versionId: String(data.get('versionId') ?? '')
		});
		return result.ok
			? { operation: 'submitReview', success: true, focusId: 'question-detail-heading' }
			: actionFailure('submitReview', result);
	},
	reviewVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_REVIEW, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createQuestionService(locals.database).reviewVersion(principal.userId, {
			versionId,
			decision: data.get('decision') as 'approve' | 'return',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'reviewVersion', success: true, focusId: 'question-detail-heading' }
			: actionFailure('reviewVersion', result, `review-${versionId}`);
	},
	publishVersion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_PUBLISH, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createQuestionService(locals.database).publishVersion(principal.userId, {
			versionId,
			effectiveFrom: data.get('effectiveFrom'),
			effectiveTo: data.get('effectiveTo')
		});
		return result.ok
			? { operation: 'publishVersion', success: true, focusId: 'question-detail-heading' }
			: actionFailure('publishVersion', result, `publish-${versionId}`);
	},
	retireVersion: async ({ locals, request }) => {
		requirePermission(locals, PERMISSIONS.RECORDS_RETIRE, 'endpoint');
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_PUBLISH, 'endpoint');
		const data = await request.formData();
		const versionId = String(data.get('versionId') ?? '');
		const result = createQuestionService(locals.database).retireVersion(principal.userId, {
			versionId,
			reason: data.get('reason'),
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		return result.ok
			? { operation: 'retireVersion', success: true, focusId: 'question-detail-heading' }
			: actionFailure('retireVersion', result, `retire-${versionId}`);
	},
	deleteDraft: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
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
		const result = createQuestionService(locals.database).deleteDraft(principal.userId, {
			versionId,
			expectedDependencyRevision: String(data.get('expectedDependencyRevision') ?? '')
		});
		if (!result.ok) return actionFailure('deleteDraft', result, `delete-${versionId}`);
		redirect(303, '/questions');
	},
	proposeFutureLink: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
		const data = await request.formData();
		const [subtaskVersionId, elementVersionId] = splitTarget(data.get('futureTarget'));
		const result = createQuestionService(locals.database).proposeFutureLink(principal.userId, {
			questionVersionId: String(data.get('questionVersionId') ?? ''),
			subtaskVersionId,
			elementVersionId
		});
		return result.ok
			? { operation: 'proposeFutureLink', success: true, focusId: 'future-applicability-heading' }
			: actionFailure('proposeFutureLink', result, 'future-curriculum');
	},
	approveFutureLink: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_REVIEW, 'endpoint');
		const data = await request.formData();
		const subtaskVersionId = String(data.get('subtaskVersionId') ?? '');
		const result = createQuestionService(locals.database).decideFutureLink(principal.userId, {
			questionVersionId: String(data.get('questionVersionId') ?? ''),
			subtaskVersionId,
			decision: 'approve',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'approveFutureLink', success: true, focusId: 'future-applicability-heading' }
			: actionFailure('approveFutureLink', result, `approve-link-${subtaskVersionId}`);
	},
	retireFutureLink: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_REVIEW, 'endpoint');
		const data = await request.formData();
		const subtaskVersionId = String(data.get('subtaskVersionId') ?? '');
		const result = createQuestionService(locals.database).decideFutureLink(principal.userId, {
			questionVersionId: String(data.get('questionVersionId') ?? ''),
			subtaskVersionId,
			decision: 'retire',
			rationale: data.get('rationale')
		});
		return result.ok
			? { operation: 'retireFutureLink', success: true, focusId: 'future-applicability-heading' }
			: actionFailure('retireFutureLink', result, `approve-link-${subtaskVersionId}`);
	}
};
