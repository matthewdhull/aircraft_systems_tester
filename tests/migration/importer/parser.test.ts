import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { parseMysqlDump } from '../../../src/lib/server/migration/importer/parser.js';

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

async function parse(sql: string) {
	const directory = mkdtempSync(join(tmpdir(), 'ast-import-parser-'));
	temporaryDirectories.push(directory);
	const path = join(directory, 'fixture.sql');
	writeFileSync(path, Buffer.from(sql, 'latin1'));
	const rows = [];
	for await (const row of parseMysqlDump(path)) rows.push(row);
	return rows;
}

describe('bounded MySQL dump parser', () => {
	it('reads positional multi-row inserts, NULL, numbers, quotes, and backslashes', async () => {
		const rows = await parse(`
			-- ignored comment
			/*!40101 SET NAMES latin1 */;
			INSERT INTO \`TPO\` VALUES
			(1, 10, 'quoted, delimiter'),
			(2, 20, 'escaped \\'quote\\' and \\\\ slash'),
			(3, NULL, 'doubled ''quote''');
		`);
		expect(rows).toEqual([
			{ table: 'TPO', columns: null, values: ['1', '10', 'quoted, delimiter'] },
			{ table: 'TPO', columns: null, values: ['2', '20', "escaped 'quote' and \\ slash"] },
			{ table: 'TPO', columns: null, values: ['3', null, "doubled 'quote'"] }
		]);
	});

	it('reads explicit columns and decodes latin1 hex literals', async () => {
		const [row] = await parse(
			'INSERT INTO `TPO` (`tpo_id`, `tpo_number`, `tpo_name`) VALUES (1, 10, _latin1 0x636166e9);'
		);
		expect(row?.columns).toEqual(['tpo_id', 'tpo_number', 'tpo_name']);
		expect(row?.values).toEqual(['1', '10', 'café']);
	});

	it('rejects truncated input without including source values in the error', async () => {
		await expect(parse("INSERT INTO `TPO` VALUES (1, 2, 'unfinished")).rejects.toThrow(
			'Truncated SQL input.'
		);
	});
});
