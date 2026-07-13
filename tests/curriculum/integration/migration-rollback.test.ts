import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { describe, expect, it } from 'vitest';

describe('ordered migration atomicity', () => {
	it('rolls back earlier statements in a migration when a later statement fails', () => {
		const folder = mkdtempSync(join(tmpdir(), 'phase5-migration-rollback-'));
		const meta = join(folder, 'meta');
		mkdirSync(meta);
		writeFileSync(
			join(meta, '_journal.json'),
			JSON.stringify({
				version: '7',
				dialect: 'sqlite',
				entries: [
					{
						idx: 0,
						version: '6',
						when: 1,
						tag: '0000_atomic_failure',
						breakpoints: true
					}
				]
			})
		);
		writeFileSync(
			join(folder, '0000_atomic_failure.sql'),
			[
				'CREATE TABLE phase5_rollback_probe (id integer primary key);',
				'--> statement-breakpoint',
				'INSERT INTO deliberately_missing_table (id) VALUES (1);'
			].join('\n')
		);

		const sqlite = new Database(':memory:');
		try {
			expect(() => migrate(drizzle(sqlite), { migrationsFolder: folder })).toThrow();
			expect(
				sqlite
					.prepare(
						"SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'phase5_rollback_probe'"
					)
					.pluck()
					.get()
			).toBe(0);
			expect(sqlite.prepare('SELECT count(*) FROM __drizzle_migrations').pluck().get()).toBe(0);
		} finally {
			sqlite.close();
			rmSync(folder, { recursive: true, force: true });
		}
	});
});
