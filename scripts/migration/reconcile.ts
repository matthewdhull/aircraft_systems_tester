import { writeFileSync } from 'node:fs';

import Database from 'better-sqlite3';

import {
	compareLogicalImports,
	reconcileDatabase,
	renderComparisonMarkdown,
	renderReconciliationJson,
	renderReconciliationMarkdown
} from '../../src/lib/server/migration/reconciliation/index.js';

function valueAfter(args: string[], option: string): string | undefined {
	const index = args.indexOf(option);
	return index >= 0 ? args[index + 1] : undefined;
}

function requireValue(args: string[], option: string): string {
	const value = valueAfter(args, option);
	if (!value) throw new Error('Invalid reconciliation arguments.');
	return value;
}

function openReadOnly(path: string): Database.Database {
	return new Database(path, { readonly: true, fileMustExist: true });
}

function main(): void {
	const args = process.argv.slice(2);
	const firstPath = requireValue(args, '--database');
	const secondPath = valueAfter(args, '--compare');
	const jsonPath = valueAfter(args, '--json');
	const markdownPath = valueAfter(args, '--markdown');
	const importRunId = valueAfter(args, '--run-id');
	const first = openReadOnly(firstPath);
	let second: Database.Database | undefined;
	try {
		if (secondPath) {
			second = openReadOnly(secondPath);
			const comparison = compareLogicalImports(first, second);
			if (jsonPath)
				writeFileSync(jsonPath, `${JSON.stringify(comparison, null, 2)}\n`, { mode: 0o600 });
			if (markdownPath)
				writeFileSync(markdownPath, renderComparisonMarkdown(comparison), { mode: 0o600 });
			if (!comparison.equivalent) process.exitCode = 1;
		} else {
			const report = reconcileDatabase(first, importRunId ? { importRunId } : {});
			if (jsonPath) writeFileSync(jsonPath, renderReconciliationJson(report), { mode: 0o600 });
			if (markdownPath)
				writeFileSync(markdownPath, renderReconciliationMarkdown(report), { mode: 0o600 });
			if (!report.passed) process.exitCode = 1;
		}
		process.stdout.write('Reconciliation completed.\n');
	} finally {
		second?.close();
		first.close();
	}
}

try {
	main();
} catch {
	process.stderr.write('Reconciliation failed.\n');
	process.exitCode = 1;
}
