import type { FoundationDatabase } from '$lib/server/db/database.js';

export const LEGACY_ENTITY_TYPES = ['tpo', 'spo', 'eo'] as const;
export type LegacyEntityType = (typeof LEGACY_ENTITY_TYPES)[number];

export const CURRICULUM_NODE_TYPES = ['phase', 'task', 'subtask', 'element'] as const;
export type CurriculumNodeType = (typeof CURRICULUM_NODE_TYPES)[number];

export const MAPPING_STATUSES = ['proposed', 'approved', 'rejected', 'retired'] as const;
export type MappingStatus = (typeof MAPPING_STATUSES)[number];

export interface LegacyCurriculumNodeDto {
	id: string;
	type: LegacyEntityType;
	number: string;
	name: string;
	children: readonly LegacyCurriculumNodeDto[];
}

export interface LegacyCurriculumMappingDto {
	id: string;
	legacyEntityType: LegacyEntityType;
	legacyEntityId: string;
	targetEntityType: CurriculumNodeType;
	targetEntityId: string;
	status: MappingStatus;
	proposedByUserId: string;
	proposedAt: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	rationale: string;
}

export interface ProposeLegacyMappingCommand {
	legacyEntityType: unknown;
	legacyEntityId: unknown;
	targetEntityType: unknown;
	targetEntityId: unknown;
	rationale: unknown;
}

export interface DecideLegacyMappingCommand {
	mappingId: string;
	decision: 'approve' | 'reject';
	rationale: unknown;
}

export interface RetireLegacyMappingCommand {
	mappingId: string;
	rationale: unknown;
}

export interface FieldError {
	field: string;
	message: string;
}

export type MappingErrorCode =
	| 'invalid_input'
	| 'not_found'
	| 'conflict'
	| 'invalid_transition'
	| 'parent_chain_invalid'
	| 'mapping_conflict'
	| 'unavailable';

export type MappingMutationResult<T> =
	{ ok: true; value: T } | { ok: false; error: MappingErrorCode; fields?: readonly FieldError[] };

export interface ReconciliationCheck {
	name:
		| 'invalid_target_references'
		| 'conflicting_mappings'
		| 'broken_source_parent_chains'
		| 'broken_target_parent_chains'
		| 'importer_created_future_nodes'
		| 'mapping_question_eligibility_side_effects';
	passed: boolean;
	violationCount: number;
}

export interface CurriculumReconciliationReport {
	generatedAt: string;
	legacyTotals: Readonly<Record<LegacyEntityType, number>>;
	unmappedBySourceType: Readonly<Record<LegacyEntityType, number>>;
	statusCounts: Readonly<Record<MappingStatus, number>>;
	countsBySourceType: Readonly<Record<LegacyEntityType, Readonly<Record<MappingStatus, number>>>>;
	countsByTargetType: Readonly<Record<CurriculumNodeType, Readonly<Record<MappingStatus, number>>>>;
	checks: readonly ReconciliationCheck[];
	passed: boolean;
}

export interface CurriculumMappingClock {
	now(): Date;
}

export interface CurriculumMappingIdFactory {
	create(): string;
}

export interface MappingAuditEventInput {
	actorUserId: string;
	action: string;
	entityType: 'legacy_curriculum_mapping';
	entityId: string;
	occurredAt: Date;
	before: Readonly<Record<string, string | null>> | null;
	after: Readonly<Record<string, string | null>> | null;
}

export interface CurriculumMappingServiceDependencies {
	clock: CurriculumMappingClock;
	idFactory: CurriculumMappingIdFactory;
	recordAuditEvent(tx: FoundationDatabase, event: MappingAuditEventInput): void;
}
