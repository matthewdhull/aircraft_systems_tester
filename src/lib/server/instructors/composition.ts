import { recordAuditEvent } from '$lib/server/audit/index.js';
import { SessionService } from '$lib/server/auth/session.js';
import type { DatabaseHandle } from '$lib/server/db/database.js';
import {
	countEffectiveActiveAdministrators,
	hasEffectiveAdministratorCapability,
	isAdministratorRole
} from '$lib/server/authorization/index.js';
import {
	InstructorAdministrationService,
	defaultInstructorServiceDependencies
} from './service.js';

/** Compose real shared Phase 4 services. Tests construct the service with deterministic dependencies. */
export function createInstructorAdministrationService(
	database: DatabaseHandle
): InstructorAdministrationService {
	const sessions = new SessionService(database, recordAuditEvent);
	return new InstructorAdministrationService(
		database,
		defaultInstructorServiceDependencies({
			recordAuditEvent,
			revokeAllForUser: (userId, reason, tx) => {
				sessions.revokeAllForUser(userId, reason, tx);
			},
			isEffectiveActiveAdministrator: hasEffectiveAdministratorCapability,
			countEffectiveActiveAdministrators,
			isAdministratorRole
		})
	);
}
