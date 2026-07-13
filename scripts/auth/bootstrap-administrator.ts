#!/usr/bin/env node
import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import {
	bootstrapFirstAdministrator,
	MINIMUM_PASSWORD_LENGTH
} from '../../src/lib/server/auth/index.js';
import { seedBaselineAuthorization } from '../../src/lib/server/authorization/index.js';
import { openDatabase } from '../../src/lib/server/db/index.js';
import { readHidden } from './read-hidden.js';

interface Options {
	database: string;
	employeeNumber: string;
	firstName: string;
	lastName: string;
}

function parseOptions(arguments_: string[]): Options {
	const values = new Map<string, string>();
	const allowed = new Set(['database', 'employee-number', 'first-name', 'last-name']);
	for (let index = 0; index < arguments_.length; index += 2) {
		const key = arguments_[index];
		const value = arguments_[index + 1];
		if (!key?.startsWith('--') || !value) throw new Error('Invalid bootstrap arguments.');
		const name = key.slice(2);
		if (!allowed.has(name) || values.has(name)) throw new Error('Invalid bootstrap arguments.');
		values.set(name, value);
	}
	const database = values.get('database') ?? process.env.DATABASE_PATH;
	const employeeNumber = values.get('employee-number');
	const firstName = values.get('first-name');
	const lastName = values.get('last-name');
	if (!database || !employeeNumber || !firstName || !lastName) {
		throw new Error(
			'Required: --database PATH --employee-number VALUE --first-name VALUE --last-name VALUE'
		);
	}
	return { database, employeeNumber, firstName, lastName };
}

async function main(): Promise<void> {
	const options = parseOptions(process.argv.slice(2));
	const password = await readHidden(
		`New administrator password (minimum ${MINIMUM_PASSWORD_LENGTH} characters): `
	);
	const database = openDatabase({ path: options.database });
	try {
		database.transaction((tx) => seedBaselineAuthorization(tx, new Date().toISOString()));
		const result = bootstrapFirstAdministrator(
			database,
			{
				employeeNumber: options.employeeNumber,
				firstName: options.firstName,
				lastName: options.lastName,
				password
			},
			recordAuditEvent
		);
		if (!result.ok) throw new Error(result.message);
		process.stdout.write('First administrator created and audited.\n');
	} finally {
		database.close();
	}
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : 'Bootstrap failed.';
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
});
