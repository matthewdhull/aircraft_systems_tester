import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	CurriculumService,
	defaultCurriculumDependencies,
	type CurriculumAuditInput,
	type CurriculumNodeDto
} from '../../../src/lib/server/curriculum/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';

const AT = new Date('2026-07-13T16:00:00.000Z');
const AUTHOR = '10000000-0000-4000-8000-000000000001';
const REVIEWER = '10000000-0000-4000-8000-000000000002';
const PUBLISHER = '10000000-0000-4000-8000-000000000003';

let database: DatabaseHandle;
let service: CurriculumService;
let sequence: number;
let audits: CurriculumAuditInput[];

function user(id: string, employeeNumber: string): void {
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, 'Synthetic', 'User', 'active', ?, ?)`
		)
		.run(id, employeeNumber, AT.toISOString(), AT.toISOString());
}

function createService(record = (_tx: unknown, event: CurriculumAuditInput) => audits.push(event)) {
	return new CurriculumService(
		database,
		defaultCurriculumDependencies({
			clock: { now: () => AT },
			ids: {
				create: () => `20000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`
			},
			recordAuditEvent: record
		})
	);
}

function createNode(
	type: 'phase' | 'task' | 'subtask' | 'element',
	parentVersionId: string | null,
	name: string = type
): CurriculumNodeDto {
	const result = service.createNode(AUTHOR, { type, parentVersionId, name });
	expect(result.ok).toBe(true);
	if (!result.ok) throw new Error(result.error);
	return result.value;
}

function approveAndPublish(node: CurriculumNodeDto): CurriculumNodeDto {
	const id = node.latestVersion.id;
	expect(service.submitForReview(AUTHOR, id).ok).toBe(true);
	expect(
		service.reviewVersion(REVIEWER, { versionId: id, decision: 'approve', rationale: 'Reviewed' })
			.ok
	).toBe(true);
	const result = service.publishVersion(PUBLISHER, {
		versionId: id,
		effectiveFrom: AT.toISOString()
	});
	expect(result.ok).toBe(true);
	if (!result.ok) throw new Error(result.error);
	return result.value;
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	user(AUTHOR, '00001');
	user(REVIEWER, '00002');
	user(PUBLISHER, '00003');
	sequence = 10;
	audits = [];
	service = createService();
});

afterEach(() => database.close());

describe('curriculum hierarchy and immutable identity', () => {
	it('creates UUID identities and all four hierarchy levels as version-one drafts', () => {
		const phase = createNode('phase', null, 'Phase');
		const task = createNode('task', phase.latestVersion.id, 'Task');
		const subtask = createNode('subtask', task.latestVersion.id, 'Subtask');
		const element = createNode('element', subtask.latestVersion.id, 'Element');

		expect(element.latestVersion).toMatchObject({ version: 1, status: 'draft' });
		expect(service.hierarchy().phases[0]?.tasks[0]?.subtasks[0]?.elements[0]?.id).toBe(element.id);
		expect(new Set([phase.id, task.id, subtask.id, element.id]).size).toBe(4);
		expect(audits.map((event) => event.action)).toEqual([
			'curriculum.node.created',
			'curriculum.node.created',
			'curriculum.node.created',
			'curriculum.node.created'
		]);
	});

	it('rejects wrong parent types and blank server-side input', () => {
		const phase = createNode('phase', null);
		expect(
			service.createNode(AUTHOR, {
				type: 'subtask',
				parentVersionId: phase.latestVersion.id,
				name: 'Wrong parent'
			})
		).toEqual({ ok: false, error: 'parent_chain_invalid' });
		expect(
			service.createNode(AUTHOR, { type: 'phase', parentVersionId: null, name: ' ' })
		).toMatchObject({ ok: false, error: 'invalid_input' });
	});
});

describe('version review, publication, and retirement', () => {
	it('requires a fresh distinct approval and a publisher distinct from the author', () => {
		const phase = createNode('phase', null);
		const id = phase.latestVersion.id;
		expect(service.submitForReview(AUTHOR, id).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, { versionId: id, decision: 'return', rationale: 'Revise' })
		).toMatchObject({
			ok: true,
			value: { latestVersion: { reviewedByUserId: null, reviewedAt: null } }
		});
		expect(service.submitForReview(AUTHOR, id).ok).toBe(true);
		expect(
			service.publishVersion(PUBLISHER, { versionId: id, effectiveFrom: AT.toISOString() })
		).toEqual({ ok: false, error: 'distinct_reviewer_required' });
		expect(
			service.reviewVersion(REVIEWER, { versionId: id, decision: 'approve', rationale: 'Approved' })
				.ok
		).toBe(true);
		expect(
			service.publishVersion(AUTHOR, { versionId: id, effectiveFrom: AT.toISOString() })
		).toEqual({ ok: false, error: 'distinct_reviewer_required' });
		expect(
			service.publishVersion(PUBLISHER, { versionId: id, effectiveFrom: AT.toISOString() }).ok
		).toBe(true);
	});

	it('requires a published parent chain whose effective range covers the child', () => {
		const phase = createNode('phase', null);
		const task = createNode('task', phase.latestVersion.id);
		expect(service.submitForReview(AUTHOR, task.latestVersion.id).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, {
				versionId: task.latestVersion.id,
				decision: 'approve',
				rationale: 'Approved'
			}).ok
		).toBe(true);
		expect(
			service.publishVersion(PUBLISHER, {
				versionId: task.latestVersion.id,
				effectiveFrom: AT.toISOString()
			})
		).toEqual({ ok: false, error: 'parent_not_published' });
		approveAndPublish(phase);
		expect(
			service.publishVersion(PUBLISHER, {
				versionId: task.latestVersion.id,
				effectiveFrom: AT.toISOString()
			}).ok
		).toBe(true);
	});

	it('creates a later draft without mutating published history and preserves source position', () => {
		const first = approveAndPublish(createNode('phase', null, 'First'));
		const second = approveAndPublish(createNode('phase', null, 'Second'));
		const third = approveAndPublish(createNode('phase', null, 'Third'));
		const thirdDraft = service.createDraftVersion(AUTHOR, {
			nodeId: third.id,
			fromVersionId: third.latestVersion.id
		});
		const secondDraft = service.createDraftVersion(AUTHOR, {
			nodeId: second.id,
			fromVersionId: second.latestVersion.id
		});
		const firstDraft = service.createDraftVersion(AUTHOR, {
			nodeId: first.id,
			fromVersionId: first.latestVersion.id
		});
		expect(secondDraft).toMatchObject({
			ok: true,
			value: { latestVersion: { version: 2, position: 1, status: 'draft' } }
		});
		expect(
			[firstDraft, secondDraft, thirdDraft].map(
				(result) => result.ok && result.value.latestVersion.position
			)
		).toEqual([0, 1, 2]);
		expect(
			database.sqlite
				.prepare('SELECT status FROM phase_versions WHERE id = ?')
				.pluck()
				.get(first.latestVersion.id)
		).toBe('published');
		expect(
			database.sqlite
				.prepare('SELECT status FROM phase_versions WHERE id = ?')
				.pluck()
				.get(second.latestVersion.id)
		).toBe('published');
	});

	it('rejects later drafts from non-published sources and retired identities', () => {
		const draft = createNode('phase', null, 'Draft source');
		expect(
			service.createDraftVersion(AUTHOR, {
				nodeId: draft.id,
				fromVersionId: draft.latestVersion.id
			})
		).toEqual({ ok: false, error: 'invalid_transition' });

		const published = approveAndPublish(draft);
		const preview = service.dependencyPreview('phase', published.id, 'retire');
		expect(
			service.retireVersion(PUBLISHER, {
				versionId: published.latestVersion.id,
				reason: 'Retired',
				expectedDependencyRevision: preview.revision
			}).ok
		).toBe(true);
		expect(
			service.createDraftVersion(AUTHOR, {
				nodeId: published.id,
				fromVersionId: published.latestVersion.id
			})
		).toEqual({ ok: false, error: 'invalid_transition' });
	});

	it('rejects retirement of a non-latest published version', () => {
		const published = approveAndPublish(createNode('phase', null, 'Published'));
		expect(
			service.createDraftVersion(AUTHOR, {
				nodeId: published.id,
				fromVersionId: published.latestVersion.id
			}).ok
		).toBe(true);
		const preview = service.dependencyPreview('phase', published.id, 'retire');
		expect(
			service.retireVersion(PUBLISHER, {
				versionId: published.latestVersion.id,
				reason: 'Should not retire old version',
				expectedDependencyRevision: preview.revision
			})
		).toEqual({ ok: false, error: 'conflict' });
	});

	it('retires published content using a fresh server dependency revision', () => {
		const phase = approveAndPublish(createNode('phase', null));
		const preview = service.dependencyPreview('phase', phase.id, 'retire');
		expect(
			service.retireVersion(PUBLISHER, {
				versionId: phase.latestVersion.id,
				reason: 'Superseded',
				expectedDependencyRevision: 'stale'
			})
		).toEqual({ ok: false, error: 'dependency_changed' });
		expect(
			service.retireVersion(PUBLISHER, {
				versionId: phase.latestVersion.id,
				reason: 'Superseded',
				expectedDependencyRevision: preview.revision
			})
		).toMatchObject({ ok: true, value: { latestVersion: { status: 'retired' } } });
	});
});

describe('ordering, dependencies, and rollback', () => {
	it('moves first, middle, and last siblings with contiguous collision-free positions', () => {
		const a = createNode('phase', null, 'A');
		const b = createNode('phase', null, 'B');
		const c = createNode('phase', null, 'C');
		const initial = service.hierarchy();
		const order = [c.latestVersion.id, a.latestVersion.id, b.latestVersion.id];
		const result = service.reorderSiblings(AUTHOR, {
			parentVersionId: null,
			nodeType: 'phase',
			orderedVersionIds: order,
			expectedOrderRevision: initial.rootOrderRevision
		});
		expect(result).toMatchObject({ ok: true, value: { orderedVersionIds: order } });
		expect(service.hierarchy().phases.map((item) => item.node.latestVersion.position)).toEqual([
			0, 1, 2
		]);
		expect(
			service.reorderSiblings(AUTHOR, {
				parentVersionId: null,
				nodeType: 'phase',
				orderedVersionIds: [a.latestVersion.id, b.latestVersion.id, c.latestVersion.id],
				expectedOrderRevision: initial.rootOrderRevision
			})
		).toEqual({ ok: false, error: 'stale_order' });
	});

	it('rejects mixed draft and published sibling-group reordering without writes', () => {
		const published = approveAndPublish(createNode('phase', null, 'Published'));
		const draft = createNode('phase', null, 'Draft');
		const hierarchy = service.hierarchy();
		const before = database.sqlite
			.prepare('SELECT id, position FROM phase_versions ORDER BY id')
			.all();
		expect(
			service.reorderSiblings(AUTHOR, {
				parentVersionId: null,
				nodeType: 'phase',
				orderedVersionIds: [draft.latestVersion.id],
				expectedOrderRevision: hierarchy.rootOrderRevision
			})
		).toEqual({ ok: false, error: 'referenced_immutable' });
		expect(
			database.sqlite.prepare('SELECT id, position FROM phase_versions ORDER BY id').all()
		).toEqual(before);
		expect(published.latestVersion.status).toBe('published');
	});

	it('reorders both parent groups transactionally when a draft changes parent', () => {
		const left = createNode('phase', null, 'Left');
		const right = createNode('phase', null, 'Right');
		createNode('task', left.latestVersion.id, 'A');
		const moving = createNode('task', left.latestVersion.id, 'B');
		createNode('task', right.latestVersion.id, 'C');
		const preview = service.dependencyPreview('task', moving.id, 'parent_change');
		expect(
			service.updateDraftVersion(AUTHOR, {
				versionId: moving.latestVersion.id,
				expectedVersion: 1,
				name: 'B',
				parentVersionId: right.latestVersion.id,
				expectedDependencyRevision: preview.revision
			}).ok
		).toBe(true);
		const tree = service.hierarchy();
		expect(tree.phases[0]?.tasks.map((node) => node.node.latestVersion.position)).toEqual([0]);
		expect(tree.phases[1]?.tasks.map((node) => node.node.latestVersion.position)).toEqual([0, 1]);
	});

	it('blocks draft deletion when server-derived child dependencies exist', () => {
		const phase = createNode('phase', null);
		createNode('task', phase.latestVersion.id);
		const preview = service.dependencyPreview('phase', phase.id, 'delete');
		expect(preview.items).toContainEqual({ kind: 'child_version', count: 1, blocking: true });
		expect(
			service.deleteDraft(AUTHOR, {
				versionId: phase.latestVersion.id,
				expectedDependencyRevision: preview.revision
			})
		).toEqual({ ok: false, error: 'dependency_exists' });
	});

	it('hard-deletes an unreferenced draft and rolls back when audit persistence fails', () => {
		const safe = createNode('phase', null, 'Safe');
		const preview = service.dependencyPreview('phase', safe.id, 'delete');
		expect(
			service.deleteDraft(AUTHOR, {
				versionId: safe.latestVersion.id,
				expectedDependencyRevision: preview.revision
			})
		).toEqual({ ok: true, value: { deletedVersionId: safe.latestVersion.id } });

		service = createService(() => {
			throw new Error('synthetic audit failure');
		});
		expect(
			service.createNode(AUTHOR, { type: 'phase', parentVersionId: null, name: 'Rollback' })
		).toEqual({ ok: false, error: 'unavailable' });
		expect(
			database.sqlite
				.prepare("SELECT count(*) FROM phase_versions WHERE name = 'Rollback'")
				.pluck()
				.get()
		).toBe(0);
	});

	it('deletes an unreferenced later draft while preserving its published source', () => {
		const published = approveAndPublish(createNode('phase', null, 'Published history'));
		const draft = service.createDraftVersion(AUTHOR, {
			nodeId: published.id,
			fromVersionId: published.latestVersion.id
		});
		if (!draft.ok) throw new Error(draft.error);
		const preview = service.dependencyPreview('phase', published.id, 'delete');
		expect(preview).toMatchObject({
			blocksHardDelete: false,
			requiresRetirement: false,
			items: []
		});
		expect(
			service.deleteDraft(AUTHOR, {
				versionId: draft.value.latestVersion.id,
				expectedDependencyRevision: preview.revision
			})
		).toEqual({ ok: true, value: { deletedVersionId: draft.value.latestVersion.id } });
		expect(
			database.sqlite
				.prepare('SELECT status FROM phase_versions WHERE id = ?')
				.pluck()
				.get(published.latestVersion.id)
		).toBe('published');
		expect(service.hierarchy().phases[0]?.node.latestVersion.id).toBe(published.latestVersion.id);
	});

	it('rolls back every sibling position when reorder audit persistence fails', () => {
		const first = createNode('phase', null, 'First');
		const second = createNode('phase', null, 'Second');
		const hierarchy = service.hierarchy();
		service = createService(() => {
			throw new Error('synthetic audit failure');
		});
		expect(
			service.reorderSiblings(AUTHOR, {
				parentVersionId: null,
				nodeType: 'phase',
				orderedVersionIds: [second.latestVersion.id, first.latestVersion.id],
				expectedOrderRevision: hierarchy.rootOrderRevision
			})
		).toEqual({ ok: false, error: 'unavailable' });
		expect(service.hierarchy().phases.map((item) => item.node.latestVersion.id)).toEqual([
			first.latestVersion.id,
			second.latestVersion.id
		]);
	});
});

describe('controlled Bloom vocabulary', () => {
	it('starts empty and requires published level and verb for new selections', () => {
		expect(service.listBloomVocabulary()).toEqual([]);
		const level = service.upsertBloomLevel(AUTHOR, { ordinal: 1, name: 'Synthetic level' });
		expect(level.ok).toBe(true);
		if (!level.ok) return;
		const verb = service.upsertBloomVerb(AUTHOR, {
			bloomLevelId: level.value.id,
			verb: 'Synthetic verb'
		});
		expect(verb.ok).toBe(true);
		if (!verb.ok) return;
		expect(
			service.createNode(AUTHOR, {
				type: 'phase',
				parentVersionId: null,
				name: 'P',
				bloomVerbId: verb.value.id
			})
		).toMatchObject({ ok: false, error: 'invalid_input' });
		expect(service.publishBloomLevel(AUTHOR, level.value.id).ok).toBe(true);
		expect(service.publishBloomVerb(AUTHOR, verb.value.id).ok).toBe(true);
		expect(
			service.createNode(AUTHOR, {
				type: 'phase',
				parentVersionId: null,
				name: 'P',
				bloomVerbId: verb.value.id
			}).ok
		).toBe(true);
	});

	it('rejects lower child Bloom levels and retirement does not enable new selection', () => {
		const low = service.upsertBloomLevel(AUTHOR, { ordinal: 1, name: 'Low' });
		const high = service.upsertBloomLevel(AUTHOR, { ordinal: 2, name: 'High' });
		if (!low.ok || !high.ok) throw new Error('setup failed');
		const lowVerb = service.upsertBloomVerb(AUTHOR, {
			bloomLevelId: low.value.id,
			verb: 'Low verb'
		});
		const highVerb = service.upsertBloomVerb(AUTHOR, {
			bloomLevelId: high.value.id,
			verb: 'High verb'
		});
		if (!lowVerb.ok || !highVerb.ok) throw new Error('setup failed');
		for (const id of [low.value.id, high.value.id])
			expect(service.publishBloomLevel(AUTHOR, id).ok).toBe(true);
		for (const id of [lowVerb.value.id, highVerb.value.id])
			expect(service.publishBloomVerb(AUTHOR, id).ok).toBe(true);
		const parent = service.createNode(AUTHOR, {
			type: 'phase',
			parentVersionId: null,
			name: 'Parent',
			bloomVerbId: highVerb.value.id
		});
		if (!parent.ok) throw new Error('setup failed');
		expect(
			service.createNode(AUTHOR, {
				type: 'task',
				parentVersionId: parent.value.latestVersion.id,
				name: 'Child',
				bloomVerbId: lowVerb.value.id
			})
		).toMatchObject({ ok: false, error: 'invalid_input' });
		const preview = service.dependencyPreview('bloom_verb', lowVerb.value.id, 'retire');
		expect(
			service.retireBloomVerb(AUTHOR, {
				id: lowVerb.value.id,
				reason: 'Retire',
				expectedDependencyRevision: preview.revision
			}).ok
		).toBe(true);
		expect(
			service.createNode(AUTHOR, {
				type: 'phase',
				parentVersionId: null,
				name: 'Retired selection',
				bloomVerbId: lowVerb.value.id
			})
		).toMatchObject({ ok: false, error: 'invalid_input' });
	});
});
