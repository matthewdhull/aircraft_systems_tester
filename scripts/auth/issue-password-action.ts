#!/usr/bin/env node
import { recordAuditEvent } from '../../src/lib/server/audit/index.js';
import {
	PasswordActionService,
	SessionService,
	verifyPassword,
	type PasswordActionPurpose
} from '../../src/lib/server/auth/index.js';
import { hasEffectiveAdministratorCapability } from '../../src/lib/server/authorization/index.js';
import { openDatabase } from '../../src/lib/server/db/index.js';
import { readHidden } from './read-hidden.js';

function parseOptions(arguments_: string[]): Map<string, string> {
	const allowed = new Set([
		'database',
		'actor-employee-number',
		'target-employee-number',
		'purpose'
	]);
	const values = new Map<string, string>();
	for (let index = 0; index < arguments_.length; index += 2) {
		const key = arguments_[index];
		const value = arguments_[index + 1];
		if (!key?.startsWith('--') || !value) throw new Error('Invalid password-action arguments.');
		const name = key.slice(2);
		if (!allowed.has(name) || values.has(name))
			throw new Error('Invalid password-action arguments.');
		values.set(name, value);
	}
	return values;
}

async function main(): Promise<void> {
	const options = parseOptions(process.argv.slice(2));
	const databasePath = options.get('database') ?? process.env.DATABASE_PATH;
	const actorEmployeeNumber = options.get('actor-employee-number');
	const targetEmployeeNumber = options.get('target-employee-number');
	const purpose = options.get('purpose') as PasswordActionPurpose | undefined;
	if (
		!databasePath ||
		!actorEmployeeNumber ||
		!targetEmployeeNumber ||
		!purpose ||
		!['initialize', 'reset'].includes(purpose)
	) {
		throw new Error(
			'Required: --database PATH --actor-employee-number VALUE --target-employee-number VALUE --purpose initialize|reset'
		);
	}
	const actorPassword = await readHidden('Administrator password: ');
	const database = openDatabase({ path: databasePath });
	try {
		const actor = database.sqlite
			.prepare(
				"SELECT id, password_hash FROM users WHERE employee_number = ? AND status = 'active'"
			)
			.get(actorEmployeeNumber) as { id: string; password_hash: string | null } | undefined;
		const target = database.sqlite
			.prepare("SELECT id FROM users WHERE employee_number = ? AND status <> 'retired'")
			.get(targetEmployeeNumber) as { id: string } | undefined;
		if (
			!actor?.password_hash ||
			!verifyPassword(actorPassword, actor.password_hash) ||
			!hasEffectiveAdministratorCapability(database.db, actor.id) ||
			!target
		) {
			throw new Error('The password action could not be authorized.');
		}
		const sessions = new SessionService(database, recordAuditEvent);
		const result = new PasswordActionService(database, sessions, recordAuditEvent).issue(
			target.id,
			purpose,
			actor.id
		);
		if (!result.ok) throw new Error('The password action could not be created.');
		process.stdout.write(`${result.rawToken}\n`);
		process.stderr.write(
			'Single-use token emitted once; transfer it securely and do not save terminal output.\n'
		);
	} finally {
		database.close();
	}
}

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : 'Password action failed.'}\n`);
	process.exitCode = 1;
});
