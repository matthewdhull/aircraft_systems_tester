import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { SOURCE_TABLES } from '../../../src/lib/server/db/schema.js';
import {
	EXPECTED_SOURCE_DISPOSITIONS,
	QUARANTINE_REASON_CODES,
	RECONCILIATION_OUTCOMES,
	compareLogicalImports,
	reconcileDatabase,
	renderComparisonMarkdown,
	renderReconciliationJson,
	renderReconciliationMarkdown
} from '../../../src/lib/server/migration/reconciliation/index.js';

const handles: DatabaseHandle[] = [];
const CHECKSUM = 'a8e02025608f7ca1cbd3020fed7863dba9128938b303a97643a59e746b169eec';

function createRun(options: { omitTable?: string; secretShape?: string } = {}): DatabaseHandle {
	const handle = openDatabase({ path: ':memory:' });
	handles.push(handle);
	const sqlite = handle.sqlite;
	sqlite
		.prepare(
			`insert into import_runs
			 (id, importer_version, source_checksum, source_byte_size, status, started_at, completed_at)
			 values (?, ?, ?, ?, 'completed', ?, ?)`
		)
		.run('run-1', '3.0.0', CHECKSUM, 100, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:01.000Z');
	const insertInventory = sqlite.prepare(
		`insert into source_table_inventories
		 (id, import_run_id, source_table, disposition, source_count)
		 values (?, 'run-1', ?, ?, 0)`
	);
	for (const table of SOURCE_TABLES) {
		if (table !== options.omitTable) {
			insertInventory.run(`inventory-${table}`, table, EXPECTED_SOURCE_DISPOSITIONS[table]);
		}
	}
	if (options.secretShape) {
		sqlite
			.prepare(
				`insert into legacy_template_sources
				 (id, import_run_id, source_table, source_id, source_shape_json)
				 values ('template-1', 'run-1', 'test_model', 'source-1', ?)`
			)
			.run(options.secretShape);
	}
	return handle;
}

afterEach(() => {
	while (handles.length) handles.pop()?.close();
});

describe('migration reconciliation', () => {
	it('publishes the stable outcome and quarantine taxonomies', () => {
		expect(RECONCILIATION_OUTCOMES).toEqual([
			'rejected',
			'quarantined',
			'accepted',
			'excluded',
			'aggregated',
			'suppressed'
		]);
		expect(QUARANTINE_REASON_CODES).toHaveLength(12);
	});

	it('reconciles every source disposition and all safety checks deterministically', () => {
		const report = reconcileDatabase(createRun().sqlite);

		expect(report.passed).toBe(true);
		expect(report.sourceTables.map((row) => row.name)).toEqual(SOURCE_TABLES);
		expect(report.sourceTables).toHaveLength(15);
		expect(report.checks.every((item) => item.passed)).toBe(true);
		expect(Object.keys(report.questions.byType)).toEqual([
			'true_false',
			'single_choice',
			'two_correct_compound',
			'all_correct',
			'none_correct'
		]);
		expect(Object.values(report.quarantine.byReason).every((value) => value === 0)).toBe(true);
	});

	it('fails closed when a source inventory is incomplete', () => {
		const report = reconcileDatabase(createRun({ omitTable: 'logins' }).sqlite);

		expect(report.passed).toBe(false);
		expect(report.sourceTables.find((row) => row.name === 'logins')?.disposition).toBe('missing');
		expect(report.checks.find((item) => item.name.includes('inventory'))).toMatchObject({
			passed: false,
			violationCount: 1
		});
	});

	it('renders safe deterministic JSON and Markdown without database content', () => {
		const secret = 'PROTECTED_QUESTION_AND_ANSWER';
		const report = reconcileDatabase(createRun({ secretShape: secret }).sqlite);
		const json = renderReconciliationJson(report);
		const markdown = renderReconciliationMarkdown(report);

		expect(json).not.toContain(secret);
		expect(markdown).not.toContain(secret);
		expect(renderReconciliationJson(report)).toBe(json);
		expect(renderReconciliationMarkdown(report)).toBe(markdown);
		expect(markdown).toContain('| test_model | template_source |');
	});

	it('compares independent imports without exposing differing content', () => {
		const protectedLeft = 'PROTECTED_LEFT';
		const protectedRight = 'PROTECTED_RIGHT';
		const left = createRun({ secretShape: protectedLeft });
		const equivalent = createRun({ secretShape: protectedLeft });
		const different = createRun({ secretShape: protectedRight });

		expect(compareLogicalImports(left.sqlite, equivalent.sqlite)).toMatchObject({
			equivalent: true,
			differences: []
		});
		const comparison = compareLogicalImports(left.sqlite, different.sqlite);
		const markdown = renderComparisonMarkdown(comparison);
		expect(comparison.equivalent).toBe(false);
		expect(comparison.differences).toEqual([
			{ table: 'legacy_template_sources', leftCount: 1, rightCount: 1 }
		]);
		expect(JSON.stringify(comparison) + markdown).not.toContain(protectedLeft);
		expect(JSON.stringify(comparison) + markdown).not.toContain(protectedRight);
	});
});
