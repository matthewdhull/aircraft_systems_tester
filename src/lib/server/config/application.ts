import { seedBaselineAuthorization, systemClock, type Clock } from '$lib/server/authorization';
import { openDatabase, type DatabaseHandle } from '$lib/server/db';
import { writeLog } from '$lib/server/logging';

import { loadServerConfig } from './index.js';

let databaseHandle: DatabaseHandle | undefined;
let shutdownRegistered = false;

function registerShutdown(): void {
	if (shutdownRegistered) return;
	process.once('sveltekit:shutdown', () => {
		closeApplicationDatabase();
		writeLog('info', 'application_shutdown', { signal: 'sveltekit:shutdown' });
	});
	shutdownRegistered = true;
}

export function getApplicationDatabase(
	environment: NodeJS.ProcessEnv = process.env,
	clock: Clock = systemClock
): DatabaseHandle {
	if (databaseHandle) return databaseHandle;
	const config = loadServerConfig(environment);
	const opened = openDatabase({ path: config.databasePath });
	try {
		opened.transaction((db) => seedBaselineAuthorization(db, clock.now().toISOString()));
		databaseHandle = opened;
		registerShutdown();
		return opened;
	} catch (cause) {
		opened.close();
		throw cause;
	}
}

export function closeApplicationDatabase(): void {
	databaseHandle?.close();
	databaseHandle = undefined;
}
