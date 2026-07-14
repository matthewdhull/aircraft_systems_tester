import { createHmac } from 'node:crypto';

import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import { GenerationError } from './errors.js';
import type {
	GenerateExamInput,
	GenerateExamResult,
	SnapshotDependencies,
	SnapshotMandatoryElement,
	SnapshotRule
} from './types.js';

function sleep(milliseconds: number): void {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

interface TemplateRow {
	id: string;
	configuredLength: number;
	lifecycle: string;
	aircraftVariantId: string;
	courseTypeId: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
}

interface ContentRow {
	id: string;
	questionType:
		'true_false' | 'single_choice' | 'two_correct_compound' | 'all_correct' | 'none_correct';
}

interface OptionRow {
	id: string;
	text: string;
	isCorrect: number;
	position: number;
}

interface SnapshotChoice {
	sourceId: string | null;
	text: string;
	isCorrect: boolean;
}

function dateIsEffective(row: TemplateRow, now: string): boolean {
	return (
		row.effectiveFrom !== null &&
		row.effectiveFrom <= now &&
		(row.effectiveTo === null || now < row.effectiveTo)
	);
}

function deterministicNumber(seed: Uint8Array, label: string, upper: number): number {
	if (upper <= 0) throw new RangeError('Invalid deterministic bound.');
	const limit = 0x1_0000_0000 - (0x1_0000_0000 % upper);
	for (let counter = 0; ; counter++) {
		const digest = createHmac('sha256', Buffer.from(seed)).update(`${label}:${counter}`).digest();
		const value = digest.readUInt32BE(0);
		if (value < limit) return value % upper;
	}
}

function shuffled<T>(values: readonly T[], seed: Uint8Array, label: string): T[] {
	const result = [...values];
	for (let index = result.length - 1; index > 0; index--) {
		const selected = deterministicNumber(seed, `${label}:${index}`, index + 1);
		[result[index], result[selected]] = [result[selected]!, result[index]!];
	}
	return result;
}

function loadTemplate(tx: FoundationDatabase, id: string, now: string): TemplateRow {
	const row = tx.$client
		.prepare(
			`SELECT id, configured_length AS configuredLength, lifecycle,
			 aircraft_variant_id AS aircraftVariantId, course_type_id AS courseTypeId,
			 effective_from AS effectiveFrom, effective_to AS effectiveTo
			 FROM test_template_versions WHERE id = ?`
		)
		.get(id) as TemplateRow | undefined;
	if (!row) throw new GenerationError('TEMPLATE_NOT_FOUND');
	if (row.lifecycle !== 'published') throw new GenerationError('TEMPLATE_NOT_PUBLISHED');
	if (!dateIsEffective(row, now)) throw new GenerationError('TEMPLATE_NOT_EFFECTIVE');
	return row;
}

function loadRules(tx: FoundationDatabase, templateVersionId: string): SnapshotRule[] {
	return tx.$client
		.prepare(
			`SELECT id, position + 1 AS position, subtask_version_id AS subtaskVersionId,
			 question_count AS count FROM test_template_rules
			 WHERE test_template_version_id = ? ORDER BY position, id`
		)
		.all(templateVersionId) as SnapshotRule[];
}

function loadMandatory(
	tx: FoundationDatabase,
	templateVersionId: string
): SnapshotMandatoryElement[] {
	return tx.$client
		.prepare(
			`SELECT id, position + 1 AS position, element_version_id AS elementVersionId,
			 subtask_version_id AS subtaskVersionId FROM test_template_required_elements
			 WHERE test_template_version_id = ? ORDER BY position, id`
		)
		.all(templateVersionId) as SnapshotMandatoryElement[];
}

function validateTemplate(
	template: TemplateRow,
	rules: readonly SnapshotRule[],
	mandatory: readonly SnapshotMandatoryElement[]
): void {
	if (rules.reduce((sum, rule) => sum + rule.count, 0) !== template.configuredLength) {
		throw new GenerationError('TEMPLATE_INVALID');
	}
	const quota = new Map(rules.map((rule) => [rule.subtaskVersionId, rule.count]));
	const required = new Map<string, number>();
	for (const item of mandatory) {
		if (!quota.has(item.subtaskVersionId)) throw new GenerationError('TEMPLATE_INVALID');
		required.set(item.subtaskVersionId, (required.get(item.subtaskVersionId) ?? 0) + 1);
	}
	for (const [subtask, count] of required) {
		if (count > (quota.get(subtask) ?? 0)) throw new GenerationError('TEMPLATE_INVALID');
	}
}

function validateRosterApplicability(
	tx: FoundationDatabase,
	template: TemplateRow,
	classRosterId: string
): void {
	const row = tx.$client
		.prepare(
			`SELECT o.aircraft_variant_id AS aircraftVariantId, o.course_type_id AS courseTypeId
			 FROM class_rosters r JOIN approved_course_offerings o ON o.id = r.course_offering_id
			 WHERE r.id = ? AND r.retired_at IS NULL`
		)
		.get(classRosterId) as { aircraftVariantId: string; courseTypeId: string } | undefined;
	if (!row) throw new GenerationError('ROSTER_SCOPE_DENIED');
	if (
		row.aircraftVariantId !== template.aircraftVariantId ||
		(template.courseTypeId && row.courseTypeId !== template.courseTypeId)
	) {
		throw new GenerationError('AIRCRAFT_INAPPLICABLE');
	}
}

function loadCandidates(tx: FoundationDatabase, template: TemplateRow, now: string) {
	const rows = tx.$client
		.prepare(
			`SELECT qv.id AS questionVersionId, qf.subtask_version_id AS subtaskVersionId,
			 qf.element_version_id AS elementVersionId
			 FROM question_versions qv
			 JOIN question_aircraft_applicability qa ON qa.question_version_id = qv.id
			 JOIN question_future_curriculum_links qf ON qf.question_version_id = qv.id
			 JOIN subtask_versions sv ON sv.id = qf.subtask_version_id
			 JOIN task_versions tv ON tv.id = sv.task_version_id
			 JOIN phase_versions pv ON pv.id = tv.phase_version_id
			 LEFT JOIN element_versions ev ON ev.id = qf.element_version_id
			 WHERE qv.lifecycle = 'published' AND qv.generation_status = 'eligible'
			 AND qv.effective_from <= ? AND (qv.effective_to IS NULL OR ? < qv.effective_to)
			 AND qa.aircraft_variant_id = ? AND qf.mapping_status = 'approved'
			 AND sv.status = 'published' AND sv.effective_from <= ? AND (sv.effective_to IS NULL OR ? < sv.effective_to)
			 AND tv.status = 'published' AND tv.effective_from <= ? AND (tv.effective_to IS NULL OR ? < tv.effective_to)
			 AND pv.status = 'published' AND pv.effective_from <= ? AND (pv.effective_to IS NULL OR ? < pv.effective_to)
			 AND (ev.id IS NULL OR (ev.status = 'published' AND ev.effective_from <= ? AND (ev.effective_to IS NULL OR ? < ev.effective_to)))
			 ORDER BY qv.id, qf.subtask_version_id, qf.element_version_id`
		)
		.all(now, now, template.aircraftVariantId, now, now, now, now, now, now, now, now) as {
		questionVersionId: string;
		subtaskVersionId: string;
		elementVersionId: string | null;
	}[];
	const candidates = new Map<
		string,
		{
			questionVersionId: string;
			eligible: true;
			subtaskVersionIds: Set<string>;
			elementVersionIds: Set<string>;
		}
	>();
	for (const row of rows) {
		const candidate = candidates.get(row.questionVersionId) ?? {
			questionVersionId: row.questionVersionId,
			eligible: true as const,
			subtaskVersionIds: new Set<string>(),
			elementVersionIds: new Set<string>()
		};
		candidate.subtaskVersionIds.add(row.subtaskVersionId);
		if (row.elementVersionId) candidate.elementVersionIds.add(row.elementVersionId);
		candidates.set(row.questionVersionId, candidate);
	}
	return [...candidates.values()].map((candidate) => ({
		questionVersionId: candidate.questionVersionId,
		eligible: true,
		subtaskVersionIds: [...candidate.subtaskVersionIds].sort(),
		elementVersionIds: [...candidate.elementVersionIds].sort()
	}));
}

function snapshotContent(tx: FoundationDatabase, questionVersionId: string, seed: Uint8Array) {
	const question = tx.$client
		.prepare('SELECT id, question_type AS questionType FROM question_versions WHERE id = ?')
		.get(questionVersionId) as ContentRow | undefined;
	if (!question) throw new GenerationError('QUESTION_INELIGIBLE');
	const prompts = tx.$client
		.prepare(
			'SELECT prompt_text FROM question_prompts WHERE question_version_id = ? ORDER BY position, id'
		)
		.pluck()
		.all(questionVersionId) as string[];
	const options = tx.$client
		.prepare(
			`SELECT id, option_text AS text, is_correct AS isCorrect, position
			 FROM question_options WHERE question_version_id = ? ORDER BY position, id`
		)
		.all(questionVersionId) as OptionRow[];
	if (!prompts.length) throw new GenerationError('QUESTION_INELIGIBLE');
	const prompt = prompts[deterministicNumber(seed, `prompt:${questionVersionId}`, prompts.length)]!;
	let choices: SnapshotChoice[];
	if (question.questionType === 'true_false') {
		const trueOption = options.find((option) => option.text.toLowerCase() === 'true');
		const falseOption = options.find((option) => option.text.toLowerCase() === 'false');
		choices = [
			{ sourceId: trueOption?.id ?? null, text: 'True', isCorrect: trueOption?.isCorrect === 1 },
			{ sourceId: falseOption?.id ?? null, text: 'False', isCorrect: falseOption?.isCorrect === 1 }
		];
	} else if (question.questionType === 'single_choice') {
		choices = shuffled(options, seed, `options:${questionVersionId}`).map((option) => ({
			sourceId: option.id,
			text: option.text,
			isCorrect: option.isCorrect === 1
		}));
	} else {
		const statements = shuffled(options.slice(0, 3), seed, `statements:${questionVersionId}`);
		const prefix = statements.map((option) => ({
			sourceId: option.id,
			text: option.text,
			isCorrect: false
		}));
		let derived = 'All of the above';
		if (question.questionType === 'none_correct') derived = 'None of the above';
		if (question.questionType === 'two_correct_compound') {
			const letters = statements
				.map((option, index) => (option.isCorrect === 1 ? String.fromCharCode(65 + index) : null))
				.filter((value): value is string => value !== null);
			derived = letters.join(' and ');
		}
		choices = [...prefix, { sourceId: null, text: derived, isCorrect: true }];
	}
	return { questionType: question.questionType, prompt, choices };
}

export class SnapshotGenerationService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: SnapshotDependencies
	) {}

	generate(input: GenerateExamInput): GenerateExamResult {
		const retryDelays = [50, 150, 450] as const;
		for (let attempt = 0; ; attempt += 1) {
			try {
				return this.database.transaction((tx) => this.generateInsideTransaction(tx, input));
			} catch (error) {
				const busy =
					(error instanceof GenerationError && error.code === 'DATABASE_BUSY') ||
					(error instanceof Error && /busy|locked/i.test(error.message));
				if (!busy) throw error;
				const delay = retryDelays[attempt];
				if (delay === undefined) throw new GenerationError('DATABASE_BUSY');
				(this.dependencies.retryDelay ?? sleep)(delay);
			}
		}
	}

	private generateInsideTransaction(
		tx: FoundationDatabase,
		input: GenerateExamInput
	): GenerateExamResult {
		this.dependencies.authorize(tx, input.actorUserId, 'exams.publish');
		this.dependencies.authorizeRosterScope(tx, input.actorUserId, input.classRosterId);
		const nowDate = this.dependencies.now();
		if (!Number.isFinite(nowDate.getTime())) throw new GenerationError('TEMPLATE_INVALID');
		const now = nowDate.toISOString();
		const template = loadTemplate(tx, input.templateVersionId, now);
		validateRosterApplicability(tx, template, input.classRosterId);
		const rules = loadRules(tx, template.id);
		const mandatory = loadMandatory(tx, template.id);
		validateTemplate(template, rules, mandatory);
		const candidates = loadCandidates(tx, template, now);
		const seed = this.dependencies.secureEntropy(32);
		if (seed.byteLength !== 32) throw new GenerationError('SEED_PROTECTION_FAILED');
		const selection = this.dependencies.selector({
			algorithmVersion: input.algorithmVersion,
			seedBytes: seed,
			rules,
			mandatoryElements: mandatory,
			candidates
		});
		if (!selection.ok) {
			if (selection.code === 'UNSUPPORTED_ALGORITHM') {
				throw new GenerationError('UNSUPPORTED_ALGORITHM');
			}
			if (selection.code === 'INVALID_SELECTION_INPUT') {
				throw new GenerationError('TEMPLATE_INVALID');
			}
			const shortages = selection.shortages.map((shortage) => ({
				code: shortage.code,
				id: shortage.code === 'CATEGORY_SHORTAGE' ? shortage.ruleId : shortage.elementVersionId,
				needed: shortage.needed,
				available: shortage.available
			}));
			const code = shortages.some((shortage) => shortage.code === 'MANDATORY_ELEMENT_SHORTAGE')
				? 'MANDATORY_ELEMENT_SHORTAGE'
				: 'CATEGORY_SHORTAGE';
			throw new GenerationError(code, shortages);
		}
		if (selection.assignments.length !== template.configuredLength)
			throw new GenerationError('TEMPLATE_INVALID');

		const examId = this.dependencies.uuid();
		const seedContext = {
			examId,
			templateVersionId: template.id,
			algorithmVersion: input.algorithmVersion
		};
		let envelope;
		try {
			envelope = this.dependencies.seedProtector.encrypt(seed, seedContext);
		} catch {
			throw new GenerationError('SEED_PROTECTION_FAILED');
		}
		let accessCode;
		try {
			accessCode = this.dependencies.accessCodeProtector.createAndProtect();
		} catch {
			throw new GenerationError('CODE_PROTECTION_FAILED');
		}
		const closesAt = new Date(nowDate.getTime() + 60 * 60 * 1000).toISOString();
		tx.$client
			.prepare(
				`INSERT INTO exam_instances
				 (id, test_template_version_id, class_roster_id, published_by_user_id, status,
				 access_code_hash, access_code_protection_version, random_seed_ciphertext,
				 random_seed_envelope_version, random_seed_key_id, random_algorithm_version,
				 published_at, start_closes_at, created_at)
				 VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				examId,
				template.id,
				input.classRosterId,
				input.actorUserId,
				accessCode.protectedDigest,
				accessCode.protectionVersion,
				envelope.ciphertext,
				envelope.envelopeVersion,
				envelope.keyId,
				input.algorithmVersion,
				now,
				closesAt,
				now
			);
		const mandatoryByQuestion = new Map(
			selection.mandatoryAssignments.map((item) => [item.questionVersionId, item.elementVersionId])
		);
		for (const [position, assignment] of selection.assignments.entries()) {
			const snapshot = snapshotContent(tx, assignment.questionVersionId, seed);
			const examQuestionId = this.dependencies.uuid();
			tx.$client
				.prepare(
					`INSERT INTO exam_questions
				(id, exam_instance_id, source_question_version_id, test_template_rule_id,
				 mandatory_element_version_id, position, question_type, prompt_text, is_invalidated)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
				)
				.run(
					examQuestionId,
					examId,
					assignment.questionVersionId,
					assignment.ruleId,
					mandatoryByQuestion.get(assignment.questionVersionId) ?? null,
					position,
					snapshot.questionType,
					snapshot.prompt
				);
			for (const [choicePosition, choice] of snapshot.choices.entries()) {
				tx.$client
					.prepare(
						`INSERT INTO exam_question_options
					(id, exam_question_id, source_question_option_id, position, option_text, is_correct)
					VALUES (?, ?, ?, ?, ?, ?)`
					)
					.run(
						this.dependencies.uuid(),
						examQuestionId,
						choice.sourceId,
						choicePosition,
						choice.text,
						choice.isCorrect ? 1 : 0
					);
			}
		}
		try {
			this.dependencies.recordSuccessAudit(tx, {
				actorUserId: input.actorUserId,
				examId,
				occurredAt: nowDate,
				questionCount: selection.assignments.length,
				algorithmVersion: input.algorithmVersion,
				envelopeVersion: envelope.envelopeVersion
			});
		} catch {
			throw new GenerationError('AUDIT_WRITE_FAILED');
		}
		return { examId, rawAccessCode: accessCode.rawCode };
	}
}
