import { writeFileSync } from 'node:fs';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import type { FoundationDatabase } from '../../src/lib/server/db/database.js';
import { foundationSchema } from '../../src/lib/server/db/schema.js';
import {
	reconcileCurriculumMappings,
	renderCurriculumReconciliationJson,
	renderCurriculumReconciliationMarkdown
} from '../../src/lib/server/curriculum-mapping/index.js';

function valueAfter(args: readonly string[], option: string): string | undefined {
	const index = args.indexOf(option);
	return index >= 0 ? args[index + 1] : undefined;
}

function requiredValue(args: readonly string[], option: string): string {
	const value = valueAfter(args, option);
	if (!value) throw new Error('Invalid curriculum reconciliation arguments.');
	return value;
}

function main(): void {
	const args = process.argv.slice(2);
	const databasePath = requiredValue(args, '--database');
	const jsonPath = valueAfter(args, '--json');
	const markdownPath = valueAfter(args, '--markdown');
	const sqlite = new Database(databasePath, { readonly: true, fileMustExist: true });
	try {
		const db = drizzle(sqlite, { schema: foundationSchema }) as FoundationDatabase;
		const report = reconcileCurriculumMappings(db, { now: () => new Date() });
		if (jsonPath) {
			writeFileSync(jsonPath, renderCurriculumReconciliationJson(report), { mode: 0o600 });
		}
		if (markdownPath) {
			writeFileSync(markdownPath, renderCurriculumReconciliationMarkdown(report), { mode: 0o600 });
		}
		process.stdout.write(
			`Curriculum mapping reconciliation ${report.passed ? 'passed' : 'failed'} with ${report.checks.reduce((sum, item) => sum + item.violationCount, 0)} safety violations.\n`
		);
		if (!report.passed) process.exitCode = 1;
	} finally {
		sqlite.close();
	}
}

try {
	main();
} catch {
	process.stderr.write('Curriculum mapping reconciliation failed.\n');
	process.exitCode = 1;
}
