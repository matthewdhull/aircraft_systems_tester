import { writeLog } from '$lib/server/logging';

import { closeApplicationDatabase, getApplicationDatabase } from './application.js';
import { ConfigurationError } from './index';

export function verifyReadiness(environment: NodeJS.ProcessEnv = process.env): boolean {
	try {
		getApplicationDatabase(environment).verify();
		return true;
	} catch (error) {
		const errorCode = error instanceof ConfigurationError ? error.code : 'database_unavailable';
		writeLog('warn', 'readiness_check_failed', { errorCode });
		return false;
	}
}

export function closeReadinessDatabase(): void {
	closeApplicationDatabase();
}
