#!/usr/bin/env node
import { hashPassword, validatePassword } from '../../src/lib/server/auth/index.js';
import { seedBaselineAuthorization } from '../../src/lib/server/authorization/index.js';
import { openDatabase, type FoundationDatabase } from '../../src/lib/server/db/index.js';

const AT = '2026-01-01T00:00:00.000Z';
const EFFECTIVE_FROM = '2025-01-01T00:00:00.000Z';

export const PHASE7_ACCEPTANCE_IDS = Object.freeze({
	administrator: '70000000-0000-4000-8000-000000000001',
	curriculumManager: '70000000-0000-4000-8000-000000000002',
	assignedInstructor: '70000000-0000-4000-8000-000000000003',
	unassignedInstructor: '70000000-0000-4000-8000-000000000004',
	insufficientUser: '70000000-0000-4000-8000-000000000005',
	suspendedUser: '70000000-0000-4000-8000-000000000006',
	aircraft: '70000000-0000-4000-8000-000000000010',
	courseType: '70000000-0000-4000-8000-000000000011',
	qualification: '70000000-0000-4000-8000-000000000012',
	syllabus: '70000000-0000-4000-8000-000000000013',
	offering: '70000000-0000-4000-8000-000000000014',
	roster: '70000000-0000-4000-8000-000000000015',
	phase: '70000000-0000-4000-8000-000000000020',
	phaseVersion: '70000000-0000-4000-8000-000000000021',
	task: '70000000-0000-4000-8000-000000000022',
	taskVersion: '70000000-0000-4000-8000-000000000023',
	subtask: '70000000-0000-4000-8000-000000000024',
	subtaskVersion: '70000000-0000-4000-8000-000000000025',
	element: '70000000-0000-4000-8000-000000000026',
	elementVersion: '70000000-0000-4000-8000-000000000027',
	template: '70000000-0000-4000-8000-000000000030',
	templateVersion: '70000000-0000-4000-8000-000000000031',
	templateRule: '70000000-0000-4000-8000-000000000032',
	templateElement: '70000000-0000-4000-8000-000000000033'
});

const QUESTION_COUNT = 6;

function insertUsers(db: FoundationDatabase, passwordHash: string): void {
	const insert = db.$client.prepare(`INSERT INTO users
		(id,employee_number,first_name,last_name,password_hash,status,created_at,updated_at,password_changed_at)
		VALUES (?,?,?,?,?,?,?,?,?)
		ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash,
		status=excluded.status,updated_at=excluded.updated_at,password_changed_at=excluded.password_changed_at`);
	const users = [
		[PHASE7_ACCEPTANCE_IDS.administrator, 'P7ADMIN', 'Synthetic', 'Administrator', 'active'],
		[
			PHASE7_ACCEPTANCE_IDS.curriculumManager,
			'P7CURRIC',
			'Synthetic',
			'Curriculum Manager',
			'active'
		],
		[
			PHASE7_ACCEPTANCE_IDS.assignedInstructor,
			'P7ASSIGNED',
			'Synthetic',
			'Assigned Instructor',
			'active'
		],
		[
			PHASE7_ACCEPTANCE_IDS.unassignedInstructor,
			'P7UNASSIGNED',
			'Synthetic',
			'Unassigned Instructor',
			'active'
		],
		[PHASE7_ACCEPTANCE_IDS.insufficientUser, 'P7LIMITED', 'Synthetic', 'Limited User', 'active'],
		[PHASE7_ACCEPTANCE_IDS.suspendedUser, 'P7SUSPENDED', 'Synthetic', 'Suspended User', 'suspended']
	] as const;
	for (const [id, employeeNumber, firstName, lastName, status] of users) {
		insert.run(id, employeeNumber, firstName, lastName, passwordHash, status, AT, AT, AT);
	}

	const roleId = db.$client.prepare('SELECT id FROM roles WHERE code=?').pluck();
	const grant = db.$client.prepare(`INSERT INTO user_roles
		(user_id,role_id,granted_by_user_id,granted_at) VALUES (?,?,?,?)
		ON CONFLICT(user_id,role_id,granted_at) DO NOTHING`);
	for (const [userId, role] of [
		[PHASE7_ACCEPTANCE_IDS.administrator, 'administrator'],
		[PHASE7_ACCEPTANCE_IDS.curriculumManager, 'curriculum_manager'],
		[PHASE7_ACCEPTANCE_IDS.assignedInstructor, 'instructor'],
		[PHASE7_ACCEPTANCE_IDS.unassignedInstructor, 'instructor'],
		[PHASE7_ACCEPTANCE_IDS.suspendedUser, 'instructor']
	] as const) {
		grant.run(userId, roleId.get(role), PHASE7_ACCEPTANCE_IDS.administrator, AT);
	}
}

function insertCurriculum(db: FoundationDatabase): void {
	const run = (sql: string, ...parameters: unknown[]) => db.$client.prepare(sql).run(...parameters);
	run(
		`INSERT OR IGNORE INTO aircraft_variants
		(id,code,name,effective_from,status,created_at) VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.aircraft,
		'P7-SYN',
		'Synthetic Phase 7 Aircraft',
		EFFECTIVE_FROM,
		'active',
		AT
	);
	run(
		`INSERT OR IGNORE INTO course_types
		(id,code,name,effective_from,status,created_at) VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.courseType,
		'P7-SYN',
		'Synthetic Phase 7 Course',
		EFFECTIVE_FROM,
		'active',
		AT
	);
	run(
		`INSERT OR IGNORE INTO qualifications
		(id,code,name,effective_from,status,created_at) VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.qualification,
		'P7-SYN',
		'Synthetic Phase 7 Qualification',
		EFFECTIVE_FROM,
		'active',
		AT
	);
	run(
		`INSERT OR IGNORE INTO syllabi
		(id,code,name,effective_from,status,created_at) VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.syllabus,
		'P7-SYN',
		'Synthetic Phase 7 Syllabus',
		EFFECTIVE_FROM,
		'active',
		AT
	);
	run(
		`INSERT OR IGNORE INTO approved_course_offerings
		(id,aircraft_variant_id,qualification_id,syllabus_id,course_type_id,effective_from)
		VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.offering,
		PHASE7_ACCEPTANCE_IDS.aircraft,
		PHASE7_ACCEPTANCE_IDS.qualification,
		PHASE7_ACCEPTANCE_IDS.syllabus,
		PHASE7_ACCEPTANCE_IDS.courseType,
		EFFECTIVE_FROM
	);
	run(
		`INSERT OR IGNORE INTO class_rosters
		(id,course_offering_id,instructor_user_id,name,starts_on,created_at) VALUES (?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.roster,
		PHASE7_ACCEPTANCE_IDS.offering,
		PHASE7_ACCEPTANCE_IDS.assignedInstructor,
		'Synthetic Phase 7 Assigned Roster',
		'2025-01-01',
		AT
	);

	for (const [table, id] of [
		['phases', PHASE7_ACCEPTANCE_IDS.phase],
		['tasks', PHASE7_ACCEPTANCE_IDS.task],
		['subtasks', PHASE7_ACCEPTANCE_IDS.subtask],
		['elements', PHASE7_ACCEPTANCE_IDS.element]
	] as const)
		run(`INSERT OR IGNORE INTO ${table} (id,created_at) VALUES (?,?)`, id, AT);
	const author = PHASE7_ACCEPTANCE_IDS.curriculumManager;
	const reviewer = PHASE7_ACCEPTANCE_IDS.administrator;
	run(
		`INSERT OR IGNORE INTO phase_versions
		(id,phase_id,version,name,position,status,effective_from,authored_by_user_id,reviewed_by_user_id,reviewed_at,created_at,published_at)
		VALUES (?,?,1,?,0,'published',?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.phaseVersion,
		PHASE7_ACCEPTANCE_IDS.phase,
		'Synthetic Phase 7 Phase',
		EFFECTIVE_FROM,
		author,
		reviewer,
		AT,
		AT,
		AT
	);
	run(
		`INSERT OR IGNORE INTO task_versions
		(id,task_id,phase_version_id,version,name,position,status,effective_from,authored_by_user_id,reviewed_by_user_id,reviewed_at,created_at,published_at)
		VALUES (?,?,?,1,?,0,'published',?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.taskVersion,
		PHASE7_ACCEPTANCE_IDS.task,
		PHASE7_ACCEPTANCE_IDS.phaseVersion,
		'Synthetic Phase 7 Task',
		EFFECTIVE_FROM,
		author,
		reviewer,
		AT,
		AT,
		AT
	);
	run(
		`INSERT OR IGNORE INTO subtask_versions
		(id,subtask_id,task_version_id,version,name,position,status,effective_from,authored_by_user_id,reviewed_by_user_id,reviewed_at,created_at,published_at)
		VALUES (?,?,?,1,?,0,'published',?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.subtaskVersion,
		PHASE7_ACCEPTANCE_IDS.subtask,
		PHASE7_ACCEPTANCE_IDS.taskVersion,
		'Synthetic Phase 7 Subtask',
		EFFECTIVE_FROM,
		author,
		reviewer,
		AT,
		AT,
		AT
	);
	run(
		`INSERT OR IGNORE INTO element_versions
		(id,element_id,subtask_version_id,version,name,position,status,effective_from,authored_by_user_id,reviewed_by_user_id,reviewed_at,created_at,published_at)
		VALUES (?,?,?,1,?,0,'published',?,?,?,?,?,?)`,
		PHASE7_ACCEPTANCE_IDS.elementVersion,
		PHASE7_ACCEPTANCE_IDS.element,
		PHASE7_ACCEPTANCE_IDS.subtaskVersion,
		'Synthetic Phase 7 Mandatory Element',
		EFFECTIVE_FROM,
		author,
		reviewer,
		AT,
		AT,
		AT
	);
}

function insertQuestions(db: FoundationDatabase): void {
	const insertQuestion = db.$client.prepare(
		'INSERT OR IGNORE INTO questions (id,created_at) VALUES (?,?)'
	);
	const insertVersion = db.$client.prepare(`INSERT OR IGNORE INTO question_versions
		(id,question_id,version,question_type,lifecycle,generation_status,authored_by_user_id,
		reviewed_by_user_id,reviewed_at,created_at,submitted_at,published_at,effective_from)
		VALUES (?,?,1,'single_choice','published','eligible',?,?,?,?,?,?,?)`);
	const insertPrompt = db.$client.prepare(`INSERT OR IGNORE INTO question_prompts
		(id,question_version_id,position,prompt_text) VALUES (?,?,0,?)`);
	const insertOption = db.$client.prepare(`INSERT OR IGNORE INTO question_options
		(id,question_version_id,position,option_text,is_correct) VALUES (?,?,?,?,?)`);
	const aircraft = db.$client.prepare(`INSERT OR IGNORE INTO question_aircraft_applicability
		(question_version_id,aircraft_variant_id) VALUES (?,?)`);
	const link = db.$client.prepare(`INSERT OR IGNORE INTO question_future_curriculum_links
		(question_version_id,subtask_version_id,element_version_id,mapping_status,proposed_by_user_id,
		proposed_at,reviewed_by_user_id,reviewed_at) VALUES (?,?,?,'approved',?,?,?,?)`);
	for (let index = 1; index <= QUESTION_COUNT; index++) {
		const suffix = index.toString().padStart(2, '0');
		const questionId = `70000000-0000-4000-8100-0000000000${suffix}`;
		const versionId = `70000000-0000-4000-8200-0000000000${suffix}`;
		insertQuestion.run(questionId, AT);
		insertVersion.run(
			versionId,
			questionId,
			PHASE7_ACCEPTANCE_IDS.curriculumManager,
			PHASE7_ACCEPTANCE_IDS.administrator,
			AT,
			AT,
			AT,
			AT,
			EFFECTIVE_FROM
		);
		insertPrompt.run(
			`70000000-0000-4000-8300-0000000000${suffix}`,
			versionId,
			`Synthetic Phase 7 acceptance prompt ${index}`
		);
		for (let position = 0; position < 4; position++) {
			insertOption.run(
				`70000000-0000-4000-84${index}${position}-000000000001`,
				versionId,
				position,
				`Synthetic option ${position + 1} for item ${index}`,
				position === 0 ? 1 : 0
			);
		}
		aircraft.run(versionId, PHASE7_ACCEPTANCE_IDS.aircraft);
		link.run(
			versionId,
			PHASE7_ACCEPTANCE_IDS.subtaskVersion,
			index === 1 ? PHASE7_ACCEPTANCE_IDS.elementVersion : null,
			PHASE7_ACCEPTANCE_IDS.curriculumManager,
			AT,
			PHASE7_ACCEPTANCE_IDS.administrator,
			AT
		);
	}
}

function insertTemplate(db: FoundationDatabase): void {
	db.$client
		.prepare('INSERT OR IGNORE INTO test_templates (id,created_at) VALUES (?,?)')
		.run(PHASE7_ACCEPTANCE_IDS.template, AT);
	const existing = db.$client
		.prepare('SELECT lifecycle FROM test_template_versions WHERE id=?')
		.get(PHASE7_ACCEPTANCE_IDS.templateVersion) as { lifecycle: string } | undefined;
	if (existing?.lifecycle === 'published') return;
	// Children are inserted while the stable version is a draft so immutability triggers remain active.
	db.$client
		.prepare(
			`INSERT OR IGNORE INTO test_template_versions
		(id,test_template_id,version,name,aircraft_variant_id,course_type_id,configured_length,
		allotted_minutes,lifecycle,authored_by_user_id,created_at)
		VALUES (?,?,1,?,?,?,5,30,'draft',?,?)`
		)
		.run(
			PHASE7_ACCEPTANCE_IDS.templateVersion,
			PHASE7_ACCEPTANCE_IDS.template,
			'Synthetic Phase 7 Five-Item Test',
			PHASE7_ACCEPTANCE_IDS.aircraft,
			PHASE7_ACCEPTANCE_IDS.courseType,
			PHASE7_ACCEPTANCE_IDS.curriculumManager,
			AT
		);
	db.$client
		.prepare(
			`INSERT OR IGNORE INTO test_template_rules
		(id,test_template_version_id,subtask_version_id,question_count,position) VALUES (?,?,?,?,0)`
		)
		.run(
			PHASE7_ACCEPTANCE_IDS.templateRule,
			PHASE7_ACCEPTANCE_IDS.templateVersion,
			PHASE7_ACCEPTANCE_IDS.subtaskVersion,
			5
		);
	db.$client
		.prepare(
			`INSERT OR IGNORE INTO test_template_required_elements
		(id,test_template_version_id,element_version_id,subtask_version_id,position) VALUES (?,?,?,?,0)`
		)
		.run(
			PHASE7_ACCEPTANCE_IDS.templateElement,
			PHASE7_ACCEPTANCE_IDS.templateVersion,
			PHASE7_ACCEPTANCE_IDS.elementVersion,
			PHASE7_ACCEPTANCE_IDS.subtaskVersion
		);
	db.$client
		.prepare(
			`UPDATE test_template_versions SET lifecycle='published',submitted_at=?,
		reviewed_by_user_id=?,reviewed_at=?,published_at=?,effective_from=?
		WHERE id=? AND lifecycle='draft'`
		)
		.run(
			AT,
			PHASE7_ACCEPTANCE_IDS.administrator,
			AT,
			AT,
			EFFECTIVE_FROM,
			PHASE7_ACCEPTANCE_IDS.templateVersion
		);
}

export function seedPhase7AcceptanceData(db: FoundationDatabase, password: string): void {
	if (!validatePassword(password).ok) throw new Error('PHASE7_ACCEPTANCE_PASSWORD is invalid.');
	seedBaselineAuthorization(db, AT);
	insertUsers(db, hashPassword(password));
	insertCurriculum(db);
	insertQuestions(db);
	insertTemplate(db);
}

function parseDatabasePath(arguments_: string[]): string {
	if (arguments_.length === 2 && arguments_[0] === '--database' && arguments_[1])
		return arguments_[1];
	if (arguments_.length === 0 && process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
	throw new Error('Required: --database PATH (or DATABASE_PATH).');
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const databasePath = parseDatabasePath(process.argv.slice(2));
	const password = process.env.PHASE7_ACCEPTANCE_PASSWORD;
	if (!password) throw new Error('PHASE7_ACCEPTANCE_PASSWORD is required.');
	const database = openDatabase({ path: databasePath });
	try {
		database.transaction((tx) => seedPhase7AcceptanceData(tx, password));
		database.verify();
		process.stdout.write('Synthetic Phase 7 acceptance data is ready.\n');
	} finally {
		database.close();
	}
}
