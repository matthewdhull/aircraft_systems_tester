import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	QuestionService,
	defaultQuestionDependencies,
	type CreateQuestionCommand,
	type QuestionAuditInput,
	type QuestionIdentityDto
} from '../../../src/lib/server/questions/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';

const AT = new Date('2026-07-13T16:00:00.000Z');
const AUTHOR = '10000000-0000-4000-8000-000000000001';
const REVIEWER = '10000000-0000-4000-8000-000000000002';
const PUBLISHER = '10000000-0000-4000-8000-000000000003';
const AIRCRAFT = '30000000-0000-4000-8000-000000000001';

let database: DatabaseHandle;
let service: QuestionService;
let sequence: number;
let audits: QuestionAuditInput[];

function id(): string {
	return `20000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;
}

function user(userId: string, employee: string): void {
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, 'Synthetic', 'User', 'active', ?, ?)`
		)
		.run(userId, employee, AT.toISOString(), AT.toISOString());
}

function createService(record = (_tx: unknown, event: QuestionAuditInput) => audits.push(event)) {
	return new QuestionService(
		database,
		defaultQuestionDependencies({
			clock: { now: () => AT },
			ids: { create: id },
			recordAuditEvent: record
		})
	);
}

function command(overrides: Partial<CreateQuestionCommand> = {}): CreateQuestionCommand {
	return {
		questionType: 'mc',
		prompts: [{ text: 'Synthetic primary prompt' }, { text: 'Synthetic alternate prompt' }],
		options: [
			{ text: 'Synthetic keyed choice', isCorrect: true },
			{ text: 'Synthetic distractor one', isCorrect: false },
			{ text: 'Synthetic distractor two', isCorrect: false },
			{ text: 'Synthetic distractor three', isCorrect: false }
		],
		aircraftVariantIds: [AIRCRAFT],
		...overrides
	};
}

function created(overrides: Partial<CreateQuestionCommand> = {}): QuestionIdentityDto {
	const result = service.createQuestion(AUTHOR, command(overrides));
	expect(result.ok).toBe(true);
	if (!result.ok) throw new Error(result.error);
	return result.value;
}

function seedPublishedCurriculum(): { subtaskVersionId: string; elementVersionId: string } {
	const phase = id();
	const phaseVersion = id();
	const task = id();
	const taskVersion = id();
	const subtask = id();
	const subtaskVersion = id();
	const element = id();
	const elementVersion = id();
	const at = AT.toISOString();
	database.sqlite.prepare('INSERT INTO phases (id, created_at) VALUES (?, ?)').run(phase, at);
	database.sqlite
		.prepare(
			`INSERT INTO phase_versions
			 (id, phase_id, version, name, position, status, effective_from, authored_by_user_id,
			  reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, 1, 'Synthetic phase', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(phaseVersion, phase, at, AUTHOR, REVIEWER, at, at, at);
	database.sqlite.prepare('INSERT INTO tasks (id, created_at) VALUES (?, ?)').run(task, at);
	database.sqlite
		.prepare(
			`INSERT INTO task_versions
			 (id, task_id, phase_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic task', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(taskVersion, task, phaseVersion, at, AUTHOR, REVIEWER, at, at, at);
	database.sqlite.prepare('INSERT INTO subtasks (id, created_at) VALUES (?, ?)').run(subtask, at);
	database.sqlite
		.prepare(
			`INSERT INTO subtask_versions
			 (id, subtask_id, task_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic subtask', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(subtaskVersion, subtask, taskVersion, at, AUTHOR, REVIEWER, at, at, at);
	database.sqlite.prepare('INSERT INTO elements (id, created_at) VALUES (?, ?)').run(element, at);
	database.sqlite
		.prepare(
			`INSERT INTO element_versions
			 (id, element_id, subtask_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic element', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(elementVersion, element, subtaskVersion, at, AUTHOR, REVIEWER, at, at, at);
	return { subtaskVersionId: subtaskVersion, elementVersionId: elementVersion };
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	sequence = 10;
	audits = [];
	user(AUTHOR, '00001');
	user(REVIEWER, '00002');
	user(PUBLISHER, '00003');
	database.sqlite
		.prepare(
			`INSERT INTO aircraft_variants
			 (id, code, name, effective_from, status, created_at)
			 VALUES (?, 'SYN', 'Synthetic aircraft', '2020-01-01T00:00:00.000Z', 'active', ?)`
		)
		.run(AIRCRAFT, AT.toISOString());
	service = createService();
});

afterEach(() => database.close());

describe('question identity, safe projections, and version ownership', () => {
	it('creates an immutable UUID identity with ordered prompts/options and safe search', () => {
		const question = created();
		expect(question.latestVersion).toMatchObject({
			version: 1,
			questionType: 'single_choice',
			lifecycle: 'draft',
			promptCount: 2,
			aircraftCount: 1,
			generationStatus: 'blocked'
		});
		const detail = service.detail(question.id);
		expect(detail.ok && detail.value.display.keyLetter).toBe('A');
		expect(detail.ok && detail.value.prompts.map((item) => item.position)).toEqual([0, 1]);

		const list = service.search({ search: 'PRIMARY', types: ['MC'] });
		expect(list.totalItems).toBe(1);
		const payload = JSON.stringify(list);
		expect(payload).not.toContain('Synthetic keyed choice');
		expect(payload).not.toContain('isCorrect');
		expect(payload).not.toContain('semanticValue');
		expect(payload).not.toContain('keyLetter');
	});

	it('updates only drafts, enforces expected version, and preserves published history in a new version', () => {
		const question = created();
		const versionId = question.latestVersion.id;
		expect(
			service.updateDraft(AUTHOR, {
				...command({ prompts: [{ text: 'Revised prompt' }] }),
				versionId,
				expectedVersion: 2
			})
		).toEqual({ ok: false, error: 'stale_version' });
		expect(
			service.updateDraft(AUTHOR, {
				...command({ prompts: [{ text: 'Revised prompt' }] }),
				versionId,
				expectedVersion: 1
			}).ok
		).toBe(true);
		expect(service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, {
				versionId,
				decision: 'approve',
				rationale: 'Synthetic review'
			}).ok
		).toBe(true);
		expect(
			service.publishVersion(PUBLISHER, { versionId, effectiveFrom: AT.toISOString() }).ok
		).toBe(true);
		expect(service.updateDraft(AUTHOR, { ...command(), versionId, expectedVersion: 1 })).toEqual({
			ok: false,
			error: 'referenced_immutable'
		});
		const next = service.createVersion(AUTHOR, {
			questionId: question.id,
			fromVersionId: versionId
		});
		expect(next.ok && next.value.latestVersion).toMatchObject({ version: 2, lifecycle: 'draft' });
		expect(service.detail(question.id, { versionId }).ok).toBe(true);
	});

	it('adopts an imported review version only by creating an attributable draft', () => {
		const imported = created();
		database.sqlite
			.prepare(
				"UPDATE question_versions SET lifecycle = 'review', authored_by_user_id = NULL WHERE id = ?"
			)
			.run(imported.latestVersion.id);
		expect(
			service.reviewVersion(REVIEWER, {
				versionId: imported.latestVersion.id,
				decision: 'approve',
				rationale: 'Must adopt'
			})
		).toEqual({ ok: false, error: 'invalid_transition' });
		const adopted = service.createVersion(AUTHOR, {
			questionId: imported.id,
			fromVersionId: imported.latestVersion.id
		});
		expect(adopted.ok && adopted.value.latestVersion).toMatchObject({
			version: 2,
			lifecycle: 'draft',
			authoredByUserId: AUTHOR
		});
	});

	it('replaces unreviewed draft future links but preserves reviewed link history', () => {
		const curriculum = seedPublishedCurriculum();
		const question = created({ futureCurriculumLinks: [curriculum] });
		const versionId = question.latestVersion.id;
		expect(
			service.updateDraft(AUTHOR, {
				...command({ futureCurriculumLinks: [] }),
				versionId,
				expectedVersion: 1
			}).ok
		).toBe(true);
		expect(service.detail(question.id)).toMatchObject({
			ok: true,
			value: { futureCurriculum: [] }
		});
		expect(
			service.proposeFutureLink(AUTHOR, {
				questionVersionId: versionId,
				...curriculum
			}).ok
		).toBe(true);
		expect(
			service.decideFutureLink(REVIEWER, {
				questionVersionId: versionId,
				subtaskVersionId: curriculum.subtaskVersionId,
				decision: 'approve',
				rationale: 'Reviewed'
			}).ok
		).toBe(true);
		expect(
			service.updateDraft(AUTHOR, {
				...command({ futureCurriculumLinks: [] }),
				versionId,
				expectedVersion: 1
			})
		).toEqual({ ok: false, error: 'referenced_immutable' });
	});
});

describe('review, publication, dependencies, and transaction ownership', () => {
	it('requires a distinct reviewer and publisher and supports return to draft', () => {
		const question = created();
		const versionId = question.latestVersion.id;
		expect(service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
		expect(
			service.reviewVersion(AUTHOR, { versionId, decision: 'approve', rationale: 'Self' })
		).toEqual({ ok: false, error: 'distinct_reviewer_required' });
		expect(
			service.reviewVersion(REVIEWER, { versionId, decision: 'return', rationale: 'Revise' }).ok
		).toBe(true);
		expect(service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, { versionId, decision: 'approve', rationale: 'Approved' }).ok
		).toBe(true);
		expect(service.publishVersion(AUTHOR, { versionId, effectiveFrom: AT.toISOString() })).toEqual({
			ok: false,
			error: 'distinct_reviewer_required'
		});
		expect(
			service.publishVersion(PUBLISHER, { versionId, effectiveFrom: AT.toISOString() }).ok
		).toBe(true);
	});

	it('hard-deletes only an unreferenced draft using a fresh dependency revision', () => {
		const question = created({ legacyCurriculumLinks: [] });
		const preview = service.dependencyPreview(question.latestVersion.id, 'delete');
		expect(preview.ok && preview.value.blocksHardDelete).toBe(false);
		expect(
			service.deleteDraft(AUTHOR, {
				versionId: question.latestVersion.id,
				expectedDependencyRevision: 'stale'
			})
		).toEqual({ ok: false, error: 'dependency_changed' });
		if (!preview.ok) throw new Error(preview.error);
		expect(
			service.deleteDraft(AUTHOR, {
				versionId: question.latestVersion.id,
				expectedDependencyRevision: preview.value.revision
			}).ok
		).toBe(true);
		expect(service.versionSummary(question.id)).toEqual({ ok: false, error: 'not_found' });
	});

	it('rolls back content and audit as one outer transaction', () => {
		service = createService(() => {
			throw new Error('synthetic audit failure');
		});
		expect(service.createQuestion(AUTHOR, command())).toEqual({ ok: false, error: 'unavailable' });
		expect(database.sqlite.prepare('SELECT count(*) FROM questions').pluck().get()).toBe(0);
		expect(database.sqlite.prepare('SELECT count(*) FROM question_versions').pluck().get()).toBe(0);
	});

	it('records only allow-listed count/status audit metadata without answer material', () => {
		service = new QuestionService(
			database,
			defaultQuestionDependencies({ clock: { now: () => AT }, ids: { create: id } })
		);
		expect(service.createQuestion(AUTHOR, command()).ok).toBe(true);
		const stored = database.sqlite
			.prepare(
				'SELECT action, before_json AS beforeJson, after_json AS afterJson FROM audit_events'
			)
			.all() as Array<{ action: string; beforeJson: string | null; afterJson: string | null }>;
		expect(stored).toHaveLength(1);
		expect(stored[0]?.action).toBe('question.created');
		const payload = JSON.stringify(stored);
		expect(payload).not.toContain('Synthetic primary prompt');
		expect(payload).not.toContain('Synthetic keyed choice');
		expect(payload).not.toContain('isCorrect');
		expect(payload).not.toContain('semanticValue');
	});
});

describe('future curriculum review and derived eligibility', () => {
	it('requires explicit distinct link approval and derives eligibility transactionally', () => {
		const curriculum = seedPublishedCurriculum();
		expect(service.futureCurriculumOptions()).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					subtaskVersionId: curriculum.subtaskVersionId,
					elementVersionId: null
				}),
				expect.objectContaining({
					subtaskVersionId: curriculum.subtaskVersionId,
					elementVersionId: curriculum.elementVersionId
				})
			])
		);
		const question = created({ futureCurriculumLinks: [curriculum] });
		const versionId = question.latestVersion.id;
		expect(service.deriveGenerationEligibility(versionId)).toMatchObject({
			ok: true,
			value: { status: 'blocked' }
		});
		expect(
			service.decideFutureLink(AUTHOR, {
				questionVersionId: versionId,
				subtaskVersionId: curriculum.subtaskVersionId,
				decision: 'approve',
				rationale: 'Self'
			})
		).toEqual({ ok: false, error: 'distinct_reviewer_required' });
		expect(
			service.decideFutureLink(REVIEWER, {
				questionVersionId: versionId,
				subtaskVersionId: curriculum.subtaskVersionId,
				decision: 'approve',
				rationale: 'Explicit link review'
			}).ok
		).toBe(true);
		expect(service.deriveGenerationEligibility(versionId)).toMatchObject({
			ok: true,
			value: { status: 'blocked', approvedFutureLinkCount: 1, validFutureLinkCount: 1 }
		});
		expect(service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, {
				versionId,
				decision: 'approve',
				rationale: 'Question review'
			}).ok
		).toBe(true);
		const published = service.publishVersion(PUBLISHER, {
			versionId,
			effectiveFrom: AT.toISOString()
		});
		expect(published.ok && published.value.latestVersion.generationStatus).toBe('eligible');
		expect(
			service.proposeFutureLink(PUBLISHER, {
				questionVersionId: versionId,
				...curriculum
			})
		).toEqual({ ok: false, error: 'referenced_immutable' });
		const linkRetired = service.decideFutureLink(PUBLISHER, {
			questionVersionId: versionId,
			subtaskVersionId: curriculum.subtaskVersionId,
			decision: 'retire',
			rationale: 'Applicability ended'
		});
		expect(linkRetired).toMatchObject({ ok: true, value: { status: 'retired' } });
		expect(service.versionSummary(question.id)).toMatchObject({
			ok: true,
			value: { generationStatus: 'blocked' }
		});
		const preview = service.dependencyPreview(versionId, 'retire');
		if (!preview.ok) throw new Error(preview.error);
		const retired = service.retireVersion(PUBLISHER, {
			versionId,
			reason: 'Synthetic retirement',
			expectedDependencyRevision: preview.value.revision
		});
		expect(retired.ok && retired.value.latestVersion).toMatchObject({
			lifecycle: 'retired',
			generationStatus: 'blocked'
		});
		expect(audits.map((event) => event.action)).toContain('question.eligibility.changed');
	});

	it('rejects unpublished or mismatched curriculum ancestry and inactive aircraft publication', () => {
		const curriculum = seedPublishedCurriculum();
		database.sqlite
			.prepare("UPDATE element_versions SET status = 'retired', retired_at = ? WHERE id = ?")
			.run(AT.toISOString(), curriculum.elementVersionId);
		expect(
			service.createQuestion(AUTHOR, command({ futureCurriculumLinks: [curriculum] }))
		).toEqual({ ok: false, error: 'curriculum_not_published' });
		const question = created();
		const versionId = question.latestVersion.id;
		expect(service.submitReview(AUTHOR, { versionId }).ok).toBe(true);
		expect(
			service.reviewVersion(REVIEWER, { versionId, decision: 'approve', rationale: 'Review' }).ok
		).toBe(true);
		database.sqlite
			.prepare("UPDATE aircraft_variants SET status = 'retired' WHERE id = ?")
			.run(AIRCRAFT);
		expect(
			service.publishVersion(PUBLISHER, { versionId, effectiveFrom: AT.toISOString() })
		).toEqual({ ok: false, error: 'aircraft_not_effective' });
	});
});
