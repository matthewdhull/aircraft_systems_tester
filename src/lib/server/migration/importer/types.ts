import type { SOURCE_TABLES } from '$lib/server/db/schema/migration.js';

export type SourceTable = (typeof SOURCE_TABLES)[number];

/** SQL scalar as decoded from the dump. Numeric lexemes remain strings. */
export type SqlValue = string | null;

export interface ParsedInsertRow {
	table: string;
	columns: readonly string[] | null;
	values: readonly SqlValue[];
}

export interface ApprovedSource {
	path: string;
	sha256: string;
	byteSize: number;
}

export interface ImportCounts {
	sourceRows: number;
	accepted: number;
	quarantined: number;
	excluded: number;
	aggregated: number;
	suppressed: number;
}

export interface ImportResult extends ImportCounts {
	runId: string;
	sourceChecksum: string;
	status: 'completed';
	alreadyImported: boolean;
}

export interface SourceProfile {
	sourceChecksum: string;
	sourceRows: number;
	tables: Readonly<Record<SourceTable, number>>;
}

export class LegacyImportError extends Error {
	constructor() {
		super('Legacy import failed.');
		this.name = 'LegacyImportError';
	}
}
