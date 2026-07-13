import { createReadStream } from 'node:fs';

import type { ParsedInsertRow, SqlValue } from './types.js';

const MAX_HEADER_CHARS = 64 * 1024;
const INSERT_HEADER =
	/^\s*INSERT\s+(?:IGNORE\s+)?INTO\s+`?([^`\s(]+)`?\s*(?:\(([^]*?)\))?\s*VALUES\s*$/i;

function parseHeader(header: string): { table: string; columns: string[] | null } | null {
	const match = INSERT_HEADER.exec(header);
	if (!match) return null;
	const columns = match[2]
		? match[2].split(',').map((value) => value.trim().replace(/^`|`$/g, ''))
		: null;
	return { table: match[1]!, columns };
}

function decodeHexLiteral(token: string): string | null {
	const match = /^(?:_latin1\s+)?0x([0-9a-f]+)$/i.exec(token.trim());
	if (!match || match[1]!.length % 2 !== 0) return null;
	return Buffer.from(match[1]!, 'hex').toString('latin1');
}

function finishToken(raw: string, quoted: boolean): SqlValue {
	if (quoted) return raw;
	const token = raw.trim();
	if (/^NULL$/i.test(token)) return null;
	const hex = decodeHexLiteral(token);
	if (hex !== null) return hex;
	if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token)) return token;
	throw new Error('Unsupported SQL value.');
}

/**
 * Incremental MySQL INSERT reader. It holds only one row and the small INSERT
 * header in memory, even when a statement contains millions of tuples.
 */
export async function* parseMysqlDump(path: string): AsyncGenerator<ParsedInsertRow> {
	const input = createReadStream(path, { highWaterMark: 64 * 1024 });
	const decoder = new TextDecoder('windows-1252', { fatal: true });
	let mode: 'scan' | 'header' | 'values' = 'scan';
	let statementStart = true;
	let header = '';
	let insert: ReturnType<typeof parseHeader> = null;
	let comment: 'line' | 'block' | null = null;
	let quote: "'" | '"' | '`' | null = null;
	let escaped = false;
	let row: SqlValue[] = [];
	let token = '';
	let tokenQuoted = false;
	let inTuple = false;
	let previous = '';

	for await (const chunk of input) {
		const text = decoder.decode(chunk as Buffer, { stream: true });
		for (let i = 0; i < text.length; i += 1) {
			const char = text[i]!;
			const next = text[i + 1] ?? '';
			if (comment === 'line') {
				if (char === '\n') {
					comment = null;
					statementStart = true;
				}
				previous = char;
				continue;
			}
			if (comment === 'block') {
				if (previous === '*' && char === '/') {
					comment = null;
					statementStart = true;
				}
				previous = char;
				continue;
			}
			if (
				mode !== 'values' &&
				!quote &&
				char === '-' &&
				next === '-' &&
				/\s/.test(text[i + 2] ?? '')
			) {
				comment = 'line';
				i += 1;
				previous = '-';
				continue;
			}
			if (mode !== 'values' && !quote && char === '#') {
				comment = 'line';
				previous = char;
				continue;
			}
			if (mode !== 'values' && !quote && char === '/' && next === '*') {
				comment = 'block';
				i += 1;
				previous = '*';
				continue;
			}

			if (mode === 'scan') {
				if (statementStart && /\s/.test(char)) continue;
				if (statementStart) {
					statementStart = false;
					if (char.toUpperCase() === 'I') {
						mode = 'header';
						header = char;
						continue;
					}
				}
				if (char === ';') statementStart = true;
				continue;
			}

			if (mode === 'header') {
				header += char;
				if (header.length > MAX_HEADER_CHARS) throw new Error('SQL header exceeds safety limit.');
				if (!quote && (char === "'" || char === '"' || char === '`')) quote = char;
				else if (quote && char === quote && !escaped) quote = null;
				escaped = char === '\\' && !escaped;
				if (escaped && char !== '\\') escaped = false;
				if (!quote && /VALUES\s*$/i.test(header)) {
					insert = parseHeader(header);
					if (!insert) throw new Error('Malformed INSERT header.');
					mode = 'values';
					header = '';
					quote = null;
					escaped = false;
				} else if (!quote && char === ';') {
					mode = 'scan';
					statementStart = true;
					header = '';
				}
				continue;
			}

			if (!inTuple) {
				if (char === '(') {
					inTuple = true;
					row = [];
					token = '';
					tokenQuoted = false;
				} else if (char === ';') {
					mode = 'scan';
					statementStart = true;
					insert = null;
				} else if (!/[\s,]/.test(char)) throw new Error('Malformed INSERT values.');
				continue;
			}
			if (quote) {
				if (escaped) {
					const escapes: Record<string, string> = {
						'0': '\0',
						b: '\b',
						n: '\n',
						r: '\r',
						t: '\t',
						Z: '\x1a'
					};
					token += escapes[char] ?? char;
					escaped = false;
				} else if (char === '\\') escaped = true;
				else if (char === quote) {
					if (next === quote) {
						token += quote;
						i += 1;
					} else quote = null;
				} else token += char;
				continue;
			}
			if (char === "'" || char === '"') {
				if (token.trim().length === 0) token = '';
				quote = char;
				tokenQuoted = true;
				continue;
			}
			if (char === ',' || char === ')') {
				row.push(finishToken(token, tokenQuoted));
				token = '';
				tokenQuoted = false;
				if (char === ')') {
					if (!insert) throw new Error('Missing INSERT context.');
					yield { table: insert.table, columns: insert.columns, values: row };
					row = [];
					inTuple = false;
				}
				continue;
			}
			token += char;
		}
	}
	decoder.decode();
	if (comment === 'block' || quote || inTuple || mode === 'values')
		throw new Error('Truncated SQL input.');
}

/** Structural inventory scan; row parsing remains the state machine above. */
export async function scanMysqlTableDeclarations(path: string): Promise<ReadonlySet<string>> {
	const tables = new Set<string>();
	const decoder = new TextDecoder('windows-1252', { fatal: true });
	let tail = '';
	for await (const chunk of createReadStream(path, { highWaterMark: 64 * 1024 })) {
		const text = tail + decoder.decode(chunk as Buffer, { stream: true });
		for (const match of text.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`([^`]+)`/gi)) {
			tables.add(match[1]!);
		}
		tail = text.slice(-256);
	}
	decoder.decode();
	return tables;
}
