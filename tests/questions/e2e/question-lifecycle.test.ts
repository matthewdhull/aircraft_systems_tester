import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { actions as listActions } from '../../../src/routes/questions/+page.server.js';
import {
	actions as detailActions,
	load as detailLoad
} from '../../../src/routes/questions/[id]/+page.server.js';
import {
	PERMISSIONS,
	type AuthenticatedPrincipal,
	type PermissionCode
} from '../../../src/lib/server/authorization/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { createCurriculumService } from '../../../src/lib/server/curriculum/index.js';
import { createQuestionService } from '../../../src/lib/server/questions/index.js';

const AT = '2026-07-13T12:00:00.000Z';
const AUTHOR = '62000000-0000-4000-8000-000000000001';
const REVIEWER = '62000000-0000-4000-8000-000000000002';
const PUBLISHER = '62000000-0000-4000-8000-000000000003';
const AIRCRAFT = '62000000-0000-4000-8000-000000000004';
const LEGACY_RUN = '62000000-0000-4000-8000-000000000005';
const LEGACY_TPO = '62000000-0000-4000-8000-000000000006';
const LEGACY_SPO = '62000000-0000-4000-8000-000000000007';
const LEGACY_EO = '62000000-0000-4000-8000-000000000008';

let database: DatabaseHandle;
let sequence: number;

function id(): string {
	return `62000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;
}

function principal(userId: string, permissions: readonly PermissionCode[]): AuthenticatedPrincipal {
	return {
		userId,
		employeeNumber: userId === AUTHOR ? '062001' : userId === REVIEWER ? '062002' : '062003',
		displayName: 'Synthetic Lifecycle Principal',
		roles: [],
		permissions: new Set(permissions),
		sessionIdHash: userId.replaceAll('-', '').padEnd(64, '0').slice(0, 64)
	};
}

function request(action: string, entries: readonly (readonly [string, string])[]): Request {
	const body = new FormData();
	for (const [name, value] of entries) body.append(name, value);
	return new Request(`https://local.invalid/questions?/` + action, { method: 'POST', body });
}

async function invoke(
	action: (event: never) => unknown | Promise<unknown>,
	actor: AuthenticatedPrincipal,
	name: string,
	entries: readonly (readonly [string, string])[]
): Promise<unknown> {
	try {
		return await action({
			locals: { principal: actor, database },
			request: request(name, entries)
		} as never);
	} catch (error) {
		return error;
	}
}

function questionFields(prompt: string): readonly (readonly [string, string])[] {
	return [
		['questionType', 'mc'],
		['prompts', prompt],
		['prompts', 'Synthetic alternate lifecycle prompt.'],
		['optionText', 'Synthetic keyed lifecycle choice.'],
		['optionText', 'Synthetic lifecycle distractor one.'],
		['optionText', 'Synthetic lifecycle distractor two.'],
		['optionText', 'Synthetic lifecycle distractor three.'],
		['keyedPosition', '0'],
		['aircraftVariantId', AIRCRAFT]
	];
}

function seedPublishedCurriculum(): {
	subtaskId: string;
	subtaskVersionId: string;
	elementVersionId: string;
} {
	const phase = id();
	const phaseVersion = id();
	const task = id();
	const taskVersion = id();
	const subtask = id();
	const subtaskVersion = id();
	const element = id();
	const elementVersion = id();
	database.sqlite.prepare('INSERT INTO phases (id, created_at) VALUES (?, ?)').run(phase, AT);
	database.sqlite
		.prepare(
			`INSERT INTO phase_versions
			 (id, phase_id, version, name, position, status, effective_from, authored_by_user_id,
			  reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, 1, 'Synthetic phase', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(phaseVersion, phase, AT, AUTHOR, REVIEWER, AT, AT, AT);
	database.sqlite.prepare('INSERT INTO tasks (id, created_at) VALUES (?, ?)').run(task, AT);
	database.sqlite
		.prepare(
			`INSERT INTO task_versions
			 (id, task_id, phase_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic task', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(taskVersion, task, phaseVersion, AT, AUTHOR, REVIEWER, AT, AT, AT);
	database.sqlite.prepare('INSERT INTO subtasks (id, created_at) VALUES (?, ?)').run(subtask, AT);
	database.sqlite
		.prepare(
			`INSERT INTO subtask_versions
			 (id, subtask_id, task_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic subtask', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(subtaskVersion, subtask, taskVersion, AT, AUTHOR, REVIEWER, AT, AT, AT);
	database.sqlite.prepare('INSERT INTO elements (id, created_at) VALUES (?, ?)').run(element, AT);
	database.sqlite
		.prepare(
			`INSERT INTO element_versions
			 (id, element_id, subtask_version_id, version, name, position, status, effective_from,
			  authored_by_user_id, reviewed_by_user_id, reviewed_at, created_at, published_at)
			 VALUES (?, ?, ?, 1, 'Synthetic element', 0, 'published', ?, ?, ?, ?, ?, ?)`
		)
		.run(elementVersion, element, subtaskVersion, AT, AUTHOR, REVIEWER, AT, AT, AT);
	return { subtaskId: subtask, subtaskVersionId: subtaskVersion, elementVersionId: elementVersion };
}

function seedLegacyCurriculum(): void {
	database.sqlite
		.prepare(
			`INSERT INTO import_runs
			 (id, importer_version, source_checksum, source_byte_size, status, started_at, completed_at)
			 VALUES (?, 'synthetic-test', ?, 1, 'completed', ?, ?)`
		)
		.run(LEGACY_RUN, '6'.repeat(64), AT, AT);
	database.sqlite
		.prepare(
			'INSERT INTO legacy_tpos (id, source_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?)'
		)
		.run(LEGACY_TPO, 'synthetic-tpo', '1', 'Synthetic legacy TPO', LEGACY_RUN);
	database.sqlite
		.prepare(
			`INSERT INTO legacy_spos
			 (id, source_id, legacy_tpo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(LEGACY_SPO, 'synthetic-spo', LEGACY_TPO, '1.1', 'Synthetic legacy SPO', LEGACY_RUN);
	database.sqlite
		.prepare(
			`INSERT INTO legacy_eos
			 (id, source_id, legacy_spo_id, number, name, import_run_id) VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(LEGACY_EO, 'synthetic-eo', LEGACY_SPO, '1.1.1', 'Synthetic legacy EO', LEGACY_RUN);
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	sequence = 20;
	for (const [userId, employee] of [
		[AUTHOR, '062001'],
		[REVIEWER, '062002'],
		[PUBLISHER, '062003']
	] as const) {
		database.sqlite
			.prepare(
				`INSERT INTO users
				 (id, employee_number, first_name, last_name, status, created_at, updated_at)
				 VALUES (?, ?, 'Synthetic', 'Lifecycle', 'active', ?, ?)`
			)
			.run(userId, employee, AT, AT);
	}
	database.sqlite
		.prepare(
			`INSERT INTO aircraft_variants
			 (id, code, name, effective_from, status, created_at)
			 VALUES (?, 'E2E', 'Synthetic lifecycle aircraft', ?, 'active', ?)`
		)
		.run(AIRCRAFT, AT, AT);
});

afterEach(() => database.close());

describe('question route CRUD and lifecycle', () => {
	it('creates, edits, links, reviews, publishes, previews, and retires through real actions', async () => {
		const author = principal(AUTHOR, [PERMISSIONS.QUESTIONS_VIEW, PERMISSIONS.QUESTIONS_CREATE]);
		const reviewer = principal(REVIEWER, [
			PERMISSIONS.QUESTIONS_VIEW,
			PERMISSIONS.QUESTIONS_REVIEW
		]);
		const publisher = principal(PUBLISHER, [
			PERMISSIONS.QUESTIONS_VIEW,
			PERMISSIONS.QUESTIONS_PUBLISH,
			PERMISSIONS.RECORDS_RETIRE
		]);
		const curriculum = seedPublishedCurriculum();
		seedLegacyCurriculum();
		const create = listActions.createQuestion;
		if (!create) throw new Error('createQuestion action is missing.');
		const createResult = await invoke(
			create,
			author,
			'createQuestion',
			questionFields('Synthetic route prompt.')
		);
		expect(createResult).toMatchObject({ status: 303 });

		const row = database.sqlite
			.prepare(
				`SELECT q.id AS questionId, qv.id AS versionId
				 FROM questions q JOIN question_versions qv ON qv.question_id = q.id`
			)
			.get() as { questionId: string; versionId: string };
		database.sqlite
			.prepare(
				`INSERT INTO question_legacy_curriculum_links
				 (question_version_id, legacy_tpo_id, legacy_spo_id, legacy_eo_id)
				 VALUES (?, ?, ?, ?)`
			)
			.run(row.versionId, LEGACY_TPO, LEGACY_SPO, LEGACY_EO);
		const update = detailActions.updateDraft;
		if (!update) throw new Error('updateDraft action is missing.');
		expect(
			await invoke(update, author, 'updateDraft', [
				...questionFields('Synthetic revised route prompt.'),
				['versionId', row.versionId],
				['expectedVersion', '1'],
				['legacyTpoId', LEGACY_TPO],
				['legacySpoId', LEGACY_SPO],
				['legacyEoId', LEGACY_EO]
			])
		).toMatchObject({ success: true });
		expect(
			database.sqlite
				.prepare(
					'SELECT count(*) FROM question_legacy_curriculum_links WHERE question_version_id = ?'
				)
				.pluck()
				.get(row.versionId)
		).toBe(1);

		const propose = detailActions.proposeFutureLink;
		if (!propose) throw new Error('proposeFutureLink action is missing.');
		expect(
			await invoke(propose, author, 'proposeFutureLink', [
				['questionVersionId', row.versionId],
				['futureTarget', `${curriculum.subtaskVersionId}:${curriculum.elementVersionId}`]
			])
		).toMatchObject({ success: true });

		const submit = detailActions.submitReview;
		if (!submit) throw new Error('submitReview action is missing.');
		expect(
			await invoke(submit, author, 'submitReview', [['versionId', row.versionId]])
		).toMatchObject({ success: true });

		const reviewerDetail = detailLoad({
			locals: { principal: reviewer, database },
			params: { id: row.questionId },
			url: new URL(`https://local.invalid/questions/${row.questionId}`)
		} as never);
		expect(reviewerDetail).toMatchObject({
			detail: { id: row.versionId, display: { keyLetter: 'A' } }
		});

		const approveLink = detailActions.approveFutureLink;
		if (!approveLink) throw new Error('approveFutureLink action is missing.');
		expect(
			await invoke(approveLink, reviewer, 'approveFutureLink', [
				['questionVersionId', row.versionId],
				['subtaskVersionId', curriculum.subtaskVersionId],
				['rationale', 'Synthetic explicit curriculum review.']
			])
		).toMatchObject({ success: true });

		const review = detailActions.reviewVersion;
		if (!review) throw new Error('reviewVersion action is missing.');
		expect(
			await invoke(review, reviewer, 'reviewVersion', [
				['versionId', row.versionId],
				['decision', 'approve'],
				['rationale', 'Synthetic distinct question review.']
			])
		).toMatchObject({ success: true });

		const publish = detailActions.publishVersion;
		if (!publish) throw new Error('publishVersion action is missing.');
		expect(
			await invoke(publish, publisher, 'publishVersion', [
				['versionId', row.versionId],
				['effectiveFrom', AT]
			])
		).toMatchObject({ success: true });
		expect(createQuestionService(database).versionSummary(row.questionId)).toMatchObject({
			ok: true,
			value: { lifecycle: 'published', generationStatus: 'eligible' }
		});

		const curriculumService = createCurriculumService(database);
		const linkedCurriculumDependency = curriculumService.dependencyPreview(
			'subtask',
			curriculum.subtaskId,
			'retire'
		);
		expect(linkedCurriculumDependency.items).toEqual(
			expect.arrayContaining([expect.objectContaining({ kind: 'question_future_link', count: 1 })])
		);
		expect(
			curriculumService.retireVersion(PUBLISHER, {
				versionId: curriculum.subtaskVersionId,
				reason: 'Synthetic blocked curriculum retirement.',
				expectedDependencyRevision: linkedCurriculumDependency.revision
			})
		).toEqual({ ok: false, error: 'dependency_exists' });

		const retireLink = detailActions.retireFutureLink;
		if (!retireLink) throw new Error('retireFutureLink action is missing.');
		expect(
			await invoke(retireLink, reviewer, 'retireFutureLink', [
				['questionVersionId', row.versionId],
				['subtaskVersionId', curriculum.subtaskVersionId],
				['rationale', 'Synthetic explicit link retirement.']
			])
		).toMatchObject({ success: true });
		expect(createQuestionService(database).versionSummary(row.questionId)).toMatchObject({
			ok: true,
			value: { lifecycle: 'published', generationStatus: 'blocked' }
		});
		const unlinkedCurriculumDependency = curriculumService.dependencyPreview(
			'subtask',
			curriculum.subtaskId,
			'retire'
		);
		expect(
			curriculumService.retireVersion(PUBLISHER, {
				versionId: curriculum.subtaskVersionId,
				reason: 'Synthetic curriculum retirement after link retirement.',
				expectedDependencyRevision: unlinkedCurriculumDependency.revision
			}).ok
		).toBe(true);

		const dependency = createQuestionService(database).dependencyPreview(row.versionId, 'retire');
		if (!dependency.ok) throw new Error(dependency.error);
		const retire = detailActions.retireVersion;
		if (!retire) throw new Error('retireVersion action is missing.');
		expect(
			await invoke(retire, publisher, 'retireVersion', [
				['versionId', row.versionId],
				['reason', 'Synthetic route retirement.'],
				['expectedDependencyRevision', dependency.value.revision]
			])
		).toMatchObject({ success: true });
		expect(createQuestionService(database).versionSummary(row.questionId)).toMatchObject({
			ok: true,
			value: { lifecycle: 'retired', generationStatus: 'blocked' }
		});
	});

	it('does not let safe-read permission become answer-key permission', async () => {
		const created = createQuestionService(database).createQuestion(AUTHOR, {
			questionType: 'mc',
			prompts: [{ text: 'Synthetic protected detail prompt.' }],
			options: [
				{ text: 'Synthetic protected key.', isCorrect: true },
				{ text: 'Synthetic protected distractor one.', isCorrect: false },
				{ text: 'Synthetic protected distractor two.', isCorrect: false },
				{ text: 'Synthetic protected distractor three.', isCorrect: false }
			],
			aircraftVariantIds: [AIRCRAFT]
		});
		if (!created.ok) throw new Error(created.error);
		const result = await Promise.resolve()
			.then(() =>
				detailLoad({
					locals: {
						principal: principal(AUTHOR, [PERMISSIONS.QUESTIONS_VIEW]),
						database
					},
					params: { id: created.value.id },
					url: new URL(`https://local.invalid/questions/${created.value.id}`)
				} as never)
			)
			.catch((error) => error);
		expect(result).toMatchObject({ status: 403 });
	});
});
