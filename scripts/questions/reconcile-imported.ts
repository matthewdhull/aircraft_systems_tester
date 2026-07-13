import Database from 'better-sqlite3';

import {
	reconcileImportedQuestions,
	renderQuestionImportJson,
	renderQuestionImportMarkdown
} from '../../src/lib/server/question-migration/index.js';

function option(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

function main(): void {
	const path = option('--database');
	if (!path) throw new Error('Invalid arguments.');
	const format = option('--format') ?? 'json';
	if (!['json', 'markdown'].includes(format)) throw new Error('Invalid arguments.');
	const runId = option('--run-id');
	const database = new Database(path, { readonly: true, fileMustExist: true });
	try {
		const report = reconcileImportedQuestions(database, runId ? { importRunId: runId } : {});
		process.stdout.write(
			format === 'markdown'
				? renderQuestionImportMarkdown(report)
				: renderQuestionImportJson(report)
		);
		if (!report.passed) process.exitCode = 1;
	} finally {
		database.close();
	}
}

try {
	main();
} catch {
	process.stderr.write('Imported-question reconciliation failed.\n');
	process.exitCode = 1;
}
