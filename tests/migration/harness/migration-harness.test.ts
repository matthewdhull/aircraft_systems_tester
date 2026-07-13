import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import {
	importLegacyDump,
	LegacyImportError,
	profileLegacyDump,
	scanMysqlTableDeclarations
} from '../../../src/lib/server/migration/importer/index.js';
import {
	compareLogicalImports,
	reconcileDatabase
} from '../../../src/lib/server/migration/reconciliation/index.js';

const fixtureData = resolve('fixtures/phase-1/legacy-source/data.sql');
const fixtureSchema = resolve('fixtures/phase-1/legacy-source/schema.sql');
const expectedProfilePath = resolve('fixtures/phase-1/legacy-source/expected-profile.json');
const goldenManifestPath = resolve('fixtures/phase-1/golden-behavior/manifest.json');
const temporaryDirectories: string[] = [];
const handles: DatabaseHandle[] = [];

function sha256(path: string): string {
	return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function approved(path = fixtureData) {
	return { path, sha256: sha256(path), byteSize: statSync(path).size };
}

function database(name = 'target.sqlite'): DatabaseHandle {
	const directory = mkdtempSync(join(tmpdir(), 'ast-migration-harness-'));
	temporaryDirectories.push(directory);
	const handle = openDatabase({ path: join(directory, name) });
	handles.push(handle);
	return handle;
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
	for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

describe('Phase 3 migration harness', () => {
	it('matches the synthetic source shape, expected profile, and golden manifest coverage', async () => {
		const expected = JSON.parse(readFileSync(expectedProfilePath, 'utf8')) as {
			source_shape: { table_count: number };
			tables: Record<string, { fixture_rows: number }>;
		};
		const manifest = JSON.parse(readFileSync(goldenManifestPath, 'utf8')) as {
			entries: Array<{ case_ids: string[] }>;
		};
		const declarations = await scanMysqlTableDeclarations(fixtureSchema);
		const profile = await profileLegacyDump(approved());
		const caseIds = manifest.entries.flatMap((entry) => entry.case_ids);

		expect(declarations.size).toBe(expected.source_shape.table_count);
		expect(profile.sourceRows).toBe(22);
		for (const [table, contract] of Object.entries(expected.tables)) {
			expect(profile.tables[table as keyof typeof profile.tables]).toBe(contract.fixture_rows);
		}
		expect(caseIds).toHaveLength(67);
		expect(new Set(caseIds).size).toBe(67);
	});

	it('proves same-target idempotence and independent logical equivalence', async () => {
		const first = database('first.sqlite');
		const second = database('second.sqlite');
		const initial = await importLegacyDump(first, approved());
		const repeated = await importLegacyDump(first, approved());
		await importLegacyDump(second, approved());

		expect(repeated).toMatchObject({ runId: initial.runId, alreadyImported: true });
		expect(first.sqlite.prepare('select count(*) from import_runs').pluck().get()).toBe(1);
		expect(compareLogicalImports(first.sqlite, second.sqlite)).toMatchObject({
			equivalent: true,
			differences: []
		});
		expect(reconcileDatabase(first.sqlite).passed).toBe(true);
	});

	it('rolls back a controlled mid-stream parse failure', async () => {
		const directory = mkdtempSync(join(tmpdir(), 'ast-migration-rollback-'));
		temporaryDirectories.push(directory);
		const broken = join(directory, 'broken.sql');
		writeFileSync(
			broken,
			"INSERT INTO `TPO` VALUES (1,1,'synthetic'); INSERT INTO `SPO` VALUES (1,1,1,'broken'"
		);
		const target = database();

		await expect(importLegacyDump(target, approved(broken))).rejects.toBeInstanceOf(
			LegacyImportError
		);
		expect(target.sqlite.prepare('select count(*) from import_runs').pluck().get()).toBe(0);
		expect(target.sqlite.prepare('select count(*) from legacy_tpos').pluck().get()).toBe(0);
		expect(target.sqlite.prepare('select count(*) from quarantine_records').pluck().get()).toBe(0);
	});

	it('keeps future and prohibited operational structures empty with clean integrity checks', async () => {
		const target = database();
		await importLegacyDump(target, approved());
		for (const table of [
			'users',
			'sessions',
			'phases',
			'tasks',
			'subtasks',
			'elements',
			'bloom_levels',
			'exam_instances',
			'exam_attempts',
			'attempt_answers'
		]) {
			expect(target.sqlite.prepare(`select count(*) from ${table}`).pluck().get()).toBe(0);
		}
		expect(target.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(target.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
		expect(target.sqlite.pragma('quick_check', { simple: true })).toBe('ok');
	});

	it('keeps generated databases and protected outputs ignored', () => {
		for (const path of [
			'.runtime/phase3.sqlite',
			'.runtime/authoritative-reconciliation.json',
			'local-phase3.sqlite'
		]) {
			expect(
				execFileSync('git', ['check-ignore', '--quiet', path], { stdio: 'ignore' })
			).toBeNull();
		}
	});
});
