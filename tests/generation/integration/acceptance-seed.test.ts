import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase, type DatabaseHandle } from '$lib/server/db';
import {
	PHASE7_ACCEPTANCE_IDS,
	seedPhase7AcceptanceData
} from '../../../scripts/phase7/seed-acceptance.js';

describe('Phase 7 synthetic acceptance data', () => {
	let database: DatabaseHandle | undefined;
	afterEach(() => database?.close());

	it('is idempotent and produces complete published generation inventory', () => {
		database = openDatabase({ path: ':memory:' });
		const password = 'Synthetic-P7-Test-Password-2026!';
		database.transaction((tx) => seedPhase7AcceptanceData(tx, password));
		database.transaction((tx) => seedPhase7AcceptanceData(tx, password));

		expect(
			database.sqlite
				.prepare("SELECT count(*) FROM users WHERE employee_number LIKE 'P7%'")
				.pluck()
				.get()
		).toBe(6);
		expect(
			database.sqlite
				.prepare(
					"SELECT count(*) FROM question_versions WHERE lifecycle='published' AND generation_status='eligible' AND id LIKE '70000000-0000-4000-8200-%'"
				)
				.pluck()
				.get()
		).toBe(6);
		expect(
			database.sqlite
				.prepare('SELECT lifecycle FROM test_template_versions WHERE id=?')
				.pluck()
				.get(PHASE7_ACCEPTANCE_IDS.templateVersion)
		).toBe('published');
		expect(
			database.sqlite
				.prepare('SELECT instructor_user_id FROM class_rosters WHERE id=?')
				.pluck()
				.get(PHASE7_ACCEPTANCE_IDS.roster)
		).toBe(PHASE7_ACCEPTANCE_IDS.assignedInstructor);
		expect(database.sqlite.pragma('foreign_key_check')).toEqual([]);
		expect(database.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
	});
});
