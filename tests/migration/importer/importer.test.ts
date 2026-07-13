import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import {
	importLegacyDump,
	LegacyImportError
} from '../../../src/lib/server/migration/importer/index.js';

const fixture = resolve('fixtures/phase-1/legacy-source/data.sql');
const temporaryDirectories: string[] = [];
const handles: DatabaseHandle[] = [];

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
	for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

function sha256(path: string): string {
	return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function database(): DatabaseHandle {
	const directory = mkdtempSync(join(tmpdir(), 'ast-import-db-'));
	temporaryDirectories.push(directory);
	const handle = openDatabase({ path: join(directory, 'target.sqlite') });
	handles.push(handle);
	return handle;
}

function approved(path = fixture) {
	return { path, sha256: sha256(path), byteSize: statSync(path).size };
}

describe('legacy importer', () => {
	it('imports the synthetic profile with stable mappings and no future hierarchy rows', async () => {
		const handle = database();
		const result = await importLegacyDump(handle, approved());
		const safeInventories = handle.sqlite
			.prepare(
				'SELECT source_table, accepted_count, quarantined_count FROM source_table_inventories ORDER BY source_table'
			)
			.all();
		expect(result).toMatchObject({
			sourceRows: 22,
			accepted: 17,
			quarantined: 5,
			alreadyImported: false
		});
		expect(safeInventories).toHaveLength(15);
		expect(
			handle.sqlite.prepare('SELECT count(*) FROM source_table_inventories').pluck().get()
		).toBe(15);
		expect(handle.sqlite.prepare('SELECT count(*) FROM legacy_tpos').pluck().get()).toBe(1);
		expect(handle.sqlite.prepare('SELECT count(*) FROM legacy_spos').pluck().get()).toBe(2);
		expect(handle.sqlite.prepare('SELECT count(*) FROM legacy_eos').pluck().get()).toBe(3);
		expect(handle.sqlite.prepare('SELECT count(*) FROM aircraft_variants').pluck().get()).toBe(2);
		expect(handle.sqlite.prepare('SELECT count(*) FROM question_versions').pluck().get()).toBe(5);
		expect(
			handle.sqlite
				.prepare('SELECT question_type FROM question_versions ORDER BY question_type')
				.pluck()
				.all()
		).toEqual([
			'all_correct',
			'none_correct',
			'single_choice',
			'true_false',
			'two_correct_compound'
		]);
		expect(
			handle.sqlite.prepare('SELECT count(*) FROM legacy_template_sources').pluck().get()
		).toBe(2);
		expect(
			handle.sqlite.prepare('SELECT count(*) FROM legacy_template_source_rules').pluck().get()
		).toBe(8);
		for (const table of ['phases', 'tasks', 'subtasks', 'elements', 'bloom_levels']) {
			expect(handle.sqlite.prepare(`SELECT count(*) FROM ${table}`).pluck().get()).toBe(0);
		}
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
	});

	it('is idempotent on the same target', async () => {
		const handle = database();
		const first = await importLegacyDump(handle, approved());
		const second = await importLegacyDump(handle, approved());
		expect(second).toMatchObject({ runId: first.runId, alreadyImported: true });
		expect(handle.sqlite.prepare('SELECT count(*) FROM import_runs').pluck().get()).toBe(1);
		expect(handle.sqlite.prepare('SELECT count(*) FROM questions').pluck().get()).toBe(5);
	});

	it('produces deterministic identities across fresh imports', async () => {
		const left = database();
		const right = database();
		await importLegacyDump(left, approved());
		await importLegacyDump(right, approved());
		const ids = (handle: DatabaseHandle) =>
			handle.sqlite
				.prepare(
					'SELECT source_table, source_id, target_table, target_id FROM source_target_mappings ORDER BY 1, 2, 3'
				)
				.all();
		expect(ids(left)).toEqual(ids(right));
	});

	it('rejects a checksum mismatch before opening an import transaction', async () => {
		const handle = database();
		await expect(
			importLegacyDump(handle, { ...approved(), sha256: '0'.repeat(64) })
		).rejects.toBeInstanceOf(LegacyImportError);
		expect(handle.sqlite.prepare('SELECT count(*) FROM import_runs').pluck().get()).toBe(0);
	});

	it('rolls back all accepted and quarantined records after a controlled parse failure', async () => {
		const directory = mkdtempSync(join(tmpdir(), 'ast-import-failure-'));
		temporaryDirectories.push(directory);
		const path = join(directory, 'broken.sql');
		writeFileSync(
			path,
			"INSERT INTO `TPO` VALUES (1, 1, 'safe'); INSERT INTO `SPO` VALUES (1, 1, 1, 'broken'"
		);
		const handle = database();
		await expect(importLegacyDump(handle, approved(path))).rejects.toBeInstanceOf(
			LegacyImportError
		);
		expect(handle.sqlite.prepare('SELECT count(*) FROM import_runs').pluck().get()).toBe(0);
		expect(handle.sqlite.prepare('SELECT count(*) FROM legacy_tpos').pluck().get()).toBe(0);
		expect(handle.sqlite.prepare('SELECT count(*) FROM quarantine_records').pluck().get()).toBe(0);
	});

	it('publishes only groups of five and strips snapshot linkage in restricted quarantine', async () => {
		const directory = mkdtempSync(join(tmpdir(), 'ast-import-aggregate-'));
		temporaryDirectories.push(directory);
		const path = join(directory, 'history.sql');
		const schema = readFileSync(resolve('fixtures/phase-1/legacy-source/schema.sql'), 'latin1');
		const data = readFileSync(fixture, 'latin1');
		const generated = Array.from(
			{ length: 10 },
			(_, index) =>
				`(${index + 1},501,'2014-01-01 00:00:00','${index < 6 ? 'SYNTH' : 'SMALL'}',${index < 6 ? 5 : 6},NULL,NULL,NULL)`
		).join(',');
		const records = Array.from(
			{ length: 6 },
			(_, index) =>
				`(${index + 1},'SYN-MEMBER-${index + 1}',NULL,NULL,NULL,'2014-01-01',NULL,'SYN-SYL','SYN-QUAL',NULL,0,'satisfactory',90)`
		).join(',');
		const results = Array.from({ length: 6 }, (_, index) => `(${index + 1},NULL,NULL,1001,1)`).join(
			','
		);
		writeFileSync(
			path,
			`${schema}\n${data}\nINSERT INTO \`createdTests\` VALUES ${generated};\n` +
				`INSERT INTO \`studentTestRecords\` VALUES ${records};\n` +
				`INSERT INTO \`testResults\` VALUES ${results};\n` +
				"INSERT INTO `usedQuestions` VALUES (NULL,NULL,'mc',NULL,NULL,'Synthetic snapshot prompt','Synthetic A','Synthetic B',NULL,NULL,'a');\n",
			'latin1'
		);
		const handle = database();
		const result = await importLegacyDump(handle, approved(path));
		expect(result).toMatchObject({ aggregated: 22, suppressed: 1 });
		expect(
			handle.sqlite
				.prepare(
					"SELECT count(*) FROM historical_generation_aggregates WHERE publication_state = 'published'"
				)
				.pluck()
				.get()
		).toBe(1);
		expect(
			handle.sqlite
				.prepare(
					"SELECT count(*) FROM historical_generation_aggregates WHERE publication_state = 'suppressed'"
				)
				.pluck()
				.get()
		).toBe(1);
		expect(
			handle.sqlite
				.prepare(
					"SELECT source_table, source_id FROM quarantine_records WHERE reason_code = 'restricted_snapshot_only_content'"
				)
				.get()
		).toEqual({ source_table: 'usedQuestions', source_id: null });
		expect(
			handle.sqlite
				.prepare(
					"SELECT count(*) FROM quarantine_records WHERE reason_code = 'aggregate_group_suppression'"
				)
				.pluck()
				.get()
		).toBe(1);
	});
});
