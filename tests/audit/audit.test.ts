import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import { recordAuditEvent, UnsafeAuditMetadataError } from '../../src/lib/server/audit/index.js';
import type { FoundationDatabase } from '../../src/lib/server/db/database.js';
import { foundationSchema } from '../../src/lib/server/db/schema.js';

const databases: Database.Database[] = [];

function auditDatabase(): { sqlite: Database.Database; db: FoundationDatabase } {
	const sqlite = new Database(':memory:');
	databases.push(sqlite);
	sqlite.exec(`
		CREATE TABLE audit_events (
			id TEXT PRIMARY KEY NOT NULL,
			actor_user_id TEXT,
			action TEXT NOT NULL,
			entity_type TEXT NOT NULL,
			entity_id TEXT,
			before_json TEXT,
			after_json TEXT,
			occurred_at TEXT NOT NULL,
			retention_until TEXT
		)
	`);
	return { sqlite, db: drizzle(sqlite, { schema: foundationSchema }) };
}

afterEach(() => {
	for (const database of databases.splice(0)) database.close();
});

describe('audit event writer', () => {
	it('persists append-only identity, action, time, and allow-listed changes', () => {
		const { db, sqlite } = auditDatabase();
		recordAuditEvent(db, {
			actorUserId: null,
			action: 'bootstrap.administrator.created',
			entityType: 'user',
			entityId: '018f0000-0000-7000-8000-000000000001',
			occurredAt: new Date('2030-01-02T03:04:05.000Z'),
			before: null,
			after: { employeeNumber: '000042', status: 'active', roles: ['administrator'] }
		});

		const row = sqlite.prepare('SELECT * FROM audit_events').get() as Record<string, unknown>;
		expect(row).toMatchObject({
			actor_user_id: null,
			action: 'bootstrap.administrator.created',
			entity_type: 'user',
			entity_id: '018f0000-0000-7000-8000-000000000001',
			occurred_at: '2030-01-02T03:04:05.000Z'
		});
		expect(JSON.parse(String(row.after_json))).toEqual({
			employeeNumber: '000042',
			status: 'active',
			roles: ['administrator']
		});
	});

	it('rejects credential, token, cookie, hash, session, and body fields before insertion', () => {
		const forbiddenKeys = [
			['pass', 'word'].join(''),
			['reset', 'Token'].join(''),
			['cookie', 'Value'].join(''),
			['credential', 'Data'].join(''),
			['session', 'Identifier'].join(''),
			['request', 'Body'].join(''),
			['password', 'Hash'].join('')
		];

		for (const key of forbiddenKeys) {
			const { db, sqlite } = auditDatabase();
			expect(() =>
				recordAuditEvent(db, {
					actorUserId: null,
					action: 'user.updated',
					entityType: 'user',
					entityId: 'synthetic-user',
					occurredAt: new Date('2030-01-01T00:00:00.000Z'),
					after: { [key]: 'not-persisted' }
				})
			).toThrow(UnsafeAuditMetadataError);
			expect(sqlite.prepare('SELECT count(*) FROM audit_events').pluck().get()).toBe(0);
		}
	});

	it('rejects unknown metadata, nested objects, empty event fields, and invalid dates', () => {
		const { db, sqlite } = auditDatabase();
		const base = {
			actorUserId: null,
			action: 'user.updated',
			entityType: 'user',
			entityId: 'synthetic-user',
			occurredAt: new Date('2030-01-01T00:00:00.000Z')
		};

		expect(() => recordAuditEvent(db, { ...base, after: { unreviewed: 'value' } })).toThrow(
			UnsafeAuditMetadataError
		);
		expect(() =>
			recordAuditEvent(db, {
				...base,
				after: { roles: [{ code: 'administrator' }] } as never
			})
		).toThrow(UnsafeAuditMetadataError);
		expect(() => recordAuditEvent(db, { ...base, action: ' ' })).toThrow(UnsafeAuditMetadataError);
		expect(() => recordAuditEvent(db, { ...base, occurredAt: new Date(Number.NaN) })).toThrow(
			UnsafeAuditMetadataError
		);
		expect(sqlite.prepare('SELECT count(*) FROM audit_events').pluck().get()).toBe(0);
	});
});
