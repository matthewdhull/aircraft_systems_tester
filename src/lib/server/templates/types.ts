import type { FoundationDatabase } from '$lib/server/db/database.js';

export type TemplateLifecycle = 'draft' | 'review' | 'published' | 'retired';
export type LegacyTemplateSourceKind = 'test_model' | 'testModel';
export type TemplateErrorCode =
	| 'invalid_input'
	| 'not_found'
	| 'conflict'
	| 'immutable'
	| 'distinct_reviewer_required'
	| 'draft_referenced'
	| 'dependency_changed'
	| 'capacity_insufficient'
	| 'unavailable';

export interface TemplateRuleInput {
	subtaskVersionId: unknown;
	count: unknown;
}

export interface MandatoryElementInput {
	elementVersionId: unknown;
	subtaskVersionId: unknown;
}

export interface TemplateDraftInput {
	name: unknown;
	aircraftVariantId: unknown;
	courseTypeId?: unknown;
	configuredLength: unknown;
	allottedMinutes: unknown;
	rules: readonly TemplateRuleInput[];
	mandatoryElements?: readonly MandatoryElementInput[];
}

export interface TemplateRuleDto {
	id: string;
	position: number;
	subtaskVersionId: string;
	subtaskName: string;
	count: number;
}

export interface MandatoryElementRequirementDto {
	position: number;
	elementVersionId: string;
	elementName: string;
	subtaskVersionId: string;
}

export interface TemplateVersionDto {
	templateId: string;
	versionId: string;
	version: number;
	name: string;
	aircraftVariantId: string;
	aircraftLabel: string;
	courseTypeId: string | null;
	courseTypeLabel: string | null;
	configuredLength: number;
	allottedMinutes: number;
	lifecycle: TemplateLifecycle;
	authoredByUserId: string | null;
	reviewedByUserId: string | null;
	createdAt: string;
	submittedAt: string | null;
	reviewedAt: string | null;
	publishedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	retiredAt: string | null;
	rules: readonly TemplateRuleDto[];
	mandatoryElements: readonly MandatoryElementRequirementDto[];
}

export interface CapacityShortage {
	code: 'CATEGORY_SHORTAGE' | 'MANDATORY_ELEMENT_SHORTAGE';
	ruleId?: string;
	elementVersionId?: string;
	needed: number;
	available: number;
}

export interface CapacityResult {
	status: 'sufficient' | 'insufficient';
	ruleCapacity: readonly { ruleId: string; needed: number; available: number }[];
	mandatoryCapacity: readonly {
		elementVersionId: string;
		needed: 1;
		available: number;
	}[];
	shortages: readonly CapacityShortage[];
}

export interface TemplateDependencyResult {
	examCount: number;
	publishedVersionCount: number;
	blocksHardDelete: boolean;
	requiresRetirement: boolean;
	revision: string;
}

export interface TemplateFieldError {
	field: string;
	message: string;
}

export type TemplateResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: TemplateErrorCode; fields?: readonly TemplateFieldError[] };

export interface TemplateDependencies {
	clock: { now(): Date };
	uuid(): string;
	recordAudit(
		tx: FoundationDatabase,
		event: {
			actorUserId: string;
			action: string;
			entityId: string;
			occurredAt: Date;
			status?: string;
			version?: number;
		}
	): void;
}

export interface LegacyTemplateSourceDto {
	id: string;
	sourceKind: LegacyTemplateSourceKind;
	sourceId: string;
	logicalName: string | null;
	configuredLength: number | null;
	reconciliationState: 'unreviewed' | 'mapped' | 'ambiguous' | 'retired';
	mappedTemplateVersionId: string | null;
}

export interface TemplateAuthoringOptions {
	aircraft: readonly { id: string; label: string }[];
	courseTypes: readonly { id: string; label: string }[];
	subtasks: readonly {
		id: string;
		label: string;
		elements: readonly { id: string; label: string }[];
	}[];
}
