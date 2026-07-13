import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';
import { importLegacyDump } from '../../../src/lib/server/migration/importer/index.js';
import { compareLogicalImports } from '../../../src/lib/server/migration/reconciliation/index.js';
import {
	reconcileImportedQuestions,
	renderQuestionImportJson,
	renderQuestionImportMarkdown
} from '../../../src/lib/server/question-migration/index.js';

const FIXTURE_PATH = resolve('fixtures/phase-1/legacy-source/data.sql');
const AUTHORITATIVE_PATH = resolve('backups/xjtest_production_backup.11.22.14.sql');
const AUTHORITATIVE_CHECKSUM = 'ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70';
const temporaryDirectories: string[] = [];
const handles: DatabaseHandle[] = [];

function sha256(path: string): string {
	return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function approved(path: string, checksum = sha256(path)) {
	return { path, sha256: checksum, byteSize: statSync(path).size };
}

function database(label: string): DatabaseHandle {
	const directory = mkdtempSync(join(tmpdir(), `ast-question-${label}-`));
	temporaryDirectories.push(directory);
	const handle = openDatabase({ path: join(directory, 'target.sqlite') });
	handles.push(handle);
	return handle;
}

let fixture: DatabaseHandle;
let authoritative: DatabaseHandle;

beforeAll(async () => {
	fixture = database('fixture');
	authoritative = database('authoritative');
	await importLegacyDump(fixture, approved(FIXTURE_PATH));
	await importLegacyDump(authoritative, approved(AUTHORITATIVE_PATH, AUTHORITATIVE_CHECKSUM));
}, 30_000);

afterAll(() => {
	for (const handle of handles.splice(0)) handle.close();
	for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

describe('imported-question reconciliation', () => {
	it('reconciles every fixture outcome and canonical question dimension', () => {
		const report = reconcileImportedQuestions(fixture.sqlite);

		expect(report.passed).toBe(true);
		expect(report.inventory).toEqual({ tableCount: 15, dispositionViolationCount: 0 });
		expect(report.outcomes).toEqual({
			source: 8,
			accepted: 5,
			quarantined: 3,
			unreconciled: 0,
			acceptedQuarantineOverlapCount: 0
		});
		expect(report.questions.byType).toEqual({
			true_false: 1,
			single_choice: 1,
			two_correct_compound: 1,
			all_correct: 1,
			none_correct: 1
		});
		expect(report.questions.byAircraftVariant).toEqual({ 'SYN-A': 3, 'SYN-B': 2 });
		expect(report.questions.legacyCurriculum).toEqual({
			linkCount: 5,
			linkedVersionCount: 5,
			tpoCount: 1,
			spoCount: 2,
			eoCount: 3,
			parentViolationCount: 0
		});
		expect(report.quarantine.byReason).toMatchObject({
			curriculum_parent_mismatch: 1,
			duplicate_candidate: 1,
			zero_or_sentinel_relationship: 1
		});
		expect(report.checks.every((item) => item.passed)).toBe(true);
	});

	it('proves imported versions remain review/blocked with no future links or eligibility', () => {
		for (const report of [
			reconcileImportedQuestions(fixture.sqlite),
			reconcileImportedQuestions(authoritative.sqlite)
		]) {
			expect(report.questions.byLifecycle).toEqual({
				draft: 0,
				review: report.questions.versionCount,
				published: 0,
				retired: 0
			});
			expect(report.questions.byGenerationStatus).toEqual({
				blocked: report.questions.versionCount,
				eligible: 0
			});
			expect(report.questions.futureCurriculum).toEqual({
				linkCount: 0,
				byReviewStatus: { review: 0, approved: 0, retired: 0 }
			});
		}
	});

	it('reconciles the authoritative source by type, aircraft, curriculum, and quarantine reason', () => {
		const report = reconcileImportedQuestions(authoritative.sqlite);

		expect(report.passed).toBe(true);
		expect(report.outcomes).toEqual({
			source: 657,
			accepted: 612,
			quarantined: 45,
			unreconciled: 0,
			acceptedQuarantineOverlapCount: 0
		});
		expect(report.questions.byType).toEqual({
			true_false: 72,
			single_choice: 474,
			two_correct_compound: 32,
			all_correct: 29,
			none_correct: 5
		});
		expect(report.questions.byAircraftVariant).toEqual({ crj: 372, erj: 240 });
		expect(report.questions.legacyCurriculum).toEqual({
			linkCount: 612,
			linkedVersionCount: 612,
			tpoCount: 1,
			spoCount: 19,
			eoCount: 164,
			parentViolationCount: 0
		});
		expect(report.quarantine.byReason).toMatchObject({
			curriculum_parent_mismatch: 8,
			malformed_question_shape: 2,
			zero_or_sentinel_relationship: 35
		});
	}, 30_000);

	it('is identical on repeat and independent imports', async () => {
		const before = reconcileImportedQuestions(fixture.sqlite);
		const repeated = await importLegacyDump(fixture, approved(FIXTURE_PATH));
		expect(repeated.alreadyImported).toBe(true);
		expect(reconcileImportedQuestions(fixture.sqlite)).toEqual(before);

		const independent = database('independent');
		await importLegacyDump(independent, approved(FIXTURE_PATH));
		expect(reconcileImportedQuestions(independent.sqlite)).toEqual(before);
		expect(compareLogicalImports(fixture.sqlite, independent.sqlite)).toMatchObject({
			equivalent: true,
			differences: []
		});
	}, 30_000);

	it('renders count-only reports without assessment content, answer material, or identifiers', () => {
		const report = reconcileImportedQuestions(fixture.sqlite);
		const json = renderQuestionImportJson(report);
		const markdown = renderQuestionImportMarkdown(report);
		const rendered = `${json}\n${markdown}`;
		const protectedValues = fixture.sqlite
			.prepare(
				`select prompts.prompt_text as prompt, options.option_text as option
				 from question_prompts prompts
				 join question_options options on options.question_version_id = prompts.question_version_id
				 order by length(prompts.prompt_text) desc, length(options.option_text) desc limit 1`
			)
			.get() as { prompt: string; option: string };

		expect(rendered).not.toContain(protectedValues.prompt);
		expect(rendered).not.toContain(protectedValues.option);
		expect(rendered).not.toMatch(/source[_ ]?id|target[_ ]?id|version[_ ]?id/i);
		expect(rendered).not.toContain(FIXTURE_PATH);
		expect(rendered).not.toMatch(/isCorrect|semanticValue|keyLetter/);
	});

	it('fails closed when an imported shape is altered in place', async () => {
		const altered = database('altered');
		await importLegacyDump(altered, approved(FIXTURE_PATH));
		altered.sqlite
			.prepare(
				`update question_options set is_correct = 1
				 where id = (select id from question_options where is_correct = 0 limit 1)`
			)
			.run();

		const report = reconcileImportedQuestions(altered.sqlite);
		expect(report.passed).toBe(false);
		expect(report.checks.find((item) => item.name.includes('canonical contract'))).toMatchObject({
			passed: false,
			violationCount: 1
		});
	}, 30_000);
});
