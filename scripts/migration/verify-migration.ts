import Database from 'better-sqlite3';

import { openDatabase } from '../../src/lib/server/db/index.js';

function argumentAfter(flag: string): string | undefined {
	const index = process.argv.indexOf(flag);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

function safeChecks(sqlite: Database.Database): Record<string, string | number | boolean> {
	const foreignKeyViolations = (sqlite.pragma('foreign_key_check') as unknown[]).length;
	const integrity = String(sqlite.pragma('integrity_check', { simple: true }));
	const quick = String(sqlite.pragma('quick_check', { simple: true }));
	const hierarchyRows = Number(
		sqlite
			.prepare(
				`select
				 (select count(*) from phases) +
				 (select count(*) from tasks) +
				 (select count(*) from subtasks) +
				 (select count(*) from elements) +
				 (select count(*) from bloom_levels)`
			)
			.pluck()
			.get()
	);
	const prohibitedOperationalRows = Number(
		sqlite
			.prepare(
				`select
				 (select count(*) from users) +
				 (select count(*) from sessions) +
				 (select count(*) from exam_instances) +
				 (select count(*) from exam_attempts) +
				 (select count(*) from attempt_answers)`
			)
			.pluck()
			.get()
	);

	return {
		status:
			foreignKeyViolations === 0 &&
			integrity === 'ok' &&
			quick === 'ok' &&
			hierarchyRows === 0 &&
			prohibitedOperationalRows === 0
				? 'ok'
				: 'failed',
		foreignKeyViolations,
		integrity,
		quick,
		hierarchyRows,
		prohibitedOperationalRows,
		migrationCount: Number(
			sqlite.prepare('select count(*) from __drizzle_migrations').pluck().get()
		)
	};
}

function main(): void {
	const emptyTarget = argumentAfter('--empty-target');
	const databasePath = argumentAfter('--database');
	const target = emptyTarget ?? databasePath;
	if (!target || (emptyTarget && databasePath)) throw new Error('Invalid verification arguments.');

	if (emptyTarget) {
		const handle = openDatabase({ path: emptyTarget });
		try {
			const result = safeChecks(handle.sqlite);
			process.stdout.write(`${JSON.stringify(result)}\n`);
			if (result.status !== 'ok') process.exitCode = 1;
		} finally {
			handle.close();
		}
		return;
	}

	const sqlite = new Database(target, { readonly: true, fileMustExist: true });
	try {
		const result = safeChecks(sqlite);
		process.stdout.write(`${JSON.stringify(result)}\n`);
		if (result.status !== 'ok') process.exitCode = 1;
	} finally {
		sqlite.close();
	}
}

try {
	main();
} catch {
	process.stderr.write('Migration verification failed.\n');
	process.exitCode = 1;
}
