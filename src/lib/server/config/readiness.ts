import { openDatabase, type DatabaseHandle } from '$lib/server/db';
import { writeLog } from '$lib/server/logging';

import { ConfigurationError, loadServerConfig } from './index';

let databaseHandle: DatabaseHandle | undefined;
let shutdownRegistered = false;

function registerShutdown(): void {
	if (shutdownRegistered) return;

	process.once('sveltekit:shutdown', () => {
		closeReadinessDatabase();
		writeLog('info', 'application_shutdown', { signal: 'sveltekit:shutdown' });
	});
	shutdownRegistered = true;
}

export function verifyReadiness(environment: NodeJS.ProcessEnv = process.env): boolean {
	try {
		const config = loadServerConfig(environment);
		if (databaseHandle === undefined) {
			databaseHandle = openDatabase({ path: config.databasePath });
			registerShutdown();
		}
		databaseHandle.verify();
		return true;
	} catch (error) {
		const errorCode = error instanceof ConfigurationError ? error.code : 'database_unavailable';
		writeLog('warn', 'readiness_check_failed', { errorCode });
		return false;
	}
}

export function closeReadinessDatabase(): void {
	databaseHandle?.close();
	databaseHandle = undefined;
}
