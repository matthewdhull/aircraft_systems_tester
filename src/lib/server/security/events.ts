export const SECURITY_EVENT = {
	LOGIN_SUCCEEDED: 'authentication.login.succeeded',
	LOGIN_FAILED: 'authentication.login.failed',
	LOGIN_RATE_LIMITED: 'authentication.login.rate_limited',
	LOGOUT: 'authentication.logout',
	SESSION_CREATED: 'session.created',
	SESSION_ROTATED: 'session.rotated',
	SESSION_REVOKED: 'session.revoked',
	PASSWORD_INITIALIZED: 'password.initialized',
	PASSWORD_RESET: 'password.reset',
	BOOTSTRAP_ADMINISTRATOR_CREATED: 'bootstrap.administrator.created',
	USER_CREATED: 'user.created',
	USER_UPDATED: 'user.updated',
	USER_STATUS_CHANGED: 'user.status.changed',
	EMPLOYEE_NUMBER_CHANGED: 'user.employee_number.changed',
	ROLE_GRANTED: 'user.role.granted',
	ROLE_REVOKED: 'user.role.revoked'
} as const;

export type SecurityEventAction = (typeof SECURITY_EVENT)[keyof typeof SECURITY_EVENT];

export const SESSION_REVOCATION_REASON = {
	LOGOUT: 'logout',
	ROTATION: 'rotation',
	ACCOUNT_SUSPENDED: 'account_suspended',
	ACCOUNT_DEACTIVATED: 'account_deactivated',
	ACCOUNT_RETIRED: 'account_retired',
	PASSWORD_CHANGED: 'password_changed',
	ADMINISTRATIVE_REVOCATION: 'administrative_revocation',
	EXPIRED: 'expired'
} as const;

export type SessionRevocationReason =
	(typeof SESSION_REVOCATION_REASON)[keyof typeof SESSION_REVOCATION_REASON];
