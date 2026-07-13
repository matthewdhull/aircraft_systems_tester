import { randomBytes, randomUUID } from 'node:crypto';

import { recordAuditEvent } from '$lib/server/audit';
import type { AuthenticatedPrincipal } from '$lib/server/authorization';
import { PERMISSIONS } from '$lib/server/authorization';
import type { ServerConfig } from '$lib/server/config';
import type { DatabaseHandle } from '$lib/server/db';
import { AesGcmSeedProtector, HmacAccessCodeProtector } from '$lib/server/generation/security';
import { selectQuestions } from '$lib/server/generation/selection';
import {
	GenerationError,
	SnapshotGenerationService,
	type GenerateExamResult
} from '$lib/server/generation/snapshot';

export interface GeneratedExamSummary {
	id: string;
	status: string;
	templateName: string;
	templateVersion: number;
	questionCount: number;
	algorithmVersion: string;
	publishedAt: string;
	startClosesAt: string;
}

export interface GeneratedExamDetail extends GeneratedExamSummary {
	questions: {
		id: string;
		position: number;
		promptText: string;
		questionType: string;
		choices: { id: string; position: number; text: string; isCorrect?: boolean }[];
	}[];
}

function requireSecurity(config: ServerConfig) {
	if (!config.seedEncryptionKey || !config.seedEncryptionKeyId || !config.accessCodeHmacKey) {
		throw new GenerationError('SEED_PROTECTION_FAILED');
	}
	return {
		seed: new AesGcmSeedProtector({
			key: config.seedEncryptionKey,
			keyId: config.seedEncryptionKeyId
		}),
		code: new HmacAccessCodeProtector({ key: config.accessCodeHmacKey })
	};
}

export function createGenerationService(input: {
	database: DatabaseHandle;
	principal: AuthenticatedPrincipal;
	config: ServerConfig;
	now?: () => Date;
}) {
	const { seed, code } = requireSecurity(input.config);
	const principal = input.principal;
	const service = new SnapshotGenerationService(input.database, {
		selector: selectQuestions,
		seedProtector: seed,
		accessCodeProtector: code,
		secureEntropy: randomBytes,
		now: input.now ?? (() => new Date()),
		uuid: randomUUID,
		authorize: (_tx, actorUserId) => {
			if (actorUserId !== principal.userId || !principal.permissions.has(PERMISSIONS.EXAMS_PUBLISH))
				throw new GenerationError('PERMISSION_DENIED');
		},
		authorizeRosterScope: (tx, actorUserId, rosterId) => {
			const row = tx.$client
				.prepare(
					'SELECT instructor_user_id AS instructorUserId FROM class_rosters WHERE id = ? AND retired_at IS NULL'
				)
				.get(rosterId) as { instructorUserId: string } | undefined;
			if (
				!row ||
				(row.instructorUserId !== actorUserId &&
					!principal.permissions.has(PERMISSIONS.RECORDS_ALL_MANAGE))
			)
				throw new GenerationError('ROSTER_SCOPE_DENIED');
		},
		recordSuccessAudit: (tx, event) =>
			recordAuditEvent(tx, {
				actorUserId: event.actorUserId,
				action: 'exam.published',
				entityType: 'exam_instance',
				entityId: event.examId,
				occurredAt: event.occurredAt,
				after: {
					questionCount: event.questionCount,
					algorithmVersion: event.algorithmVersion,
					envelopeVersion: event.envelopeVersion
				}
			})
	});
	return {
		generate: (command: {
			templateVersionId: string;
			classRosterId: string;
			algorithmVersion?: string;
		}): GenerateExamResult =>
			service.generate({
				actorUserId: principal.userId,
				templateVersionId: command.templateVersionId,
				classRosterId: command.classRosterId,
				algorithmVersion: command.algorithmVersion ?? 'ast-selection-v1'
			})
	};
}

export function listGeneratedExams(
	database: DatabaseHandle,
	principal: AuthenticatedPrincipal
): GeneratedExamSummary[] {
	const all = principal.permissions.has(PERMISSIONS.RECORDS_ALL_MANAGE) ? 1 : 0;
	return database.sqlite
		.prepare(
			`SELECT e.id, e.status, tv.name AS templateName, tv.version AS templateVersion,
		(SELECT count(*) FROM exam_questions q WHERE q.exam_instance_id=e.id) AS questionCount,
		e.random_algorithm_version AS algorithmVersion, e.published_at AS publishedAt,
		e.start_closes_at AS startClosesAt FROM exam_instances e
		JOIN test_template_versions tv ON tv.id=e.test_template_version_id
		JOIN class_rosters r ON r.id=e.class_roster_id
		WHERE (?=1 OR r.instructor_user_id=?) ORDER BY e.published_at DESC, e.id`
		)
		.all(all, principal.userId) as GeneratedExamSummary[];
}

export function getGeneratedExam(
	database: DatabaseHandle,
	principal: AuthenticatedPrincipal,
	examId: string,
	includeKeys = false
): GeneratedExamDetail | null {
	if (includeKeys && !principal.permissions.has(PERMISSIONS.ANSWER_KEYS_VIEW))
		throw new GenerationError('PERMISSION_DENIED');
	const summary = listGeneratedExams(database, principal).find(({ id }) => id === examId);
	if (!summary) return null;
	const rows = database.sqlite
		.prepare(
			`SELECT q.id, q.position, q.prompt_text AS promptText, q.question_type AS questionType,
		o.id AS choiceId, o.position AS choicePosition, o.option_text AS choiceText, o.is_correct AS isCorrect
		FROM exam_questions q JOIN exam_question_options o ON o.exam_question_id=q.id
		WHERE q.exam_instance_id=? ORDER BY q.position, o.position`
		)
		.all(examId) as {
		id: string;
		position: number;
		promptText: string;
		questionType: string;
		choiceId: string;
		choicePosition: number;
		choiceText: string;
		isCorrect: number;
	}[];
	const questions = new Map<string, GeneratedExamDetail['questions'][number]>();
	for (const row of rows) {
		const question = questions.get(row.id) ?? {
			id: row.id,
			position: row.position,
			promptText: row.promptText,
			questionType: row.questionType,
			choices: []
		};
		question.choices.push({
			id: row.choiceId,
			position: row.choicePosition,
			text: row.choiceText,
			...(includeKeys ? { isCorrect: row.isCorrect === 1 } : {})
		});
		questions.set(row.id, question);
	}
	return { ...summary, questions: [...questions.values()] };
}
