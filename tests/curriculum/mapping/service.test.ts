import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';
import {
	CurriculumMappingService,
	createCurriculumMappingService,
	renderCurriculumReconciliationJson,
	type CurriculumMappingServiceDependencies,
	type MappingAuditEventInput
} from '../../../src/lib/server/curriculum-mapping/index.js';
import { importLegacyDump } from '../../../src/lib/server/migration/importer/index.js';

const AT = new Date('2026-07-13T18:00:00.000Z');
const EFFECTIVE = '2026-01-01T00:00:00.000Z';
const ACTOR_ID = '10000000-0000-4000-8000-000000000001';
const REVIEWER_ID = '10000000-0000-4000-8000-000000000002';
const AUTHOR_ID = '10000000-0000-4000-8000-000000000003';
const RUN_ID = '20000000-0000-4000-8000-000000000001';
const TPO_ID = '30000000-0000-4000-8000-000000000001';
const SPO_ID = '30000000-0000-4000-8000-000000000002';
const EO_ID = '30000000-0000-4000-8000-000000000003';
const PHASE_ID = '40000000-0000-4000-8000-000000000001';
const PHASE_VERSION_ID = '41000000-0000-4000-8000-000000000001';
const SECOND_PHASE_ID = '40000000-0000-4000-8000-000000000002';
const SECOND_PHASE_VERSION_ID = '41000000-0000-4000-8000-000000000002';
const TASK_ID = '42000000-0000-4000-8000-000000000001';
const TASK_VERSION_ID = '42100000-0000-4000-8000-000000000001';
const SUBTASK_ID = '43000000-0000-4000-8000-000000000001';
const SUBTASK_VERSION_ID = '43100000-0000-4000-8000-000000000001';
const ELEMENT_ID = '44000000-0000-4000-8000-000000000001';
const ELEMENT_VERSION_ID = '44100000-0000-4000-8000-000000000001';

let database: DatabaseHandle;
let service: CurriculumMappingService;
let dependencies: CurriculumMappingServiceDependencies;
let auditEvents: MappingAuditEventInput[];
let nextId: number;

function insertUser(id: string, employeeNumber: string): void {
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, 'Synthetic', 'Reviewer', 'active', ?, ?)`
		)
		.run(id, employeeNumber, AT.toISOString(), AT.toISOString());
}

function seedLegacyHierarchy(): void {
	database.sqlite
		.prepare(
			`INSERT INTO import_runs
			 (id, importer_version, source_checksum, source_byte_size, status, started_at, completed_at)
			 VALUES (?, 'test', ?, 1, 'completed', ?, ?)`
		)
		.run(RUN_ID, 'a'.repeat(64), AT.toISOString(), AT.toISOString());
	database.sqlite
		.prepare(
			'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
		)
		.run(TPO_ID, 'legacy-tpo-1', '1', 'Legacy objective', RUN_ID);
	database.sqlite
		.prepare(
			`INSERT INTO legacy_spos
			 (id, source_id, legacy_tpo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(SPO_ID, 'legacy-spo-1', TPO_ID, '1.1', 'Legacy supporting objective', RUN_ID);
	database.sqlite
		.prepare(
			`INSERT INTO legacy_eos
			 (id, source_id, legacy_spo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(EO_ID, 'legacy-eo-1', SPO_ID, '1.1.1', 'Legacy enabling objective', RUN_ID);
}

function insertPhase(id: string, versionId: string, position: number, status = 'published'): void {
	database.sqlite
		.prepare('INSERT INTO phases (id, created_at) VALUES (?, ?)')
		.run(id, AT.toISOString());
	database.sqlite
		.prepare(
			`INSERT INTO phase_versions
			 (id, phase_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, 1, 'Future phase', ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			versionId,
			id,
			position,
			status,
			status === 'published' ? EFFECTIVE : null,
			AUTHOR_ID,
			status === 'published' ? REVIEWER_ID : null,
			status === 'published' ? AT.toISOString() : null,
			AT.toISOString(),
			status === 'published' ? AT.toISOString() : null
		);
}

function seedPublishedDescendantHierarchy(): void {
	const timestamp = AT.toISOString();
	for (const [table, id] of [
		['tasks', TASK_ID],
		['subtasks', SUBTASK_ID],
		['elements', ELEMENT_ID]
	] as const) {
		database.sqlite
			.prepare(`INSERT INTO ${table} (id, created_at) VALUES (?, ?)`)
			.run(id, timestamp);
	}
	const reviewValues = [AUTHOR_ID, REVIEWER_ID, timestamp, timestamp, timestamp];
	database.sqlite
		.prepare(
			`INSERT INTO task_versions
			 (id, task_id, phase_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Future task', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(TASK_VERSION_ID, TASK_ID, PHASE_VERSION_ID, EFFECTIVE, ...reviewValues);
	database.sqlite
		.prepare(
			`INSERT INTO subtask_versions
			 (id, subtask_id, task_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Future subtask', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(SUBTASK_VERSION_ID, SUBTASK_ID, TASK_VERSION_ID, EFFECTIVE, ...reviewValues);
	database.sqlite
		.prepare(
			`INSERT INTO element_versions
			 (id, element_id, subtask_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Future element', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(ELEMENT_VERSION_ID, ELEMENT_ID, SUBTASK_VERSION_ID, EFFECTIVE, ...reviewValues);
}

function command(targetId = PHASE_ID) {
	return {
		legacyEntityType: 'tpo',
		legacyEntityId: TPO_ID,
		targetEntityType: 'phase',
		targetEntityId: targetId,
		rationale: 'Reviewed correspondence based on approved source material.'
	};
}

function proposedId(result: ReturnType<CurriculumMappingService['propose']>): string {
	if (!result.ok) throw new Error('Expected proposal to succeed.');
	return result.value.id;
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	insertUser(ACTOR_ID, '00001');
	insertUser(REVIEWER_ID, '00002');
	insertUser(AUTHOR_ID, '00003');
	seedLegacyHierarchy();
	insertPhase(PHASE_ID, PHASE_VERSION_ID, 0);
	auditEvents = [];
	nextId = 1;
	dependencies = {
		clock: { now: () => AT },
		idFactory: {
			create: () => `50000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`
		},
		recordAuditEvent: (_tx, event) => auditEvents.push(event)
	};
	service = new CurriculumMappingService(database, dependencies);
});

afterEach(() => database.close());

describe('legacy curriculum reads', () => {
	it('returns a deterministic read-only TPO/SPO/EO hierarchy', () => {
		expect(service.listLegacyHierarchy()).toEqual([
			expect.objectContaining({
				id: TPO_ID,
				type: 'tpo',
				children: [
					expect.objectContaining({
						id: SPO_ID,
						type: 'spo',
						children: [expect.objectContaining({ id: EO_ID, type: 'eo', children: [] })]
					})
				]
			})
		]);
	});
});

describe('explicit mapping review lifecycle', () => {
	it('creates only a proposed mapping with proposal attribution and safe audit metadata', () => {
		const result = service.propose(ACTOR_ID, command());

		expect(result).toMatchObject({
			ok: true,
			value: {
				status: 'proposed',
				proposedByUserId: ACTOR_ID,
				proposedAt: AT.toISOString(),
				reviewedByUserId: null,
				reviewedAt: null
			}
		});
		expect(auditEvents).toEqual([
			expect.objectContaining({
				action: 'curriculum.mapping.proposed',
				after: { sourceType: 'tpo', targetType: 'phase', status: 'proposed' }
			})
		]);
		expect(
			database.sqlite
				.prepare("SELECT count(*) FROM legacy_curriculum_mappings WHERE status <> 'proposed'")
				.pluck()
				.get()
		).toBe(0);
	});

	it('composes the real append-only audit writer without persisting rationale or source IDs', () => {
		const result = createCurriculumMappingService(database).propose(ACTOR_ID, command());
		expect(result.ok).toBe(true);
		const event = database.sqlite
			.prepare(
				`SELECT action, actor_user_id, before_json, after_json
				 FROM audit_events WHERE action = 'curriculum.mapping.proposed'`
			)
			.get() as Record<string, string | null>;
		expect(event).toMatchObject({
			action: 'curriculum.mapping.proposed',
			actor_user_id: ACTOR_ID,
			before_json: null
		});
		expect(JSON.parse(String(event.after_json))).toEqual({
			sourceType: 'tpo',
			targetType: 'phase',
			status: 'proposed'
		});
		expect(event.after_json).not.toContain(TPO_ID);
		expect(event.after_json).not.toContain('Reviewed correspondence');
	});

	it('requires an explicit approval with reviewer, time, and nonblank rationale', () => {
		const mappingId = proposedId(service.propose(ACTOR_ID, command()));
		const result = service.decide(REVIEWER_ID, {
			mappingId,
			decision: 'approve',
			rationale: '  Confirmed during curriculum review.  '
		});

		expect(result).toMatchObject({
			ok: true,
			value: {
				status: 'approved',
				reviewedByUserId: REVIEWER_ID,
				reviewedAt: AT.toISOString(),
				rationale: 'Confirmed during curriculum review.'
			}
		});
		expect(auditEvents.at(-1)).toMatchObject({
			action: 'curriculum.mapping.approved',
			after: { sourceType: 'tpo', targetType: 'phase', status: 'approved', decision: 'approve' }
		});
	});

	it('supports attributable rejection without requiring an invalid target to become publishable', () => {
		const mappingId = proposedId(service.propose(ACTOR_ID, command()));
		const result = service.decide(REVIEWER_ID, {
			mappingId,
			decision: 'reject',
			rationale: 'Does not represent the same learning outcome.'
		});

		expect(result).toMatchObject({
			ok: true,
			value: { status: 'rejected', reviewedByUserId: REVIEWER_ID }
		});
		expect(
			service.decide(REVIEWER_ID, { mappingId, decision: 'approve', rationale: 'Retry' })
		).toEqual({ ok: false, error: 'invalid_transition' });
	});

	it('retires only an approved mapping and attributes the retirement', () => {
		const mappingId = proposedId(service.propose(ACTOR_ID, command()));
		expect(service.retire(REVIEWER_ID, { mappingId, rationale: 'Too early to retire.' })).toEqual({
			ok: false,
			error: 'invalid_transition'
		});
		expect(
			service.decide(REVIEWER_ID, {
				mappingId,
				decision: 'approve',
				rationale: 'Approved.'
			}).ok
		).toBe(true);
		expect(
			service.retire(ACTOR_ID, { mappingId, rationale: 'Superseded after reviewed change.' })
		).toMatchObject({
			ok: true,
			value: { status: 'retired', reviewedByUserId: ACTOR_ID }
		});
		expect(auditEvents.at(-1)?.action).toBe('curriculum.mapping.retired');
	});

	it('rejects blank/invalid fields and never auto-approves', () => {
		expect(
			service.propose(ACTOR_ID, { ...command(), legacyEntityType: 'unknown', rationale: ' ' })
		).toMatchObject({ ok: false, error: 'invalid_input' });
		expect(
			service.propose(ACTOR_ID, {
				...command(),
				targetEntityId: '40000000-0000-4000-8000-999999999999'
			})
		).toEqual({
			ok: false,
			error: 'not_found'
		});
		expect(service.listMappings()).toEqual([]);
	});

	it('requires a currently published target and a complete target chain for approval', () => {
		const draftId = '40000000-0000-4000-8000-000000000003';
		insertPhase(draftId, '41000000-0000-4000-8000-000000000003', 1, 'draft');
		const mappingId = proposedId(service.propose(ACTOR_ID, command(draftId)));

		expect(
			service.decide(REVIEWER_ID, {
				mappingId,
				decision: 'approve',
				rationale: 'Target is not publishable.'
			})
		).toEqual({ ok: false, error: 'parent_chain_invalid' });
	});

	it('approves an Element target only through its complete published Phase/Task/Subtask chain', () => {
		seedPublishedDescendantHierarchy();
		const mappingId = proposedId(
			service.propose(ACTOR_ID, {
				legacyEntityType: 'eo',
				legacyEntityId: EO_ID,
				targetEntityType: 'element',
				targetEntityId: ELEMENT_ID,
				rationale: 'Element-level semantic review.'
			})
		);

		expect(
			service.decide(REVIEWER_ID, {
				mappingId,
				decision: 'approve',
				rationale: 'Full target chain reviewed.'
			})
		).toMatchObject({ ok: true, value: { status: 'approved', targetEntityType: 'element' } });
	});

	it('prevents conflicting approved mappings for one source and target type', () => {
		insertPhase(SECOND_PHASE_ID, SECOND_PHASE_VERSION_ID, 1);
		const first = proposedId(service.propose(ACTOR_ID, command()));
		const second = proposedId(service.propose(ACTOR_ID, command(SECOND_PHASE_ID)));
		expect(
			service.decide(REVIEWER_ID, {
				mappingId: first,
				decision: 'approve',
				rationale: 'First reviewed target.'
			}).ok
		).toBe(true);
		expect(
			service.decide(REVIEWER_ID, {
				mappingId: second,
				decision: 'approve',
				rationale: 'Conflicting reviewed target.'
			})
		).toEqual({ ok: false, error: 'mapping_conflict' });
	});

	it('rolls back the mapping mutation when audit persistence fails', () => {
		dependencies.recordAuditEvent = () => {
			throw new Error('synthetic audit failure');
		};
		service = new CurriculumMappingService(database, dependencies);

		expect(service.propose(ACTOR_ID, command())).toEqual({ ok: false, error: 'unavailable' });
		expect(service.listMappings()).toEqual([]);
	});

	it('does not create future question links or change question eligibility on approval', () => {
		const mappingId = proposedId(service.propose(ACTOR_ID, command()));
		expect(
			service.decide(REVIEWER_ID, {
				mappingId,
				decision: 'approve',
				rationale: 'Approved mapping only.'
			}).ok
		).toBe(true);
		expect(
			database.sqlite.prepare('SELECT count(*) FROM question_future_curriculum_links').pluck().get()
		).toBe(0);
		expect(
			database.sqlite
				.prepare("SELECT count(*) FROM question_versions WHERE generation_status = 'eligible'")
				.pluck()
				.get()
		).toBe(0);
	});
});

describe('safe deterministic reconciliation', () => {
	it('reports complete zero-filled counts and safe invariant confirmations deterministically', () => {
		const report = service.reconcile();
		expect(report).toMatchObject({
			legacyTotals: { tpo: 1, spo: 1, eo: 1 },
			unmappedBySourceType: { tpo: 1, spo: 1, eo: 1 },
			statusCounts: { proposed: 0, approved: 0, rejected: 0, retired: 0 },
			passed: true
		});
		expect(report.checks).toEqual([
			{ name: 'invalid_target_references', passed: true, violationCount: 0 },
			{ name: 'conflicting_mappings', passed: true, violationCount: 0 },
			{ name: 'broken_source_parent_chains', passed: true, violationCount: 0 },
			{ name: 'broken_target_parent_chains', passed: true, violationCount: 0 },
			{ name: 'importer_created_future_nodes', passed: true, violationCount: 0 },
			{ name: 'mapping_question_eligibility_side_effects', passed: true, violationCount: 0 }
		]);
		expect(renderCurriculumReconciliationJson(service.reconcile())).toBe(
			renderCurriculumReconciliationJson(report)
		);
		expect(renderCurriculumReconciliationJson(report)).not.toContain(TPO_ID);
		expect(renderCurriculumReconciliationJson(report)).not.toContain(PHASE_ID);
	});

	it('detects invalid, orphaned, conflicting, stale, and importer-created mapping state by count', () => {
		insertPhase(SECOND_PHASE_ID, SECOND_PHASE_VERSION_ID, 1);
		const draftPhaseId = '40000000-0000-4000-8000-000000000004';
		insertPhase(draftPhaseId, '41000000-0000-4000-8000-000000000004', 2, 'draft');
		const approvedId = proposedId(service.propose(ACTOR_ID, command()));
		expect(
			service.decide(REVIEWER_ID, {
				mappingId: approvedId,
				decision: 'approve',
				rationale: 'Approved primary target.'
			}).ok
		).toBe(true);

		const insert = database.sqlite.prepare(
			`INSERT INTO legacy_curriculum_mappings
			 (id, legacy_entity_type, legacy_entity_id, target_entity_type, target_entity_id,
			  status, proposed_by_user_id, proposed_at, reviewed_by_user_id, reviewed_at, rationale)
			 VALUES (?, 'tpo', ?, 'phase', ?, ?, ?, ?, ?, ?, 'Synthetic reconciliation state')`
		);
		insert.run(
			'50000000-0000-4000-8000-000000000010',
			TPO_ID,
			SECOND_PHASE_ID,
			'approved',
			ACTOR_ID,
			AT.toISOString(),
			REVIEWER_ID,
			AT.toISOString()
		);
		insert.run(
			'50000000-0000-4000-8000-000000000011',
			TPO_ID,
			draftPhaseId,
			'approved',
			ACTOR_ID,
			AT.toISOString(),
			REVIEWER_ID,
			AT.toISOString()
		);
		insert.run(
			'50000000-0000-4000-8000-000000000012',
			'30000000-0000-4000-8000-999999999999',
			'40000000-0000-4000-8000-999999999999',
			'proposed',
			ACTOR_ID,
			AT.toISOString(),
			null,
			null
		);
		database.sqlite
			.prepare(
				`INSERT INTO source_target_mappings
				 (id, import_run_id, source_table, source_id, target_table, target_id, mapping_kind)
				 VALUES (?, ?, 'TPO', 'legacy-tpo-1', 'phases', ?, 'direct')`
			)
			.run('60000000-0000-4000-8000-000000000001', RUN_ID, PHASE_ID);

		const checks = Object.fromEntries(
			service.reconcile().checks.map((item) => [item.name, item.violationCount])
		);
		expect(checks).toMatchObject({
			invalid_target_references: 1,
			conflicting_mappings: 2,
			broken_source_parent_chains: 1,
			broken_target_parent_chains: 1,
			importer_created_future_nodes: 1
		});
		expect(service.reconcile().passed).toBe(false);
	});
});

describe('Phase 3 importer boundary regression', () => {
	it('imports no future hierarchy, Bloom, mapping, link, or eligible-question rows', async () => {
		database.close();
		database = openDatabase({ path: ':memory:' });
		const fixture = resolve('fixtures/phase-1/legacy-source/data.sql');
		await importLegacyDump(database, {
			path: fixture,
			sha256: createHash('sha256').update(readFileSync(fixture)).digest('hex'),
			byteSize: statSync(fixture).size
		});

		for (const table of [
			'phases',
			'phase_versions',
			'tasks',
			'task_versions',
			'subtasks',
			'subtask_versions',
			'elements',
			'element_versions',
			'bloom_levels',
			'bloom_verbs',
			'legacy_curriculum_mappings',
			'question_future_curriculum_links'
		]) {
			expect(database.sqlite.prepare(`SELECT count(*) FROM ${table}`).pluck().get()).toBe(0);
		}
		expect(
			database.sqlite
				.prepare("SELECT count(*) FROM question_versions WHERE generation_status = 'eligible'")
				.pluck()
				.get()
		).toBe(0);
	});
});
