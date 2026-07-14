import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import type { AuthenticatedPrincipal } from '$lib/server/authorization';
import type { DatabaseHandle } from '$lib/server/db';
import { foundationSchema } from '$lib/server/db/schema';
import { auditGeneratedExamView } from '$lib/server/generation/service';

const open: Database.Database[] = [];

function fixture(): { sqlite: Database.Database; database: DatabaseHandle } {
	const sqlite = new Database(':memory:');
	open.push(sqlite);
	sqlite.exec(`CREATE TABLE audit_events (
		id TEXT PRIMARY KEY NOT NULL, actor_user_id TEXT, action TEXT NOT NULL,
		entity_type TEXT NOT NULL, entity_id TEXT, before_json TEXT, after_json TEXT,
		occurred_at TEXT NOT NULL, retention_until TEXT
	)`);
	const db = drizzle(sqlite, { schema: foundationSchema });
	return {
		sqlite,
		database: {
			db,
			sqlite,
			pathKind: 'memory',
			busyTimeoutMs: 0,
			verify: () => {
				throw new Error('unused');
			},
			transaction: (work) => work(db),
			close: () => sqlite.close()
		} as DatabaseHandle
	};
}

const principal: AuthenticatedPrincipal = {
	userId: 'actor-7',
	employeeNumber: 'P7007',
	displayName: 'Synthetic Reviewer',
	roles: ['administrator'],
	permissions: new Set(),
	sessionIdHash: 'synthetic-session-reference'
};

afterEach(() => {
	for (const sqlite of open.splice(0)) sqlite.close();
});

describe('generated exam view auditing', () => {
	it('records every repeated preview and privileged answer-key view with safe metadata', () => {
		const { database, sqlite } = fixture();
		for (const keyView of [false, false, true]) {
			auditGeneratedExamView({
				database,
				principal,
				examId: 'exam-7',
				questionCount: 12,
				keyView,
				now: new Date('2030-01-02T03:04:05.000Z')
			});
		}

		const rows = sqlite
			.prepare('SELECT action, entity_id AS entityId, after_json AS afterJson FROM audit_events')
			.all() as { action: string; entityId: string; afterJson: string }[];
		expect(rows.map(({ action }) => action)).toEqual([
			'exam.previewed',
			'exam.previewed',
			'exam.answer_key.viewed'
		]);
		expect(rows.every(({ entityId }) => entityId === 'exam-7')).toBe(true);
		expect(rows.map(({ afterJson }) => JSON.parse(afterJson))).toEqual([
			{ keyView: false, questionCount: 12 },
			{ keyView: false, questionCount: 12 },
			{ keyView: true, questionCount: 12 }
		]);
	});
});
