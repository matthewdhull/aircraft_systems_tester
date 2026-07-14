import { createHash, randomUUID } from 'node:crypto';

import { recordAuditEvent } from '$lib/server/audit/index.js';
import { hasEffectiveAdministratorCapability } from '$lib/server/authorization/index.js';
import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import {
	aircraft,
	aircraftOptions,
	findLatestVersion,
	findVersion,
	futureCurriculumOptions,
	futureLinks,
	legacyLinks,
	listItem,
	maxVersion,
	options,
	prompts,
	searchVersions,
	summary,
	versionCount,
	type ParsedSearchQuery,
	type QuestionVersionRow
} from './repository.js';
import type {
	AircraftApplicabilityDto,
	CreateQuestionCommand,
	CreateQuestionVersionCommand,
	DecideFutureQuestionLinkCommand,
	DeleteQuestionDraftCommand,
	FieldError,
	FutureCurriculumOptionDto,
	FutureLinkStatus,
	FutureQuestionLinkDto,
	GenerationEligibilityReason,
	GenerationEligibilityResult,
	LegacyQuestionLinkInput,
	PrivilegedQuestionDetailDto,
	ProposeFutureQuestionLinkCommand,
	PublishQuestionVersionCommand,
	QuestionDependencyKind,
	QuestionDependencyResult,
	QuestionErrorCode,
	QuestionIdentityDto,
	QuestionLifecycle,
	QuestionMutationResult,
	QuestionReadResult,
	QuestionSearchQuery,
	QuestionSearchResult,
	QuestionServiceDependencies,
	QuestionType,
	QuestionVersionSummaryDto,
	RetireQuestionVersionCommand,
	ReviewQuestionVersionCommand,
	SubmitQuestionReviewCommand,
	UpdateQuestionDraftCommand,
	ValidatedQuestionContent
} from './types.js';
import {
	QuestionValidationError,
	buildCanonicalDisplay,
	normalizeQuestionType,
	validateQuestionContent
} from './validation.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIFECYCLES = new Set<QuestionLifecycle>(['draft', 'review', 'published', 'retired']);
const GENERATION_STATUSES = new Set(['blocked', 'eligible'] as const);
const FUTURE_LINK_STATUSES = new Set<FutureLinkStatus>(['review', 'approved', 'retired']);
const AUDIT = {
	created: 'question.created',
	versionCreated: 'question.version.created',
	updated: 'question.version.updated',
	submitted: 'question.version.submitted',
	reviewed: 'question.version.reviewed',
	returned: 'question.version.returned',
	published: 'question.version.published',
	retired: 'question.version.retired',
	deleted: 'question.version.deleted',
	aircraft: 'question.aircraft.changed',
	futureProposed: 'question.future_link.proposed',
	futureApproved: 'question.future_link.approved',
	futureRetired: 'question.future_link.retired',
	eligibility: 'question.eligibility.changed'
} as const;

function failure(error: QuestionErrorCode): { ok: false; error: QuestionErrorCode } {
	return { ok: false, error };
}

function fieldFailure(fields: readonly FieldError[]): {
	ok: false;
	error: 'invalid_input';
	fields: readonly FieldError[];
} {
	return { ok: false, error: 'invalid_input', fields };
}

function uuid(field: string, value: unknown): string | FieldError {
	if (typeof value !== 'string' || !UUID.test(value)) {
		return { field, message: 'Enter a valid identifier.' };
	}
	return value;
}

function requiredText(field: string, value: unknown, max = 2_000): string | FieldError {
	if (typeof value !== 'string' || value.trim().length === 0)
		return { field, message: 'This field is required.' };
	if (value.trim().length > max) return { field, message: `Use ${max} characters or fewer.` };
	return value.trim();
}

function date(field: string, value: unknown, optional = false): string | null | FieldError {
	if (optional && (value == null || value === '')) return null;
	if (typeof value !== 'string') return { field, message: 'Enter a valid date and time.' };
	const parsed = new Date(value);
	if (!Number.isFinite(parsed.getTime())) return { field, message: 'Enter a valid date and time.' };
	return parsed.toISOString();
}

function isFieldError(value: unknown): value is FieldError {
	return Boolean(value && typeof value === 'object' && 'field' in value && 'message' in value);
}

function uniqueUuidArray(field: string, values: readonly unknown[]): string[] | FieldError[] {
	if (!Array.isArray(values)) return [{ field, message: 'Select valid identifiers.' }];
	const parsed: string[] = [];
	const errors: FieldError[] = [];
	for (const [position, value] of values.entries()) {
		const result = uuid(`${field}.${position}`, value);
		if (isFieldError(result)) errors.push(result);
		else parsed.push(result);
	}
	if (new Set(parsed).size !== parsed.length)
		errors.push({ field, message: 'Selections must be distinct.' });
	return errors.length ? errors : parsed;
}

function timestampEffective(
	row: {
		status?: string;
		lifecycle?: string;
		effectiveFrom: string | null;
		effectiveTo: string | null;
	},
	now: string
): boolean {
	const status = row.status ?? row.lifecycle;
	return (
		(status === 'published' || status === 'active') &&
		row.effectiveFrom !== null &&
		row.effectiveFrom <= now &&
		(row.effectiveTo === null || row.effectiveTo > now)
	);
}

function revision(value: unknown): string {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function parseSearch(query: QuestionSearchQuery): ParsedSearchQuery {
	const search = typeof query.search === 'string' ? query.search.trim().slice(0, 200) : '';
	const types = (query.types ?? []).flatMap((value) => {
		try {
			return [normalizeQuestionType(value)];
		} catch {
			return [];
		}
	});
	const lifecycles = (query.lifecycles ?? []).filter(
		(value): value is QuestionLifecycle =>
			typeof value === 'string' && LIFECYCLES.has(value as QuestionLifecycle)
	);
	const generationStatuses = (query.generationStatuses ?? []).filter(
		(value): value is 'blocked' | 'eligible' =>
			typeof value === 'string' && GENERATION_STATUSES.has(value as 'blocked' | 'eligible')
	);
	const aircraftVariantIds = (query.aircraftVariantIds ?? []).filter(
		(value): value is string => typeof value === 'string' && UUID.test(value)
	);
	const futureLinkStatuses = (query.futureLinkStatuses ?? []).filter(
		(value): value is FutureLinkStatus =>
			typeof value === 'string' && FUTURE_LINK_STATUSES.has(value as FutureLinkStatus)
	);
	const rawPage = Number(query.page ?? 1);
	const rawPageSize = Number(query.pageSize ?? 25);
	return {
		search: search || null,
		types: [...new Set(types)],
		lifecycles: [...new Set(lifecycles)],
		generationStatuses: [...new Set(generationStatuses)],
		aircraftVariantIds: [...new Set(aircraftVariantIds)],
		futureLinkStatuses: [...new Set(futureLinkStatuses)],
		page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
		pageSize: Number.isSafeInteger(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 100) : 25
	};
}

export class QuestionService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: QuestionServiceDependencies
	) {}

	search(query: QuestionSearchQuery = {}): QuestionSearchResult {
		const parsed = parseSearch(query);
		const result = searchVersions(this.database.db, parsed);
		return {
			items: result.rows.map((row) => listItem(this.database.db, row)),
			page: parsed.page,
			pageSize: parsed.pageSize,
			totalItems: result.total,
			totalPages: result.total === 0 ? 0 : Math.ceil(result.total / parsed.pageSize)
		};
	}

	versionSummary(
		questionId: string,
		selection: { versionId?: string } = {}
	): QuestionReadResult<QuestionVersionSummaryDto> {
		if (!UUID.test(questionId) || (selection.versionId && !UUID.test(selection.versionId)))
			return failure('invalid_input');
		try {
			const row = selection.versionId
				? findVersion(this.database.db, selection.versionId)
				: findLatestVersion(this.database.db, questionId);
			if (!row || row.questionId !== questionId) return failure('not_found');
			return { ok: true, value: summary(this.database.db, row) };
		} catch {
			return failure('unavailable');
		}
	}

	detail(
		questionId: string,
		selection: { versionId?: string } = {}
	): QuestionReadResult<PrivilegedQuestionDetailDto> {
		if (!UUID.test(questionId) || (selection.versionId && !UUID.test(selection.versionId)))
			return failure('invalid_input');
		try {
			const row = selection.versionId
				? findVersion(this.database.db, selection.versionId)
				: findLatestVersion(this.database.db, questionId);
			if (!row || row.questionId !== questionId) return failure('not_found');
			return { ok: true, value: this.detailFrom(this.database.db, row) };
		} catch {
			return failure('unavailable');
		}
	}

	aircraftOptions(): readonly AircraftApplicabilityDto[] {
		return aircraftOptions(this.database.db, this.dependencies.clock.now().toISOString());
	}

	futureCurriculumOptions(): readonly FutureCurriculumOptionDto[] {
		return futureCurriculumOptions(this.database.db, this.dependencies.clock.now().toISOString());
	}

	dependencyPreview(
		versionId: string,
		operation: QuestionDependencyResult['operation']
	): QuestionReadResult<QuestionDependencyResult> {
		if (!UUID.test(versionId)) return failure('invalid_input');
		if (!['delete', 'retire', 'edit'].includes(operation)) return failure('invalid_input');
		if (!findVersion(this.database.db, versionId)) return failure('not_found');
		return { ok: true, value: this.dependenciesFor(this.database.db, versionId, operation) };
	}

	deriveGenerationEligibility(
		versionId: string,
		now: Date = this.dependencies.clock.now()
	): QuestionReadResult<GenerationEligibilityResult> {
		if (!UUID.test(versionId) || !Number.isFinite(now.getTime())) return failure('invalid_input');
		const row = findVersion(this.database.db, versionId);
		if (!row) return failure('not_found');
		return { ok: true, value: this.eligibility(this.database.db, row, now.toISOString()) };
	}

	createQuestion(
		actorUserId: string,
		command: CreateQuestionCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const prepared = this.prepareContent(command);
		if (!prepared.ok) return prepared;
		try {
			return this.database.transaction((tx) => {
				const applicability = this.validateApplicability(
					tx,
					prepared.aircraftIds,
					command.legacyCurriculumLinks ?? [],
					command.futureCurriculumLinks ?? []
				);
				if (!applicability.ok) return applicability;
				const occurredAt = this.dependencies.clock.now();
				const questionId = this.dependencies.ids.create();
				const versionId = this.dependencies.ids.create();
				tx.$client
					.prepare('INSERT INTO questions (id, created_at) VALUES (?, ?)')
					.run(questionId, occurredAt.toISOString());
				this.insertVersion(tx, {
					id: versionId,
					questionId,
					version: 1,
					questionType: prepared.content.questionType,
					actorUserId,
					createdAt: occurredAt.toISOString()
				});
				this.insertOwned(
					tx,
					versionId,
					actorUserId,
					occurredAt,
					prepared.content,
					prepared.aircraftIds,
					applicability
				);
				this.audit(tx, actorUserId, AUDIT.created, questionId, occurredAt, {
					questionType: prepared.content.questionType,
					version: 1,
					status: 'draft',
					aircraftCount: prepared.aircraftIds.length,
					futureLinkCount: applicability.future.length
				});
				const row = findVersion(tx, versionId)!;
				return { ok: true, value: this.identity(tx, row) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	updateDraft(
		actorUserId: string,
		command: UpdateQuestionDraftCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const prepared = this.prepareContent(command);
		if (!prepared.ok) return prepared;
		const versionId = uuid('versionId', command.versionId);
		if (isFieldError(versionId)) return fieldFailure([versionId]);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'draft') return failure('referenced_immutable');
				if (row.authoredByUserId === null) return failure('referenced_immutable');
				if (row.version !== command.expectedVersion) return failure('stale_version');
				const applicability = this.validateApplicability(
					tx,
					prepared.aircraftIds,
					command.legacyCurriculumLinks ?? [],
					command.futureCurriculumLinks ?? []
				);
				if (!applicability.ok) return applicability;
				const existingFuture = futureLinks(tx, row.id);
				if (existingFuture.some((link) => link.status !== 'review'))
					return failure('referenced_immutable');
				const replacesFutureLinks = command.futureCurriculumLinks !== undefined;
				const previousAircraft = aircraft(tx, row.id).map((item) => item.aircraftVariantId);
				tx.$client
					.prepare('DELETE FROM question_prompts WHERE question_version_id = ?')
					.run(row.id);
				tx.$client
					.prepare('DELETE FROM question_options WHERE question_version_id = ?')
					.run(row.id);
				tx.$client
					.prepare('DELETE FROM question_aircraft_applicability WHERE question_version_id = ?')
					.run(row.id);
				tx.$client
					.prepare('DELETE FROM question_legacy_curriculum_links WHERE question_version_id = ?')
					.run(row.id);
				const occurredAt = this.dependencies.clock.now();
				tx.$client
					.prepare(
						`UPDATE question_versions SET question_type = ?, reviewed_by_user_id = NULL,
						 reviewed_at = NULL WHERE id = ?`
					)
					.run(prepared.content.questionType, row.id);
				this.insertContentRows(
					tx,
					row.id,
					prepared.content,
					prepared.aircraftIds,
					applicability.legacy
				);
				if (replacesFutureLinks) {
					tx.$client
						.prepare(
							"DELETE FROM question_future_curriculum_links WHERE question_version_id = ? AND mapping_status = 'review'"
						)
						.run(row.id);
					for (const link of applicability.future) {
						if (
							!existingFuture.some(
								(candidate) =>
									candidate.status !== 'review' &&
									candidate.subtaskVersionId === link.subtaskVersionId
							)
						)
							this.insertFutureLink(tx, row.id, actorUserId, occurredAt, link);
					}
				}
				this.audit(tx, actorUserId, AUDIT.updated, row.questionId, occurredAt, {
					questionType: prepared.content.questionType,
					version: row.version,
					status: 'draft',
					changedFields: ['questionType', 'prompts', 'options', 'aircraft', 'curriculum']
				});
				if (revision(previousAircraft) !== revision(prepared.aircraftIds)) {
					this.audit(tx, actorUserId, AUDIT.aircraft, row.questionId, occurredAt, {
						version: row.version,
						aircraftCount: prepared.aircraftIds.length
					});
				}
				return { ok: true, value: this.identity(tx, findVersion(tx, row.id)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	createVersion(
		actorUserId: string,
		command: CreateQuestionVersionCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const questionId = uuid('questionId', command.questionId);
		const fromVersionId = uuid('fromVersionId', command.fromVersionId);
		const validation = [questionId, fromVersionId].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		try {
			return this.database.transaction((tx) => {
				const source = findVersion(tx, command.fromVersionId);
				if (!source || source.questionId !== command.questionId) return failure('not_found');
				if (source.identityRetiredAt !== null || source.lifecycle === 'retired')
					return failure('invalid_transition');
				if (
					source.lifecycle === 'draft' ||
					(source.lifecycle === 'review' && source.authoredByUserId !== null)
				)
					return failure('invalid_transition');
				if (
					tx.$client
						.prepare(
							`SELECT 1 FROM question_versions WHERE question_id = ?
							 AND authored_by_user_id IS NOT NULL AND lifecycle IN ('draft', 'review')`
						)
						.get(source.questionId)
				)
					return failure('conflict');
				const occurredAt = this.dependencies.clock.now();
				const versionId = this.dependencies.ids.create();
				const nextVersion = maxVersion(tx, source.questionId) + 1;
				this.insertVersion(tx, {
					id: versionId,
					questionId: source.questionId,
					version: nextVersion,
					questionType: source.questionType,
					actorUserId,
					createdAt: occurredAt.toISOString()
				});
				const sourcePrompts = prompts(tx, source.id);
				const sourceOptions = options(tx, source.id);
				const content = validateQuestionContent(source.questionType, sourcePrompts, sourceOptions);
				const sourceAircraft = aircraft(tx, source.id).map((item) => item.aircraftVariantId);
				this.insertContentRows(tx, versionId, content, sourceAircraft, legacyLinks(tx, source.id));
				for (const link of futureLinks(tx, source.id).filter((item) => item.status !== 'retired')) {
					this.insertFutureLink(tx, versionId, actorUserId, occurredAt, {
						subtaskVersionId: link.subtaskVersionId,
						elementVersionId: link.elementVersionId
					});
				}
				this.audit(tx, actorUserId, AUDIT.versionCreated, source.questionId, occurredAt, {
					questionType: source.questionType,
					version: nextVersion,
					status: 'draft',
					aircraftCount: sourceAircraft.length,
					futureLinkCount: futureLinks(tx, versionId).length
				});
				return { ok: true, value: this.identity(tx, findVersion(tx, versionId)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	submitReview(
		actorUserId: string,
		command: SubmitQuestionReviewCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const versionId = uuid('versionId', command.versionId);
		if (isFieldError(versionId)) return fieldFailure([versionId]);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'draft' || row.authoredByUserId === null)
					return failure('invalid_transition');
				const at = this.dependencies.clock.now();
				tx.$client
					.prepare(
						`UPDATE question_versions SET lifecycle = 'review', submitted_at = ?,
						 reviewed_by_user_id = NULL, reviewed_at = NULL WHERE id = ?`
					)
					.run(at.toISOString(), row.id);
				this.audit(tx, actorUserId, AUDIT.submitted, row.questionId, at, {
					questionType: row.questionType,
					version: row.version,
					status: 'review'
				});
				return { ok: true, value: this.identity(tx, findVersion(tx, row.id)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	reviewVersion(
		actorUserId: string,
		command: ReviewQuestionVersionCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const versionId = uuid('versionId', command.versionId);
		const rationale = requiredText('rationale', command.rationale);
		const validation = [versionId, rationale].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		if (command.decision !== 'approve' && command.decision !== 'return')
			return fieldFailure([{ field: 'decision', message: 'Select a valid review decision.' }]);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'review' || row.authoredByUserId === null)
					return failure('invalid_transition');
				const administratorOverride = hasEffectiveAdministratorCapability(tx, actorUserId);
				if (row.authoredByUserId === actorUserId && !administratorOverride)
					return failure('distinct_reviewer_required');
				const at = this.dependencies.clock.now();
				const approved = command.decision === 'approve';
				tx.$client
					.prepare(
						`UPDATE question_versions SET lifecycle = ?, reviewed_by_user_id = ?, reviewed_at = ?,
						 submitted_at = ?
						 WHERE id = ?`
					)
					.run(
						approved ? 'review' : 'draft',
						approved ? actorUserId : null,
						approved ? at.toISOString() : null,
						approved ? row.submittedAt : null,
						row.id
					);
				this.audit(
					tx,
					actorUserId,
					approved ? AUDIT.reviewed : AUDIT.returned,
					row.questionId,
					at,
					{
						questionType: row.questionType,
						version: row.version,
						status: approved ? 'review' : 'draft',
						decision: command.decision,
						...(administratorOverride ? { reason: 'administrator_review_override' } : {})
					}
				);
				return { ok: true, value: this.identity(tx, findVersion(tx, row.id)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	publishVersion(
		actorUserId: string,
		command: PublishQuestionVersionCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const versionId = uuid('versionId', command.versionId);
		const start = date('effectiveFrom', command.effectiveFrom);
		const end = date('effectiveTo', command.effectiveTo, true);
		const validation = [versionId, start, end].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		if (typeof start !== 'string')
			return fieldFailure([{ field: 'effectiveFrom', message: 'Enter a valid date and time.' }]);
		if (typeof end === 'string' && end <= start) return failure('effective_range_invalid');
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				const administratorOverride = hasEffectiveAdministratorCapability(tx, actorUserId);
				if (
					!['draft', 'review'].includes(row.lifecycle) ||
					(row.lifecycle === 'draft' && !administratorOverride)
				)
					return failure('invalid_transition');
				if ((!row.reviewedByUserId || !row.reviewedAt) && !administratorOverride)
					return failure('distinct_reviewer_required');
				if (row.authoredByUserId === null) return failure('invalid_transition');
				if (row.authoredByUserId === actorUserId && !administratorOverride)
					return failure('distinct_reviewer_required');
				if (!this.aircraftValidForRange(tx, row.id, start, typeof end === 'string' ? end : null))
					return failure('aircraft_not_effective');
				const at = this.dependencies.clock.now();
				tx.$client
					.prepare(
						`UPDATE question_versions SET lifecycle = 'published', reviewed_by_user_id = ?, reviewed_at = ?, effective_from = ?,
						 effective_to = ?, published_at = ? WHERE id = ?`
					)
					.run(
						administratorOverride ? actorUserId : row.reviewedByUserId,
						administratorOverride ? at.toISOString() : row.reviewedAt,
						start,
						end,
						at.toISOString(),
						row.id
					);
				this.recomputeEligibility(tx, row.id, actorUserId, at);
				this.audit(tx, actorUserId, AUDIT.published, row.questionId, at, {
					questionType: row.questionType,
					version: row.version,
					status: 'published',
					reason: administratorOverride ? 'administrator_direct_publish' : 'review_approved'
				});
				return { ok: true, value: this.identity(tx, findVersion(tx, row.id)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	retireVersion(
		actorUserId: string,
		command: RetireQuestionVersionCommand
	): QuestionMutationResult<QuestionIdentityDto> {
		const versionId = uuid('versionId', command.versionId);
		const reason = requiredText('reason', command.reason);
		const validation = [versionId, reason].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'published') return failure('invalid_transition');
				if (maxVersion(tx, row.questionId) !== row.version) return failure('conflict');
				const dependencies = this.dependenciesFor(tx, row.id, 'retire');
				if (dependencies.revision !== command.expectedDependencyRevision)
					return failure('dependency_changed');
				const at = this.dependencies.clock.now();
				tx.$client
					.prepare(
						`UPDATE question_versions SET lifecycle = 'retired', generation_status = 'blocked',
						 retired_at = ? WHERE id = ?`
					)
					.run(at.toISOString(), row.id);
				tx.$client
					.prepare('UPDATE questions SET retired_at = ? WHERE id = ?')
					.run(at.toISOString(), row.questionId);
				if (row.generationStatus !== 'blocked')
					this.audit(tx, actorUserId, AUDIT.eligibility, row.questionId, at, {
						version: row.version,
						generationStatus: 'blocked',
						reason: 'retired'
					});
				this.audit(tx, actorUserId, AUDIT.retired, row.questionId, at, {
					questionType: row.questionType,
					version: row.version,
					status: 'retired',
					reason: 'reviewed_dependency_preview'
				});
				return { ok: true, value: this.identity(tx, findVersion(tx, row.id)!) };
			});
		} catch {
			return failure('unavailable');
		}
	}

	deleteDraft(
		actorUserId: string,
		command: DeleteQuestionDraftCommand
	): QuestionMutationResult<{ deletedVersionId: string }> {
		const versionId = uuid('versionId', command.versionId);
		if (isFieldError(versionId)) return fieldFailure([versionId]);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.versionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'draft' || row.authoredByUserId === null)
					return failure('referenced_immutable');
				if (futureLinks(tx, row.id).some((link) => link.status !== 'review'))
					return failure('referenced_immutable');
				const dependencies = this.dependenciesFor(tx, row.id, 'delete');
				if (dependencies.revision !== command.expectedDependencyRevision)
					return failure('dependency_changed');
				if (dependencies.blocksHardDelete) return failure('dependency_exists');
				tx.$client.prepare('DELETE FROM question_versions WHERE id = ?').run(row.id);
				if (versionCount(tx, row.questionId) === 0)
					tx.$client.prepare('DELETE FROM questions WHERE id = ?').run(row.questionId);
				this.audit(tx, actorUserId, AUDIT.deleted, row.questionId, this.dependencies.clock.now(), {
					questionType: row.questionType,
					version: row.version,
					status: 'draft'
				});
				return { ok: true, value: { deletedVersionId: row.id } };
			});
		} catch {
			return failure('unavailable');
		}
	}

	proposeFutureLink(
		actorUserId: string,
		command: ProposeFutureQuestionLinkCommand
	): QuestionMutationResult<FutureQuestionLinkDto> {
		const versionId = uuid('questionVersionId', command.questionVersionId);
		const subtaskId = uuid('subtaskVersionId', command.subtaskVersionId);
		const elementId =
			command.elementVersionId == null || command.elementVersionId === ''
				? null
				: uuid('elementVersionId', command.elementVersionId);
		const validation = [versionId, subtaskId, elementId].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.questionVersionId);
				if (!row) return failure('not_found');
				if (row.lifecycle !== 'draft' || row.authoredByUserId === null)
					return failure('referenced_immutable');
				if (futureLinks(tx, row.id).some((link) => link.status !== 'review'))
					return failure('referenced_immutable');
				if (
					!this.validFutureChain(
						tx,
						subtaskId as string,
						elementId as string | null,
						this.dependencies.clock.now().toISOString()
					)
				)
					return failure('curriculum_not_published');
				if (
					tx.$client
						.prepare(
							`SELECT 1 FROM question_future_curriculum_links
							 WHERE question_version_id = ? AND subtask_version_id = ?`
						)
						.get(row.id, subtaskId)
				)
					return failure('future_link_conflict');
				const at = this.dependencies.clock.now();
				this.insertFutureLink(tx, row.id, actorUserId, at, {
					subtaskVersionId: subtaskId as string,
					elementVersionId: elementId as string | null
				});
				this.recomputeEligibility(tx, row.id, actorUserId, at);
				this.audit(tx, actorUserId, AUDIT.futureProposed, row.questionId, at, {
					version: row.version,
					status: 'review',
					futureLinkCount: futureLinks(tx, row.id).length
				});
				return {
					ok: true,
					value: futureLinks(tx, row.id).find((link) => link.subtaskVersionId === subtaskId)!
				};
			});
		} catch {
			return failure('unavailable');
		}
	}

	decideFutureLink(
		actorUserId: string,
		command: DecideFutureQuestionLinkCommand
	): QuestionMutationResult<FutureQuestionLinkDto> {
		const versionId = uuid('questionVersionId', command.questionVersionId);
		const subtaskId = uuid('subtaskVersionId', command.subtaskVersionId);
		const rationale = requiredText('rationale', command.rationale);
		const validation = [versionId, subtaskId, rationale].filter(isFieldError);
		if (validation.length) return fieldFailure(validation);
		if (command.decision !== 'approve' && command.decision !== 'retire')
			return fieldFailure([{ field: 'decision', message: 'Select a valid review decision.' }]);
		try {
			return this.database.transaction((tx) => {
				const row = findVersion(tx, command.questionVersionId);
				if (!row) return failure('not_found');
				if (row.lifecycle === 'retired') return failure('invalid_transition');
				const link = futureLinks(tx, row.id).find((item) => item.subtaskVersionId === subtaskId);
				if (!link) return failure('not_found');
				if (
					(command.decision === 'approve' && link.status !== 'review') ||
					(command.decision === 'retire' && !['review', 'approved'].includes(link.status))
				)
					return failure('future_link_conflict');
				const administratorOverride = hasEffectiveAdministratorCapability(tx, actorUserId);
				if (
					(link.proposedByUserId === actorUserId || row.authoredByUserId === actorUserId) &&
					!administratorOverride
				)
					return failure('distinct_reviewer_required');
				if (
					command.decision === 'approve' &&
					!this.validFutureChain(
						tx,
						link.subtaskVersionId,
						link.elementVersionId,
						this.dependencies.clock.now().toISOString()
					)
				)
					return failure('curriculum_not_published');
				const at = this.dependencies.clock.now();
				const status = command.decision === 'approve' ? 'approved' : 'retired';
				tx.$client
					.prepare(
						`UPDATE question_future_curriculum_links SET mapping_status = ?,
						 reviewed_by_user_id = ?, reviewed_at = ?
						 WHERE question_version_id = ? AND subtask_version_id = ?`
					)
					.run(status, actorUserId, at.toISOString(), row.id, link.subtaskVersionId);
				this.recomputeEligibility(tx, row.id, actorUserId, at);
				this.audit(
					tx,
					actorUserId,
					status === 'approved' ? AUDIT.futureApproved : AUDIT.futureRetired,
					row.questionId,
					at,
					{
						version: row.version,
						status,
						decision: command.decision,
						...(administratorOverride ? { reason: 'administrator_review_override' } : {}),
						futureLinkCount: futureLinks(tx, row.id).length
					}
				);
				return {
					ok: true,
					value: futureLinks(tx, row.id).find(
						(item) => item.subtaskVersionId === link.subtaskVersionId
					)!
				};
			});
		} catch {
			return failure('unavailable');
		}
	}

	private prepareContent(
		command: CreateQuestionCommand
	):
		| { ok: true; content: ValidatedQuestionContent; aircraftIds: string[] }
		| { ok: false; error: QuestionErrorCode; fields?: readonly FieldError[] } {
		try {
			const content = validateQuestionContent(
				command.questionType,
				command.prompts,
				command.options
			);
			const aircraftIds = uniqueUuidArray('aircraftVariantIds', command.aircraftVariantIds);
			if (Array.isArray(aircraftIds) && aircraftIds.some(isFieldError))
				return { ok: false, error: 'invalid_input', fields: aircraftIds as FieldError[] };
			return { ok: true, content, aircraftIds: aircraftIds as string[] };
		} catch (error) {
			if (error instanceof QuestionValidationError)
				return {
					ok: false,
					error: error.code,
					...(error.fields.length ? { fields: error.fields } : {})
				};
			return failure('invalid_input');
		}
	}

	private validateApplicability(
		tx: FoundationDatabase,
		aircraftIds: readonly string[],
		legacyInputs: readonly LegacyQuestionLinkInput[],
		futureInputs: readonly { subtaskVersionId: unknown; elementVersionId?: unknown }[]
	):
		| {
				ok: true;
				legacy: Array<{ legacyTpoId: string; legacySpoId: string; legacyEoId: string }>;
				future: Array<{ subtaskVersionId: string; elementVersionId: string | null }>;
		  }
		| { ok: false; error: QuestionErrorCode; fields?: readonly FieldError[] } {
		const now = this.dependencies.clock.now().toISOString();
		for (const aircraftId of aircraftIds) {
			if (
				!tx.$client
					.prepare(
						`SELECT 1 FROM aircraft_variants WHERE id = ? AND status = 'active'
						 AND effective_from <= ? AND (effective_to IS NULL OR effective_to > ?)`
					)
					.get(aircraftId, now, now)
			)
				return failure('aircraft_not_effective');
		}
		const legacy: Array<{ legacyTpoId: string; legacySpoId: string; legacyEoId: string }> = [];
		for (const [position, input] of legacyInputs.entries()) {
			const tpo = uuid(`legacyCurriculumLinks.${position}.legacyTpoId`, input.legacyTpoId);
			const spo = uuid(`legacyCurriculumLinks.${position}.legacySpoId`, input.legacySpoId);
			const eo = uuid(`legacyCurriculumLinks.${position}.legacyEoId`, input.legacyEoId);
			const validation = [tpo, spo, eo].filter(isFieldError);
			if (validation.length) return fieldFailure(validation);
			const valid = tx.$client
				.prepare(
					`SELECT 1 FROM legacy_eos e JOIN legacy_spos s ON s.id = e.legacy_spo_id
					 JOIN legacy_tpos t ON t.id = s.legacy_tpo_id
					 WHERE e.id = ? AND s.id = ? AND t.id = ?`
				)
				.get(eo, spo, tpo);
			if (!valid) return failure('parent_chain_invalid');
			legacy.push({
				legacyTpoId: tpo as string,
				legacySpoId: spo as string,
				legacyEoId: eo as string
			});
		}
		if (new Set(legacy.map((link) => link.legacyEoId)).size !== legacy.length)
			return failure('conflict');
		const future: Array<{ subtaskVersionId: string; elementVersionId: string | null }> = [];
		for (const [position, input] of futureInputs.entries()) {
			const subtask = uuid(
				`futureCurriculumLinks.${position}.subtaskVersionId`,
				input.subtaskVersionId
			);
			const element =
				input.elementVersionId == null || input.elementVersionId === ''
					? null
					: uuid(`futureCurriculumLinks.${position}.elementVersionId`, input.elementVersionId);
			const validation = [subtask, element].filter(isFieldError);
			if (validation.length) return fieldFailure(validation);
			if (!this.validFutureChain(tx, subtask as string, element as string | null, now))
				return failure('curriculum_not_published');
			future.push({
				subtaskVersionId: subtask as string,
				elementVersionId: element as string | null
			});
		}
		if (new Set(future.map((link) => link.subtaskVersionId)).size !== future.length)
			return failure('future_link_conflict');
		return { ok: true, legacy, future };
	}

	private insertVersion(
		tx: FoundationDatabase,
		value: {
			id: string;
			questionId: string;
			version: number;
			questionType: QuestionType;
			actorUserId: string;
			createdAt: string;
		}
	): void {
		tx.$client
			.prepare(
				`INSERT INTO question_versions
				 (id, question_id, version, question_type, lifecycle, generation_status,
				  authored_by_user_id, created_at)
				 VALUES (?, ?, ?, ?, 'draft', 'blocked', ?, ?)`
			)
			.run(
				value.id,
				value.questionId,
				value.version,
				value.questionType,
				value.actorUserId,
				value.createdAt
			);
	}

	private insertOwned(
		tx: FoundationDatabase,
		versionId: string,
		actorUserId: string,
		occurredAt: Date,
		content: ValidatedQuestionContent,
		aircraftIds: readonly string[],
		applicability: {
			legacy: Array<{ legacyTpoId: string; legacySpoId: string; legacyEoId: string }>;
			future: Array<{ subtaskVersionId: string; elementVersionId: string | null }>;
		}
	): void {
		this.insertContentRows(tx, versionId, content, aircraftIds, applicability.legacy);
		for (const link of applicability.future)
			this.insertFutureLink(tx, versionId, actorUserId, occurredAt, link);
	}

	private insertContentRows(
		tx: FoundationDatabase,
		versionId: string,
		content: ValidatedQuestionContent,
		aircraftIds: readonly string[],
		legacy: readonly { legacyTpoId: string; legacySpoId: string; legacyEoId: string }[]
	): void {
		const promptStatement = tx.$client.prepare(
			`INSERT INTO question_prompts (id, question_version_id, position, prompt_text)
			 VALUES (?, ?, ?, ?)`
		);
		for (const [position, prompt] of content.prompts.entries())
			promptStatement.run(this.dependencies.ids.create(), versionId, position, prompt);
		const optionStatement = tx.$client.prepare(
			`INSERT INTO question_options
			 (id, question_version_id, position, option_text, is_correct, semantic_value)
			 VALUES (?, ?, ?, ?, ?, ?)`
		);
		for (const option of content.options)
			optionStatement.run(
				this.dependencies.ids.create(),
				versionId,
				option.position,
				option.text,
				option.isCorrect ? 1 : 0,
				option.semanticValue
			);
		const aircraftStatement = tx.$client.prepare(
			`INSERT INTO question_aircraft_applicability (question_version_id, aircraft_variant_id)
			 VALUES (?, ?)`
		);
		for (const aircraftId of aircraftIds) aircraftStatement.run(versionId, aircraftId);
		const legacyStatement = tx.$client.prepare(
			`INSERT INTO question_legacy_curriculum_links
			 (question_version_id, legacy_tpo_id, legacy_spo_id, legacy_eo_id)
			 VALUES (?, ?, ?, ?)`
		);
		for (const link of legacy)
			legacyStatement.run(versionId, link.legacyTpoId, link.legacySpoId, link.legacyEoId);
	}

	private insertFutureLink(
		tx: FoundationDatabase,
		versionId: string,
		actorUserId: string,
		occurredAt: Date,
		link: { subtaskVersionId: string; elementVersionId: string | null }
	): void {
		tx.$client
			.prepare(
				`INSERT INTO question_future_curriculum_links
				 (question_version_id, subtask_version_id, element_version_id, mapping_status,
				  proposed_by_user_id, proposed_at)
				 VALUES (?, ?, ?, 'review', ?, ?)`
			)
			.run(
				versionId,
				link.subtaskVersionId,
				link.elementVersionId,
				actorUserId,
				occurredAt.toISOString()
			);
	}

	private identity(tx: FoundationDatabase, row: QuestionVersionRow): QuestionIdentityDto {
		const latest = findLatestVersion(tx, row.questionId) ?? row;
		return {
			id: row.questionId,
			createdAt: row.identityCreatedAt,
			retiredAt: latest.identityRetiredAt,
			latestVersion: summary(tx, latest)
		};
	}

	private detailFrom(tx: FoundationDatabase, row: QuestionVersionRow): PrivilegedQuestionDetailDto {
		const promptRows = prompts(tx, row.id);
		const optionRows = options(tx, row.id);
		const content = validateQuestionContent(row.questionType, promptRows, optionRows);
		return {
			...summary(tx, row),
			prompts: promptRows,
			options: optionRows,
			display: buildCanonicalDisplay(content, { includeKey: true }),
			aircraft: aircraft(tx, row.id),
			legacyCurriculum: legacyLinks(tx, row.id),
			futureCurriculum: futureLinks(tx, row.id),
			dependencies: this.dependenciesFor(tx, row.id, 'edit')
		};
	}

	private validFutureChain(
		tx: FoundationDatabase,
		subtaskVersionId: string,
		elementVersionId: string | null,
		now: string
	): boolean {
		const row = tx.$client
			.prepare(
				`SELECT sv.status AS subtaskStatus, sv.effective_from AS subtaskFrom,
				 sv.effective_to AS subtaskTo, tv.status AS taskStatus,
				 tv.effective_from AS taskFrom, tv.effective_to AS taskTo,
				 pv.status AS phaseStatus, pv.effective_from AS phaseFrom,
				 pv.effective_to AS phaseTo
				 FROM subtask_versions sv JOIN task_versions tv ON tv.id = sv.task_version_id
				 JOIN phase_versions pv ON pv.id = tv.phase_version_id WHERE sv.id = ?`
			)
			.get(subtaskVersionId) as
			| {
					subtaskStatus: string;
					subtaskFrom: string | null;
					subtaskTo: string | null;
					taskStatus: string;
					taskFrom: string | null;
					taskTo: string | null;
					phaseStatus: string;
					phaseFrom: string | null;
					phaseTo: string | null;
			  }
			| undefined;
		if (!row) return false;
		for (const prefix of ['subtask', 'task', 'phase'] as const) {
			if (
				!timestampEffective(
					{
						status: row[`${prefix}Status`],
						effectiveFrom: row[`${prefix}From`],
						effectiveTo: row[`${prefix}To`]
					},
					now
				)
			)
				return false;
		}
		if (!elementVersionId) return true;
		const element = tx.$client
			.prepare(
				`SELECT status, effective_from AS effectiveFrom, effective_to AS effectiveTo
				 FROM element_versions WHERE id = ? AND subtask_version_id = ?`
			)
			.get(elementVersionId, subtaskVersionId) as
			{ status: string; effectiveFrom: string | null; effectiveTo: string | null } | undefined;
		return Boolean(element && timestampEffective(element, now));
	}

	private aircraftValidForRange(
		tx: FoundationDatabase,
		versionId: string,
		start: string,
		end: string | null
	): boolean {
		const row = tx.$client
			.prepare(
				`SELECT 1 FROM question_aircraft_applicability qa
				 JOIN aircraft_variants a ON a.id = qa.aircraft_variant_id
				 WHERE qa.question_version_id = ? AND a.status = 'active'
				 AND a.effective_from <= ?
				 AND (? IS NOT NULL AND (a.effective_to IS NULL OR a.effective_to >= ?)
				      OR ? IS NULL AND a.effective_to IS NULL) LIMIT 1`
			)
			.get(versionId, start, end, end, end);
		return Boolean(row);
	}

	private eligibility(
		tx: FoundationDatabase,
		row: QuestionVersionRow,
		now: string
	): GenerationEligibilityResult {
		const reasons: GenerationEligibilityReason[] = [];
		if (row.lifecycle === 'retired' || row.identityRetiredAt !== null) reasons.push('retired');
		else if (row.lifecycle !== 'published') reasons.push('not_published');
		if (!timestampEffective(row, now) && row.lifecycle === 'published')
			reasons.push('question_not_effective');
		const effectiveAircraftCount = Number(
			tx.$client
				.prepare(
					`SELECT count(*) FROM question_aircraft_applicability qa
					 JOIN aircraft_variants a ON a.id = qa.aircraft_variant_id
					 WHERE qa.question_version_id = ? AND a.status = 'active'
					 AND a.effective_from <= ? AND (a.effective_to IS NULL OR a.effective_to > ?)`
				)
				.pluck()
				.get(row.id, now, now)
		);
		if (effectiveAircraftCount === 0) reasons.push('aircraft_not_effective');
		const approved = futureLinks(tx, row.id).filter((link) => link.status === 'approved');
		if (approved.length === 0) reasons.push('future_link_review_required');
		const validFutureLinkCount = approved.filter((link) =>
			this.validFutureChain(tx, link.subtaskVersionId, link.elementVersionId, now)
		).length;
		if (approved.length > 0 && validFutureLinkCount !== approved.length)
			reasons.push('parent_chain_invalid');
		return {
			eligible: reasons.length === 0,
			status: reasons.length === 0 ? 'eligible' : 'blocked',
			reasons,
			effectiveAircraftCount,
			approvedFutureLinkCount: approved.length,
			validFutureLinkCount
		};
	}

	private recomputeEligibility(
		tx: FoundationDatabase,
		versionId: string,
		actorUserId: string,
		occurredAt: Date
	): GenerationEligibilityResult {
		const row = findVersion(tx, versionId)!;
		const result = this.eligibility(tx, row, occurredAt.toISOString());
		if (result.status !== row.generationStatus) {
			tx.$client
				.prepare('UPDATE question_versions SET generation_status = ? WHERE id = ?')
				.run(result.status, versionId);
			this.audit(tx, actorUserId, AUDIT.eligibility, row.questionId, occurredAt, {
				version: row.version,
				generationStatus: result.status,
				reason: result.reasons[0] ?? 'requirements_satisfied',
				aircraftCount: result.effectiveAircraftCount,
				futureLinkCount: result.approvedFutureLinkCount
			});
		}
		return result;
	}

	private dependenciesFor(
		tx: FoundationDatabase,
		versionId: string,
		operation: QuestionDependencyResult['operation']
	): QuestionDependencyResult {
		const row = findVersion(tx, versionId)!;
		const count = (sql: string, ...values: unknown[]) =>
			Number(
				tx.$client
					.prepare(sql)
					.pluck()
					.get(...values)
			);
		const values: Record<QuestionDependencyKind, number> = {
			historical_performance: count(
				'SELECT count(*) FROM historical_question_performance WHERE question_version_id = ?',
				versionId
			),
			exam_snapshot: count(
				'SELECT count(*) FROM exam_questions WHERE source_question_version_id = ?',
				versionId
			),
			future_curriculum_link: count(
				"SELECT count(*) FROM question_future_curriculum_links WHERE question_version_id = ? AND mapping_status = 'approved'",
				versionId
			),
			legacy_curriculum_link: count(
				'SELECT count(*) FROM question_legacy_curriculum_links WHERE question_version_id = ?',
				versionId
			),
			published_version: ['published', 'retired'].includes(row.lifecycle) ? 1 : 0
		};
		const items = (Object.entries(values) as Array<[QuestionDependencyKind, number]>).map(
			([kind, dependencyCount]) => ({
				kind,
				count: dependencyCount,
				blocking: dependencyCount > 0
			})
		);
		return {
			operation,
			items,
			totalCount: items.reduce((total, item) => total + item.count, 0),
			blocksHardDelete: items.some((item) => item.blocking),
			requiresRetirement: items.some((item) => item.blocking),
			revision: revision({ operation, items })
		};
	}

	private audit(
		tx: FoundationDatabase,
		actorUserId: string,
		action: string,
		entityId: string,
		occurredAt: Date,
		after: Readonly<Record<string, unknown>>
	): void {
		this.dependencies.recordAuditEvent(tx, {
			actorUserId,
			action,
			entityType: 'question',
			entityId,
			occurredAt,
			before: null,
			after
		});
	}
}

export function defaultQuestionDependencies(
	overrides: Partial<QuestionServiceDependencies> = {}
): QuestionServiceDependencies {
	return {
		clock: overrides.clock ?? { now: () => new Date() },
		ids: overrides.ids ?? { create: randomUUID },
		recordAuditEvent: overrides.recordAuditEvent ?? recordAuditEvent
	};
}

export function createQuestionService(database: DatabaseHandle): QuestionService {
	return new QuestionService(database, defaultQuestionDependencies());
}
