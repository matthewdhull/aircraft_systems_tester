export const PERMISSIONS = Object.freeze({
	USERS_VIEW: 'users.view',
	USERS_CREATE: 'users.create',
	USERS_EDIT: 'users.edit',
	USERS_LIFECYCLE: 'users.lifecycle',
	USERS_ROLES_MANAGE: 'users.roles.manage',
	CONFIGURATION_MANAGE: 'configuration.manage',
	RECORDS_ALL_MANAGE: 'records.all.manage',
	ROSTERS_ASSIGNED_MANAGE: 'rosters.assigned.manage',
	EXAMS_PUBLISH: 'exams.publish',
	EXAMS_START: 'exams.start',
	EXAMS_RECOVERY_AUTHORIZE: 'exams.recovery.authorize',
	EXAMS_EXTENSION_GRANT: 'exams.extension.grant',
	EXAMS_RETAKE_AUTHORIZE: 'exams.retake.authorize',
	EXAMS_RETRAINING_ASSIGN: 'exams.retraining.assign',
	EXAMS_REMEDIATION_MANAGE: 'exams.remediation.manage',
	EXAMS_PREVIEW: 'exams.preview',
	ATTEMPTS_ASSIGNED_VIEW: 'attempts.assigned.view',
	REPORTS_ASSIGNED_VIEW: 'reports.assigned.view',
	QUESTIONS_CREATE: 'questions.create',
	QUESTIONS_REVIEW: 'questions.review',
	QUESTIONS_PUBLISH: 'questions.publish',
	CURRICULUM_MANAGE: 'curriculum.manage',
	TEMPLATES_MANAGE: 'templates.manage',
	REPORTS_ORGANIZATION_VIEW: 'reports.organization.view',
	REPORTS_ORGANIZATION_EXPORT: 'reports.organization.export',
	ANSWER_KEYS_VIEW: 'answer_keys.view',
	QUESTIONS_INVALIDATE: 'questions.invalidate',
	RECORDS_RETIRE: 'records.retire',
	QUESTIONS_VIEW: 'questions.view'
} as const);

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const BASELINE_ROLES = Object.freeze({
	ADMINISTRATOR: 'administrator',
	INSTRUCTOR: 'instructor',
	QUESTION_AUTHOR: 'question_author',
	CURRICULUM_MANAGER: 'curriculum_manager',
	REPORT_VIEWER: 'report_viewer'
} as const);

export type BaselineRoleCode = (typeof BASELINE_ROLES)[keyof typeof BASELINE_ROLES];

export const ROLE_PERMISSION_POLICY: Readonly<Record<BaselineRoleCode, readonly PermissionCode[]>> =
	Object.freeze({
		[BASELINE_ROLES.ADMINISTRATOR]: Object.values(PERMISSIONS),
		[BASELINE_ROLES.INSTRUCTOR]: [
			PERMISSIONS.ROSTERS_ASSIGNED_MANAGE,
			PERMISSIONS.EXAMS_PUBLISH,
			PERMISSIONS.EXAMS_START,
			PERMISSIONS.EXAMS_RECOVERY_AUTHORIZE,
			PERMISSIONS.EXAMS_EXTENSION_GRANT,
			PERMISSIONS.EXAMS_RETAKE_AUTHORIZE,
			PERMISSIONS.EXAMS_RETRAINING_ASSIGN,
			PERMISSIONS.EXAMS_REMEDIATION_MANAGE,
			PERMISSIONS.EXAMS_PREVIEW,
			PERMISSIONS.ATTEMPTS_ASSIGNED_VIEW,
			PERMISSIONS.REPORTS_ASSIGNED_VIEW
		],
		[BASELINE_ROLES.QUESTION_AUTHOR]: [
			PERMISSIONS.QUESTIONS_VIEW,
			PERMISSIONS.QUESTIONS_CREATE,
			PERMISSIONS.QUESTIONS_REVIEW,
			PERMISSIONS.QUESTIONS_PUBLISH
		],
		[BASELINE_ROLES.CURRICULUM_MANAGER]: [
			PERMISSIONS.CURRICULUM_MANAGE,
			PERMISSIONS.TEMPLATES_MANAGE
		],
		[BASELINE_ROLES.REPORT_VIEWER]: [
			PERMISSIONS.REPORTS_ORGANIZATION_VIEW,
			PERMISSIONS.REPORTS_ORGANIZATION_EXPORT
		]
	});

export const ROLE_DISPLAY_NAMES: Readonly<Record<BaselineRoleCode, string>> = Object.freeze({
	administrator: 'Administrator',
	instructor: 'Instructor',
	question_author: 'Question Author',
	curriculum_manager: 'Curriculum Manager',
	report_viewer: 'Report Viewer'
});
