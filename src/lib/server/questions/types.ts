import type { FoundationDatabase } from '$lib/server/db/database.js';

export const QUESTION_TYPES = [
	'true_false',
	'single_choice',
	'two_correct_compound',
	'all_correct',
	'none_correct'
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type QuestionTypeAlias = 'tf' | 'mc' | 'c2' | 'ac' | 'nc';
export type QuestionLifecycle = 'draft' | 'review' | 'published' | 'retired';
export type GenerationStatus = 'blocked' | 'eligible';
export type FutureLinkStatus = 'review' | 'approved' | 'retired';

export interface QuestionIdentityDto {
	id: string;
	createdAt: string;
	retiredAt: string | null;
	latestVersion: QuestionVersionSummaryDto;
}

export interface QuestionVersionSummaryDto {
	id: string;
	questionId: string;
	version: number;
	questionType: QuestionType;
	lifecycle: QuestionLifecycle;
	generationStatus: GenerationStatus;
	authoredByUserId: string | null;
	reviewedByUserId: string | null;
	createdAt: string;
	submittedAt: string | null;
	publishedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	retiredAt: string | null;
	promptCount: number;
	aircraftCount: number;
	legacyLinkCount: number;
	futureLinkCounts: Readonly<Record<FutureLinkStatus, number>>;
}

export interface AircraftApplicabilityDto {
	aircraftVariantId: string;
	code: string;
	name: string;
}

export interface SafeQuestionListItemDto extends QuestionVersionSummaryDto {
	primaryPrompt: string;
	aircraft: readonly AircraftApplicabilityDto[];
}

export interface QuestionPromptInput {
	text: unknown;
}

export interface QuestionPromptDto {
	id: string;
	position: number;
	text: string;
}

export interface QuestionOptionInput {
	text: unknown;
	isCorrect?: unknown;
	semanticValue?: unknown;
}

export interface PersistedQuestionOptionDto {
	id: string;
	position: number;
	text: string;
	isCorrect: boolean;
	semanticValue: 'true' | 'false' | 'compound' | 'all' | 'none' | null;
}

export interface CanonicalDisplayChoiceDto {
	letter: 'A' | 'B' | 'C' | 'D';
	text: string;
	isCorrect?: boolean;
}

export interface CanonicalQuestionDisplayDto {
	questionType: QuestionType;
	prompt: string;
	choices: readonly CanonicalDisplayChoiceDto[];
	keyLetter?: 'A' | 'B' | 'C' | 'D';
}

export interface LegacyQuestionLinkInput {
	legacyTpoId: unknown;
	legacySpoId: unknown;
	legacyEoId: unknown;
}

export interface LegacyQuestionLinkDto {
	legacyTpoId: string;
	legacySpoId: string;
	legacyEoId: string;
}

export interface FutureQuestionLinkInput {
	subtaskVersionId: unknown;
	elementVersionId?: unknown;
}

export interface FutureQuestionLinkDto {
	questionVersionId: string;
	subtaskVersionId: string;
	elementVersionId: string | null;
	status: FutureLinkStatus;
	proposedByUserId: string;
	proposedAt: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
}

export interface FutureCurriculumOptionDto {
	subtaskVersionId: string;
	subtaskName: string;
	elementVersionId: string | null;
	elementName: string | null;
	ancestryLabel: string;
}

export interface PrivilegedQuestionDetailDto extends QuestionVersionSummaryDto {
	prompts: readonly QuestionPromptDto[];
	options: readonly PersistedQuestionOptionDto[];
	display: CanonicalQuestionDisplayDto;
	aircraft: readonly AircraftApplicabilityDto[];
	legacyCurriculum: readonly LegacyQuestionLinkDto[];
	futureCurriculum: readonly FutureQuestionLinkDto[];
	dependencies: QuestionDependencyResult;
}

export interface CreateQuestionCommand {
	questionType: unknown;
	prompts: readonly QuestionPromptInput[];
	options: readonly QuestionOptionInput[];
	aircraftVariantIds: readonly unknown[];
	legacyCurriculumLinks?: readonly LegacyQuestionLinkInput[];
	futureCurriculumLinks?: readonly FutureQuestionLinkInput[];
}

export interface UpdateQuestionDraftCommand extends CreateQuestionCommand {
	versionId: string;
	expectedVersion: number;
}

export interface CreateQuestionVersionCommand {
	questionId: string;
	fromVersionId: string;
}

export interface SubmitQuestionReviewCommand {
	versionId: string;
}

export interface ReviewQuestionVersionCommand {
	versionId: string;
	decision: 'approve' | 'return';
	rationale: unknown;
}

export interface PublishQuestionVersionCommand {
	versionId: string;
	effectiveFrom: unknown;
	effectiveTo?: unknown;
}

export interface RetireQuestionVersionCommand {
	versionId: string;
	reason: unknown;
	expectedDependencyRevision: string;
}

export interface DeleteQuestionDraftCommand {
	versionId: string;
	expectedDependencyRevision: string;
}

export interface ProposeFutureQuestionLinkCommand extends FutureQuestionLinkInput {
	questionVersionId: string;
}

export interface DecideFutureQuestionLinkCommand {
	questionVersionId: string;
	subtaskVersionId: string;
	decision: 'approve' | 'retire';
	rationale: unknown;
}

export interface QuestionSearchQuery {
	search?: unknown;
	types?: readonly unknown[];
	lifecycles?: readonly unknown[];
	generationStatuses?: readonly unknown[];
	aircraftVariantIds?: readonly unknown[];
	futureLinkStatuses?: readonly unknown[];
	page?: unknown;
	pageSize?: unknown;
}

export interface QuestionSearchResult {
	items: readonly SafeQuestionListItemDto[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export type QuestionDependencyKind =
	| 'historical_performance'
	| 'exam_snapshot'
	| 'future_curriculum_link'
	| 'legacy_curriculum_link'
	| 'published_version';

export interface QuestionDependencyResult {
	operation: 'delete' | 'retire' | 'edit';
	items: readonly { kind: QuestionDependencyKind; count: number; blocking: boolean }[];
	totalCount: number;
	blocksHardDelete: boolean;
	requiresRetirement: boolean;
	revision: string;
}

export type GenerationEligibilityReason =
	| 'not_published'
	| 'question_not_effective'
	| 'aircraft_not_effective'
	| 'future_link_review_required'
	| 'parent_chain_invalid'
	| 'retired';

export interface GenerationEligibilityResult {
	eligible: boolean;
	status: GenerationStatus;
	reasons: readonly GenerationEligibilityReason[];
	effectiveAircraftCount: number;
	approvedFutureLinkCount: number;
	validFutureLinkCount: number;
}

export interface FieldError {
	field: string;
	message: string;
}

export type QuestionErrorCode =
	| 'invalid_input'
	| 'invalid_question_type'
	| 'invalid_question_shape'
	| 'unauthenticated'
	| 'forbidden'
	| 'answer_key_forbidden'
	| 'not_found'
	| 'conflict'
	| 'stale_version'
	| 'invalid_transition'
	| 'distinct_reviewer_required'
	| 'referenced_immutable'
	| 'aircraft_not_effective'
	| 'parent_chain_invalid'
	| 'curriculum_not_published'
	| 'effective_range_invalid'
	| 'future_link_review_required'
	| 'future_link_conflict'
	| 'dependency_exists'
	| 'dependency_changed'
	| 'unavailable';

export type QuestionMutationResult<T> =
	{ ok: true; value: T } | { ok: false; error: QuestionErrorCode; fields?: readonly FieldError[] };

export type QuestionReadResult<T> =
	{ ok: true; value: T } | { ok: false; error: QuestionErrorCode };

export interface QuestionClock {
	now(): Date;
}

export interface QuestionIdFactory {
	create(): string;
}

export interface QuestionAuditInput {
	actorUserId: string;
	action: string;
	entityType: string;
	entityId: string;
	occurredAt: Date;
	before?: Readonly<Record<string, unknown>> | null;
	after?: Readonly<Record<string, unknown>> | null;
}

export interface QuestionServiceDependencies {
	clock: QuestionClock;
	ids: QuestionIdFactory;
	recordAuditEvent(tx: FoundationDatabase, event: QuestionAuditInput): void;
}

export interface ValidatedQuestionContent {
	questionType: QuestionType;
	prompts: readonly string[];
	options: readonly Omit<PersistedQuestionOptionDto, 'id'>[];
}
