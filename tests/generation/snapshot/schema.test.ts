import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/database.js';

let handle: DatabaseHandle | undefined;
let directory: string | undefined;

afterEach(() => {
	handle?.close();
	if (directory) rmSync(directory, { recursive: true, force: true });
	handle = undefined;
	directory = undefined;
});

describe('Phase 7 snapshot schema', () => {
	it('migrates cleanly with protected seed/code metadata and immutable snapshots', () => {
		directory = mkdtempSync(join(tmpdir(), 'ast-phase7-schema-'));
		handle = openDatabase({ path: join(directory, 'test.sqlite') });

		const examColumns = new Set(
			(handle.sqlite.pragma('table_info(exam_instances)') as { name: string }[]).map(
				(column) => column.name
			)
		);
		expect(examColumns.has('random_seed_envelope_version')).toBe(true);
		expect(examColumns.has('random_seed_key_id')).toBe(true);
		expect(examColumns.has('access_code_protection_version')).toBe(true);

		const triggers = handle.sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name")
			.pluck()
			.all() as string[];
		expect(triggers).toContain('exam_questions_snapshot_immutable');
		expect(triggers).toContain('exam_question_options_snapshot_immutable');
		expect(triggers).toContain('published_template_content_immutable');
		expect(handle.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(handle.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
	});
});
