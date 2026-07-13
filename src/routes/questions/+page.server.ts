import { fail, redirect } from '@sveltejs/kit';

import { PERMISSIONS, requirePermission } from '$lib/server/authorization/index.js';
import {
	QUESTION_TYPES,
	createQuestionService,
	normalizeQuestionType,
	type CreateQuestionCommand,
	type FutureLinkStatus,
	type GenerationStatus,
	type QuestionLifecycle,
	type QuestionMutationResult,
	type QuestionType
} from '$lib/server/questions/index.js';
import type { Actions, PageServerLoad } from './$types';

const LIFECYCLES = new Set<QuestionLifecycle>(['draft', 'review', 'published', 'retired']);
const GENERATION_STATUSES = new Set<GenerationStatus>(['blocked', 'eligible']);
const FUTURE_LINK_STATUSES = new Set<FutureLinkStatus>(['review', 'approved', 'retired']);

function canonicalType(value: unknown, fallback: QuestionType = 'true_false'): QuestionType {
	try {
		return normalizeQuestionType(value);
	} catch {
		return fallback;
	}
}

function parseTarget(value: FormDataEntryValue | null) {
	const encoded = String(value ?? '');
	if (!encoded) return [];
	const separator = encoded.indexOf(':');
	return [
		{
			subtaskVersionId: separator < 0 ? encoded : encoded.slice(0, separator),
			elementVersionId: separator < 0 ? undefined : encoded.slice(separator + 1) || undefined
		}
	];
}

function questionCommand(data: FormData): CreateQuestionCommand {
	const promptValues = data.getAll('prompts');
	const prompts = promptValues
		.filter((value, position) => position === 0 || String(value).trim().length > 0)
		.map((text) => ({ text }));
	const keyedPositions = new Set(data.getAll('keyedPosition').map((value) => String(value)));
	const semanticValues = data.getAll('semanticValue');
	const legacySpoIds = data.getAll('legacySpoId');
	const legacyEoIds = data.getAll('legacyEoId');
	return {
		questionType: data.get('questionType'),
		prompts,
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
		})),
		futureCurriculumLinks: parseTarget(data.get('futureTarget'))
	};
}

function actionFailure(
	operation: string,
	result: Exclude<QuestionMutationResult<unknown>, { ok: true }>
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
	return fail(status, { operation, error: result.error, fields: result.fields ?? [] });
}

export const load: PageServerLoad = ({ locals, url }) => {
	const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_VIEW, 'browser');
	const service = createQuestionService(locals.database);
	const types = url.searchParams
		.getAll('type')
		.map((value) => canonicalType(value))
		.filter((value, position, values) => values.indexOf(value) === position);
	const lifecycles = url.searchParams
		.getAll('lifecycle')
		.filter((value): value is QuestionLifecycle => LIFECYCLES.has(value as QuestionLifecycle));
	const generationStatuses = url.searchParams
		.getAll('generationStatus')
		.filter((value): value is GenerationStatus =>
			GENERATION_STATUSES.has(value as GenerationStatus)
		);
	const futureLinkStatuses = url.searchParams
		.getAll('futureLinkStatus')
		.filter((value): value is FutureLinkStatus =>
			FUTURE_LINK_STATUSES.has(value as FutureLinkStatus)
		);
	const pageSize = Number(url.searchParams.get('pageSize'));
	const filters = {
		search: url.searchParams.get('search') ?? '',
		types,
		lifecycles,
		generationStatuses,
		aircraftVariantIds: url.searchParams.getAll('aircraftVariantId'),
		futureLinkStatuses,
		pageSize: [10, 25, 50, 100].includes(pageSize) ? pageSize : 25
	};
	const query = {
		search: filters.search,
		types: filters.types,
		lifecycles: filters.lifecycles,
		generationStatuses: filters.generationStatuses,
		aircraftVariantIds: filters.aircraftVariantIds,
		futureLinkStatuses: filters.futureLinkStatuses,
		page: url.searchParams.get('page'),
		pageSize: filters.pageSize
	};
	const queryParameters = new URLSearchParams(url.searchParams);
	queryParameters.delete('page');
	return {
		questions: service.search(query),
		aircraftOptions: service.aircraftOptions(),
		futureCurriculumOptions: service.futureCurriculumOptions(),
		filters,
		queryString: queryParameters.toString(),
		createType: canonicalType(url.searchParams.get('createType') ?? QUESTION_TYPES[0]),
		canCreate: principal.permissions.has(PERMISSIONS.QUESTIONS_CREATE)
	};
};

export const actions: Actions = {
	createQuestion: async ({ locals, request }) => {
		const principal = requirePermission(locals, PERMISSIONS.QUESTIONS_CREATE, 'endpoint');
		const result = createQuestionService(locals.database).createQuestion(
			principal.userId,
			questionCommand(await request.formData())
		);
		if (!result.ok) return actionFailure('createQuestion', result);
		redirect(303, `/questions/${result.value.id}`);
	}
};
