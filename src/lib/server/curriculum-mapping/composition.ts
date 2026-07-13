import { recordAuditEvent } from '$lib/server/audit/index.js';
import type { DatabaseHandle } from '$lib/server/db/database.js';
import {
	CurriculumMappingService,
	defaultCurriculumMappingServiceDependencies
} from './service.js';

export function createCurriculumMappingService(database: DatabaseHandle): CurriculumMappingService {
	return new CurriculumMappingService(
		database,
		defaultCurriculumMappingServiceDependencies({ recordAuditEvent })
	);
}
