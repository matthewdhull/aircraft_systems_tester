import type { FoundationDatabase } from '$lib/server/db/database.js';

export const CURRICULUM_NODE_TYPES = ['phase', 'task', 'subtask', 'element'] as const;
export type CurriculumNodeType = (typeof CURRICULUM_NODE_TYPES)[number];
export type CurriculumLifecycle = 'draft' | 'review' | 'published' | 'retired';
export type BloomLifecycle = 'draft' | 'published' | 'retired';

export interface CurriculumVersionDto {
	id: string;
	nodeId: string;
	nodeType: CurriculumNodeType;
	version: number;
	name: string;
	description: string | null;
	position: number;
	status: CurriculumLifecycle;
	parentVersionId: string | null;
	bloomVerbId: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	authoredByUserId: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	createdAt: string;
	publishedAt: string | null;
	retiredAt: string | null;
}

export interface CurriculumNodeDto {
	id: string;
	type: CurriculumNodeType;
	createdAt: string;
	retiredAt: string | null;
	latestVersion: CurriculumVersionDto;
}

export interface SubtaskHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	elements: readonly CurriculumNodeDto[];
}

export interface TaskHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	subtasks: readonly SubtaskHierarchyDto[];
}

export interface PhaseHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	tasks: readonly TaskHierarchyDto[];
}

export interface CurriculumHierarchyDto {
	generatedAt: string;
	rootOrderRevision: string;
	phases: readonly PhaseHierarchyDto[];
}

export interface CreateNodeCommand {
	type: CurriculumNodeType;
	parentVersionId: string | null;
	name: unknown;
	description?: unknown;
	bloomVerbId?: unknown;
	position?: unknown;
}

export interface CreateDraftVersionCommand {
	nodeId: string;
	fromVersionId: string;
}

export interface UpdateDraftVersionCommand {
	versionId: string;
	expectedVersion: number;
	name: unknown;
	description?: unknown;
	bloomVerbId?: unknown;
	parentVersionId?: unknown;
	expectedDependencyRevision?: string | undefined;
}

export interface ReviewVersionCommand {
	versionId: string;
	decision: 'approve' | 'return';
	rationale: unknown;
}

export interface PublishVersionCommand {
	versionId: string;
	effectiveFrom: unknown;
	effectiveTo?: unknown;
}

export interface RetireVersionCommand {
	versionId: string;
	reason: unknown;
	expectedDependencyRevision: string;
}

export interface DeleteDraftCommand {
	versionId: string;
	expectedDependencyRevision: string;
}

export interface ReorderSiblingsCommand {
	parentVersionId: string | null;
	nodeType: CurriculumNodeType;
	orderedVersionIds: readonly string[];
	expectedOrderRevision: string;
}

export interface ReorderResult {
	parentVersionId: string | null;
	nodeType: CurriculumNodeType;
	orderedVersionIds: readonly string[];
	orderRevision: string;
}

export interface BloomVerbDto {
	id: string;
	bloomLevelId: string;
	verb: string;
	status: BloomLifecycle;
	createdAt: string;
	retiredAt: string | null;
}

export interface BloomLevelDto {
	id: string;
	ordinal: number;
	name: string;
	status: BloomLifecycle;
	createdAt: string;
	retiredAt: string | null;
	verbs: readonly BloomVerbDto[];
}

export interface UpsertBloomLevelCommand {
	id?: string;
	ordinal: unknown;
	name: unknown;
}

export interface UpsertBloomVerbCommand {
	id?: string;
	bloomLevelId: unknown;
	verb: unknown;
}

export interface BloomRetireCommand {
	id: string;
	reason: unknown;
	expectedDependencyRevision: string;
}

export interface BloomDeleteCommand {
	id: string;
	expectedDependencyRevision: string;
}

export type DependencyKind =
	| 'child_version'
	| 'question_future_link'
	| 'template_rule'
	| 'template_required_element'
	| 'legacy_mapping'
	| 'published_version';

export interface DependencyWarningItem {
	kind: DependencyKind;
	count: number;
	blocking: boolean;
}

export interface DependencyWarningResult {
	entityType: CurriculumNodeType | 'bloom_level' | 'bloom_verb';
	entityId: string;
	operation: 'parent_change' | 'retire' | 'delete' | 'archive';
	items: readonly DependencyWarningItem[];
	totalCount: number;
	blocksHardDelete: boolean;
	requiresRetirement: boolean;
	revision: string;
}

export interface FieldError {
	field: string;
	message: string;
}

export type CurriculumErrorCode =
	| 'invalid_input'
	| 'not_found'
	| 'conflict'
	| 'stale_version'
	| 'stale_order'
	| 'invalid_transition'
	| 'distinct_reviewer_required'
	| 'parent_chain_invalid'
	| 'parent_not_published'
	| 'effective_range_invalid'
	| 'dependency_exists'
	| 'dependency_changed'
	| 'referenced_immutable'
	| 'unavailable';

export type CurriculumMutationResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: CurriculumErrorCode; fields?: readonly FieldError[] };

export interface CurriculumClock {
	now(): Date;
}

export interface CurriculumIdFactory {
	create(): string;
}

export interface CurriculumAuditInput {
	actorUserId: string;
	action: string;
	entityType: string;
	entityId: string;
	occurredAt: Date;
	before?: Readonly<Record<string, unknown>> | null;
	after?: Readonly<Record<string, unknown>> | null;
}

export interface CurriculumServiceDependencies {
	clock: CurriculumClock;
	ids: CurriculumIdFactory;
	recordAuditEvent(tx: FoundationDatabase, event: CurriculumAuditInput): void;
}
