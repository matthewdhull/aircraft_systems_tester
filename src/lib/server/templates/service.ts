import { randomUUID } from 'node:crypto';

import { recordAuditEvent } from '$lib/server/audit/index.js';
import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import {
	capacity,
	authoringOptions,
	findTemplateVersion,
	latestTemplateVersion,
	listLegacySources,
	listTemplateVersions,
	templateDependency,
	validateCurriculum
} from './repository.js';
import type {
	CapacityResult,
	LegacyTemplateSourceDto,
	TemplateDependencies,
	TemplateDraftInput,
	TemplateResult,
	TemplateVersionDto
} from './types.js';
import { validateTemplateDraft, type ValidatedTemplateDraft } from './validation.js';

function fail<T>(error: Exclude<TemplateResult<T>, { ok: true }>['error']): TemplateResult<T> {
	return { ok: false, error };
}

function audit(
	dependencies: TemplateDependencies,
	tx: FoundationDatabase,
	actorUserId: string,
	action: string,
	version: TemplateVersionDto,
	status?: string
): void {
	dependencies.recordAudit(tx, {
		actorUserId,
		action,
		entityId: version.versionId,
		occurredAt: dependencies.clock.now(),
		version: version.version,
		...(status ? { status } : {})
	});
}

function insertDraft(
	tx: FoundationDatabase,
	dependencies: TemplateDependencies,
	actorUserId: string,
	templateId: string,
	version: number,
	input: ValidatedTemplateDraft
): TemplateVersionDto {
	const versionId = dependencies.uuid();
	const at = dependencies.clock.now().toISOString();
	tx.$client
		.prepare(
			`INSERT INTO test_template_versions
			 (id,test_template_id,version,name,aircraft_variant_id,course_type_id,configured_length,
			 allotted_minutes,lifecycle,authored_by_user_id,created_at)
			 VALUES (?,?,?,?,?,?,?,?,'draft',?,?)`
		)
		.run(
			versionId,
			templateId,
			version,
			input.name,
			input.aircraftVariantId,
			input.courseTypeId,
			input.configuredLength,
			input.allottedMinutes,
			actorUserId,
			at
		);
	const ruleInsert = tx.$client.prepare(
		`INSERT INTO test_template_rules (id,test_template_version_id,subtask_version_id,question_count,position)
		 VALUES (?,?,?,?,?)`
	);
	input.rules.forEach((rule, position) =>
		ruleInsert.run(dependencies.uuid(), versionId, rule.subtaskVersionId, rule.count, position)
	);
	const requiredInsert = tx.$client.prepare(
		`INSERT INTO test_template_required_elements
		 (id,test_template_version_id,element_version_id,subtask_version_id,position) VALUES (?,?,?,?,?)`
	);
	input.mandatoryElements.forEach((item, position) =>
		requiredInsert.run(
			dependencies.uuid(),
			versionId,
			item.elementVersionId,
			item.subtaskVersionId,
			position
		)
	);
	return findTemplateVersion(tx, versionId)!;
}

export class TemplateService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: TemplateDependencies
	) {}

	list(): readonly TemplateVersionDto[] {
		return listTemplateVersions(this.database.db);
	}

	detail(templateId: string, versionId?: string): TemplateResult<TemplateVersionDto> {
		const value = versionId
			? findTemplateVersion(this.database.db, versionId)
			: latestTemplateVersion(this.database.db, templateId);
		return value && value.templateId === templateId ? { ok: true, value } : fail('not_found');
	}

	create(actorUserId: string, input: TemplateDraftInput): TemplateResult<TemplateVersionDto> {
		const parsed = validateTemplateDraft(input);
		if (!parsed.ok) return { ok: false, error: 'invalid_input', fields: parsed.fields };
		try {
			return this.database.transaction((tx) => {
				if (!validateCurriculum(tx, parsed.value.rules, parsed.value.mandatoryElements, this.now()))
					return fail('invalid_input');
				const templateId = this.dependencies.uuid();
				tx.$client
					.prepare('INSERT INTO test_templates (id,created_at) VALUES (?,?)')
					.run(templateId, this.now());
				const value = insertDraft(tx, this.dependencies, actorUserId, templateId, 1, parsed.value);
				audit(this.dependencies, tx, actorUserId, 'template.created', value, 'draft');
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}

	updateDraft(
		actorUserId: string,
		versionId: string,
		input: TemplateDraftInput
	): TemplateResult<TemplateVersionDto> {
		const parsed = validateTemplateDraft(input);
		if (!parsed.ok) return { ok: false, error: 'invalid_input', fields: parsed.fields };
		try {
			return this.database.transaction((tx) => {
				const existing = findTemplateVersion(tx, versionId);
				if (!existing) return fail('not_found');
				if (existing.lifecycle !== 'draft') return fail('immutable');
				if (!validateCurriculum(tx, parsed.value.rules, parsed.value.mandatoryElements, this.now()))
					return fail('invalid_input');
				tx.$client
					.prepare(
						`UPDATE test_template_versions SET name=?,aircraft_variant_id=?,course_type_id=?,
						 configured_length=?,allotted_minutes=? WHERE id=? AND lifecycle='draft'`
					)
					.run(
						parsed.value.name,
						parsed.value.aircraftVariantId,
						parsed.value.courseTypeId,
						parsed.value.configuredLength,
						parsed.value.allottedMinutes,
						versionId
					);
				tx.$client
					.prepare('DELETE FROM test_template_required_elements WHERE test_template_version_id=?')
					.run(versionId);
				tx.$client
					.prepare('DELETE FROM test_template_rules WHERE test_template_version_id=?')
					.run(versionId);
				const value = insertDraftChildren(tx, this.dependencies, existing, parsed.value);
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}

	createNextDraft(actorUserId: string, versionId: string): TemplateResult<TemplateVersionDto> {
		try {
			return this.database.transaction((tx) => {
				const source = findTemplateVersion(tx, versionId);
				if (!source) return fail('not_found');
				if (!['published', 'retired'].includes(source.lifecycle)) return fail('conflict');
				const existingDraft = tx.$client
					.prepare(
						"SELECT 1 FROM test_template_versions WHERE test_template_id=? AND lifecycle IN ('draft','review')"
					)
					.get(source.templateId);
				if (existingDraft) return fail('conflict');
				const value = insertDraft(
					tx,
					this.dependencies,
					actorUserId,
					source.templateId,
					source.version + 1,
					{
						name: source.name,
						aircraftVariantId: source.aircraftVariantId,
						courseTypeId: source.courseTypeId,
						configuredLength: source.configuredLength,
						allottedMinutes: source.allottedMinutes,
						rules: source.rules,
						mandatoryElements: source.mandatoryElements
					}
				);
				audit(this.dependencies, tx, actorUserId, 'template.created', value, 'draft');
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}

	submit(actorUserId: string, versionId: string): TemplateResult<TemplateVersionDto> {
		return this.transition(actorUserId, versionId, 'draft', 'review', 'template.submitted');
	}

	returnToDraft(actorUserId: string, versionId: string): TemplateResult<TemplateVersionDto> {
		return this.transition(actorUserId, versionId, 'review', 'draft', 'template.returned', true);
	}

	publish(
		actorUserId: string,
		versionId: string,
		effectiveFrom: unknown,
		effectiveTo?: unknown
	): TemplateResult<TemplateVersionDto> {
		const from = date(effectiveFrom);
		const to = effectiveTo == null || effectiveTo === '' ? null : date(effectiveTo);
		if (!from || (effectiveTo != null && effectiveTo !== '' && !to) || (to && to <= from))
			return fail('invalid_input');
		try {
			return this.database.transaction((tx) => {
				const current = findTemplateVersion(tx, versionId);
				if (!current) return fail('not_found');
				if (current.lifecycle !== 'review') return fail('conflict');
				if (current.authoredByUserId === actorUserId) return fail('distinct_reviewer_required');
				const available = capacity(tx, current, this.now());
				if (available.status === 'insufficient') return fail('capacity_insufficient');
				const at = this.now();
				tx.$client
					.prepare(
						`UPDATE test_template_versions SET lifecycle='published',reviewed_by_user_id=?,reviewed_at=?,published_at=?,effective_from=?,effective_to=? WHERE id=? AND lifecycle='review'`
					)
					.run(actorUserId, at, at, from, to, versionId);
				const value = findTemplateVersion(tx, versionId)!;
				audit(this.dependencies, tx, actorUserId, 'template.published', value, 'published');
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}

	retire(actorUserId: string, versionId: string): TemplateResult<TemplateVersionDto> {
		return this.transition(actorUserId, versionId, 'published', 'retired', 'template.retired');
	}

	deleteDraft(
		actorUserId: string,
		versionId: string,
		expectedRevision: string
	): TemplateResult<true> {
		try {
			return this.database.transaction((tx) => {
				const current = findTemplateVersion(tx, versionId);
				if (!current) return fail('not_found');
				if (current.lifecycle !== 'draft') return fail('immutable');
				const dependency = templateDependency(tx, versionId);
				if (dependency.revision !== expectedRevision) return fail('dependency_changed');
				if (dependency.blocksHardDelete) return fail('draft_referenced');
				tx.$client.prepare('DELETE FROM test_template_versions WHERE id=?').run(versionId);
				if (
					Number(
						tx.$client
							.prepare('SELECT count(*) FROM test_template_versions WHERE test_template_id=?')
							.pluck()
							.get(current.templateId)
					) === 0
				)
					tx.$client.prepare('DELETE FROM test_templates WHERE id=?').run(current.templateId);
				audit(this.dependencies, tx, actorUserId, 'template.deleted', current, 'draft');
				return { ok: true, value: true };
			});
		} catch {
			return fail('unavailable');
		}
	}

	capacity(versionId: string): TemplateResult<CapacityResult> {
		const template = findTemplateVersion(this.database.db, versionId);
		return template
			? { ok: true, value: capacity(this.database.db, template, this.now()) }
			: fail('not_found');
	}

	dependencyPreview(versionId: string) {
		return templateDependency(this.database.db, versionId);
	}
	legacySources(): readonly LegacyTemplateSourceDto[] {
		return listLegacySources(this.database.db);
	}
	authoringOptions() {
		return authoringOptions(this.database.db, this.now());
	}

	adoptLegacy(
		actorUserId: string,
		sourceId: string,
		input: TemplateDraftInput
	): TemplateResult<TemplateVersionDto> {
		const parsed = validateTemplateDraft(input);
		if (!parsed.ok) return { ok: false, error: 'invalid_input', fields: parsed.fields };
		try {
			return this.database.transaction((tx) => {
				const source = tx.$client
					.prepare('SELECT reconciliation_state FROM legacy_template_sources WHERE id=?')
					.get(sourceId) as { reconciliation_state: string } | undefined;
				if (!source) return fail('not_found');
				if (source.reconciliation_state === 'mapped') return fail('conflict');
				if (!validateCurriculum(tx, parsed.value.rules, parsed.value.mandatoryElements, this.now()))
					return fail('invalid_input');
				const templateId = this.dependencies.uuid();
				tx.$client
					.prepare('INSERT INTO test_templates (id,created_at) VALUES (?,?)')
					.run(templateId, this.now());
				const value = insertDraft(tx, this.dependencies, actorUserId, templateId, 1, parsed.value);
				tx.$client
					.prepare(
						`UPDATE legacy_template_sources SET reconciliation_state='mapped',mapped_template_version_id=?,adopted_by_user_id=?,adopted_at=? WHERE id=?`
					)
					.run(value.versionId, actorUserId, this.now(), sourceId);
				audit(this.dependencies, tx, actorUserId, 'template.legacy_adopted', value, 'draft');
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}

	private now(): string {
		return this.dependencies.clock.now().toISOString();
	}

	private transition(
		actorUserId: string,
		versionId: string,
		from: string,
		to: string,
		action: string,
		clearReview = false
	): TemplateResult<TemplateVersionDto> {
		try {
			return this.database.transaction((tx) => {
				const current = findTemplateVersion(tx, versionId);
				if (!current) return fail('not_found');
				if (current.lifecycle !== from)
					return fail(from === 'draft' && current.lifecycle !== 'draft' ? 'immutable' : 'conflict');
				const at = this.now();
				if (to === 'review')
					tx.$client
						.prepare(
							`UPDATE test_template_versions SET lifecycle='review',submitted_at=? WHERE id=?`
						)
						.run(at, versionId);
				else if (to === 'retired')
					tx.$client
						.prepare(
							`UPDATE test_template_versions SET lifecycle='retired',retired_at=? WHERE id=?`
						)
						.run(at, versionId);
				else
					tx.$client
						.prepare(
							`UPDATE test_template_versions SET lifecycle='draft',submitted_at=NULL,reviewed_by_user_id=NULL,reviewed_at=NULL WHERE id=?`
						)
						.run(versionId);
				void clearReview;
				const value = findTemplateVersion(tx, versionId)!;
				audit(this.dependencies, tx, actorUserId, action, value, to);
				return { ok: true, value };
			});
		} catch {
			return fail('unavailable');
		}
	}
}

function insertDraftChildren(
	tx: FoundationDatabase,
	dependencies: TemplateDependencies,
	existing: TemplateVersionDto,
	input: ValidatedTemplateDraft
): TemplateVersionDto {
	const rules = tx.$client.prepare(
		'INSERT INTO test_template_rules (id,test_template_version_id,subtask_version_id,question_count,position) VALUES (?,?,?,?,?)'
	);
	input.rules.forEach((item, position) =>
		rules.run(dependencies.uuid(), existing.versionId, item.subtaskVersionId, item.count, position)
	);
	const mandatory = tx.$client.prepare(
		'INSERT INTO test_template_required_elements (id,test_template_version_id,element_version_id,subtask_version_id,position) VALUES (?,?,?,?,?)'
	);
	input.mandatoryElements.forEach((item, position) =>
		mandatory.run(
			dependencies.uuid(),
			existing.versionId,
			item.elementVersionId,
			item.subtaskVersionId,
			position
		)
	);
	return findTemplateVersion(tx, existing.versionId)!;
}

function date(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const parsed = new Date(value);
	return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

export function defaultTemplateDependencies(): TemplateDependencies {
	return {
		clock: { now: () => new Date() },
		uuid: randomUUID,
		recordAudit: (tx, event) =>
			recordAuditEvent(tx, {
				actorUserId: event.actorUserId,
				action: event.action,
				entityType: 'test_template_version',
				entityId: event.entityId,
				occurredAt: event.occurredAt,
				after: {
					...(event.status ? { status: event.status } : {}),
					...(event.version ? { version: event.version } : {})
				}
			})
	};
}

export function createTemplateService(database: DatabaseHandle): TemplateService {
	return new TemplateService(database, defaultTemplateDependencies());
}
