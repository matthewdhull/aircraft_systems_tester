import { randomUUID } from 'node:crypto';

import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import {
	approvedMappingConflict,
	decideMapping,
	findMapping,
	insertMapping,
	listLegacyHierarchy,
	listMappings,
	mappingPairExists,
	retireMapping,
	sourceExistsWithValidChain,
	targetHasValidPublishedChain,
	targetIdentityExists
} from './repository.js';
import { reconcileCurriculumMappings } from './reconciliation.js';
import type {
	CurriculumMappingServiceDependencies,
	CurriculumReconciliationReport,
	DecideLegacyMappingCommand,
	LegacyCurriculumMappingDto,
	LegacyCurriculumNodeDto,
	MappingMutationResult,
	ProposeLegacyMappingCommand,
	RetireLegacyMappingCommand
} from './types.js';
import {
	fieldErrors,
	validateLegacyEntityType,
	validateRationale,
	validateTargetEntityType,
	validateUuid
} from './validation.js';

function unavailable<T>(): MappingMutationResult<T> {
	return { ok: false, error: 'unavailable' };
}

function statusMetadata(mapping: LegacyCurriculumMappingDto, decision?: string) {
	return {
		sourceType: mapping.legacyEntityType,
		targetType: mapping.targetEntityType,
		status: mapping.status,
		...(decision ? { decision } : {})
	};
}

export class CurriculumMappingService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: CurriculumMappingServiceDependencies
	) {}

	listLegacyHierarchy(): readonly LegacyCurriculumNodeDto[] {
		return listLegacyHierarchy(this.database.db);
	}

	listMappings(): readonly LegacyCurriculumMappingDto[] {
		return listMappings(this.database.db);
	}

	reconcile(): CurriculumReconciliationReport {
		return reconcileCurriculumMappings(this.database.db, this.dependencies.clock);
	}

	propose(
		actorUserId: string,
		command: ProposeLegacyMappingCommand
	): MappingMutationResult<LegacyCurriculumMappingDto> {
		const actor = validateUuid('actorUserId', actorUserId);
		const legacyType = validateLegacyEntityType(command.legacyEntityType);
		const legacyId = validateUuid('legacyEntityId', command.legacyEntityId);
		const targetType = validateTargetEntityType(command.targetEntityType);
		const targetId = validateUuid('targetEntityId', command.targetEntityId);
		const rationale = validateRationale(command.rationale);
		const errors = fieldErrors([
			actor.error,
			legacyType.error,
			legacyId.error,
			targetType.error,
			targetId.error,
			rationale.error
		]);
		if (errors || !legacyType.value || !targetType.value) {
			return { ok: false, error: 'invalid_input', ...(errors ? { fields: errors } : {}) };
		}

		try {
			return this.database.transaction((tx) => {
				if (!sourceExistsWithValidChain(tx, legacyType.value!, legacyId.value)) {
					return { ok: false, error: 'parent_chain_invalid' };
				}
				if (!targetIdentityExists(tx, targetType.value!, targetId.value)) {
					return { ok: false, error: 'not_found' };
				}
				if (
					mappingPairExists(
						tx,
						legacyType.value!,
						legacyId.value,
						targetType.value!,
						targetId.value
					)
				) {
					return { ok: false, error: 'conflict' };
				}
				const occurredAt = this.validNow();
				const mapping: LegacyCurriculumMappingDto = {
					id: this.dependencies.idFactory.create(),
					legacyEntityType: legacyType.value!,
					legacyEntityId: legacyId.value,
					targetEntityType: targetType.value!,
					targetEntityId: targetId.value,
					status: 'proposed',
					proposedByUserId: actor.value,
					proposedAt: occurredAt.toISOString(),
					reviewedByUserId: null,
					reviewedAt: null,
					rationale: rationale.value
				};
				insertMapping(tx, mapping);
				this.audit(tx, actor.value, 'curriculum.mapping.proposed', mapping, occurredAt, null);
				return { ok: true, value: mapping };
			});
		} catch {
			return unavailable();
		}
	}

	decide(
		actorUserId: string,
		command: DecideLegacyMappingCommand
	): MappingMutationResult<LegacyCurriculumMappingDto> {
		const actor = validateUuid('actorUserId', actorUserId);
		const mappingId = validateUuid('mappingId', command.mappingId);
		const rationale = validateRationale(command.rationale);
		const decisionValid = command.decision === 'approve' || command.decision === 'reject';
		const errors = fieldErrors([
			actor.error,
			mappingId.error,
			rationale.error,
			decisionValid ? undefined : { field: 'decision', message: 'Select a valid mapping decision.' }
		]);
		if (errors) return { ok: false, error: 'invalid_input', fields: errors };

		try {
			return this.database.transaction((tx) => {
				const before = findMapping(tx, mappingId.value);
				if (!before) return { ok: false, error: 'not_found' };
				if (before.status !== 'proposed') return { ok: false, error: 'invalid_transition' };
				if (command.decision === 'approve') {
					if (!sourceExistsWithValidChain(tx, before.legacyEntityType, before.legacyEntityId)) {
						return { ok: false, error: 'parent_chain_invalid' };
					}
					if (!targetIdentityExists(tx, before.targetEntityType, before.targetEntityId)) {
						return { ok: false, error: 'not_found' };
					}
					const now = this.validNow();
					if (
						!targetHasValidPublishedChain(
							tx,
							before.targetEntityType,
							before.targetEntityId,
							now.toISOString()
						)
					) {
						return { ok: false, error: 'parent_chain_invalid' };
					}
					if (approvedMappingConflict(tx, before)) {
						return { ok: false, error: 'mapping_conflict' };
					}
					return this.applyDecision(tx, actor.value, before, 'approved', rationale.value, now);
				}
				return this.applyDecision(
					tx,
					actor.value,
					before,
					'rejected',
					rationale.value,
					this.validNow()
				);
			});
		} catch {
			return unavailable();
		}
	}

	retire(
		actorUserId: string,
		command: RetireLegacyMappingCommand
	): MappingMutationResult<LegacyCurriculumMappingDto> {
		const actor = validateUuid('actorUserId', actorUserId);
		const mappingId = validateUuid('mappingId', command.mappingId);
		const rationale = validateRationale(command.rationale);
		const errors = fieldErrors([actor.error, mappingId.error, rationale.error]);
		if (errors) return { ok: false, error: 'invalid_input', fields: errors };

		try {
			return this.database.transaction((tx) => {
				const before = findMapping(tx, mappingId.value);
				if (!before) return { ok: false, error: 'not_found' };
				if (before.status !== 'approved') return { ok: false, error: 'invalid_transition' };
				const occurredAt = this.validNow();
				if (!retireMapping(tx, before.id, actor.value, occurredAt.toISOString(), rationale.value)) {
					return { ok: false, error: 'invalid_transition' };
				}
				const after = findMapping(tx, before.id)!;
				this.audit(
					tx,
					actor.value,
					'curriculum.mapping.retired',
					after,
					occurredAt,
					before,
					'retire'
				);
				return { ok: true, value: after };
			});
		} catch {
			return unavailable();
		}
	}

	private applyDecision(
		tx: FoundationDatabase,
		actorUserId: string,
		before: LegacyCurriculumMappingDto,
		status: 'approved' | 'rejected',
		rationale: string,
		occurredAt: Date
	): MappingMutationResult<LegacyCurriculumMappingDto> {
		if (!decideMapping(tx, before.id, status, actorUserId, occurredAt.toISOString(), rationale)) {
			return { ok: false, error: 'invalid_transition' };
		}
		const after = findMapping(tx, before.id)!;
		const decision = status === 'approved' ? 'approve' : 'reject';
		this.audit(
			tx,
			actorUserId,
			`curriculum.mapping.${status}`,
			after,
			occurredAt,
			before,
			decision
		);
		return { ok: true, value: after };
	}

	private audit(
		tx: FoundationDatabase,
		actorUserId: string,
		action: string,
		after: LegacyCurriculumMappingDto,
		occurredAt: Date,
		before: LegacyCurriculumMappingDto | null,
		decision?: string
	): void {
		this.dependencies.recordAuditEvent(tx, {
			actorUserId,
			action,
			entityType: 'legacy_curriculum_mapping',
			entityId: after.id,
			occurredAt,
			before: before ? statusMetadata(before) : null,
			after: statusMetadata(after, decision)
		});
	}

	private validNow(): Date {
		const now = this.dependencies.clock.now();
		if (!Number.isFinite(now.getTime())) throw new TypeError('Invalid curriculum mapping clock.');
		return now;
	}
}

export function defaultCurriculumMappingServiceDependencies(
	overrides: Pick<CurriculumMappingServiceDependencies, 'recordAuditEvent'> &
		Partial<Omit<CurriculumMappingServiceDependencies, 'recordAuditEvent'>>
): CurriculumMappingServiceDependencies {
	return {
		clock: overrides.clock ?? { now: () => new Date() },
		idFactory: overrides.idFactory ?? { create: randomUUID },
		recordAuditEvent: overrides.recordAuditEvent
	};
}
