import { QUARANTINE_REASON_CODES, SOURCE_TABLES } from '$lib/server/db/schema.js';

export { QUARANTINE_REASON_CODES, SOURCE_TABLES };

export const RECONCILIATION_SCHEMA_VERSION = 1 as const;

export const APPROVED_SOURCE_CHECKSUMS = [
	'a8e02025608f7ca1cbd3020fed7863dba9128938b303a97643a59e746b169eec',
	'ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70'
] as const;

export const RECONCILIATION_OUTCOMES = [
	'rejected',
	'quarantined',
	'accepted',
	'excluded',
	'aggregated',
	'suppressed'
] as const;

export type ReconciliationOutcome = (typeof RECONCILIATION_OUTCOMES)[number];
export type SourceTable = (typeof SOURCE_TABLES)[number];
export type QuarantineReasonCode = (typeof QUARANTINE_REASON_CODES)[number];

export class MigrationReconciliationError extends Error {
	constructor() {
		super('Migration reconciliation failed.');
		this.name = 'MigrationReconciliationError';
	}
}

export const EXPECTED_SOURCE_DISPOSITIONS: Readonly<Record<SourceTable, string>> = {
	TPO: 'migrate',
	SPO: 'migrate',
	EO: 'migrate',
	variant: 'migrate',
	questions: 'migrate',
	test_model: 'template_source',
	testModel: 'template_source',
	createdTests: 'aggregate',
	usedQuestions: 'aggregate_or_quarantine',
	studentTestRecords: 'aggregate',
	testResults: 'aggregate',
	instructors: 'exclude',
	logins: 'exclude',
	stamp: 'exclude',
	test_info: 'exclude'
};

export interface SafeCountSet {
	source: number;
	accepted: number;
	quarantined: number;
	excluded: number;
	aggregated: number;
	suppressed: number;
}

export interface SafeCheck {
	name: string;
	passed: boolean;
	violationCount: number;
}

export interface ReconciliationReport {
	schemaVersion: typeof RECONCILIATION_SCHEMA_VERSION;
	source: {
		checksum: string;
		importerVersion: string;
		status: string;
	};
	summary: Omit<SafeCountSet, 'source'> & { source: number };
	sourceTables: Array<{
		name: SourceTable;
		disposition: string;
		counts: SafeCountSet;
	}>;
	curriculum: {
		tpoCount: number;
		spoCount: number;
		eoCount: number;
		parentViolationCount: number;
	};
	variants: { acceptedCount: number };
	questions: {
		acceptedVersionCount: number;
		byType: Record<string, number>;
		byLifecycle: Record<string, number>;
		byGenerationStatus: Record<string, number>;
		validationReasons: Record<string, number>;
		legacyParentViolationCount: number;
	};
	templates: {
		bySource: Record<string, number>;
		byState: Record<string, number>;
		ruleCount: number;
	};
	mappings: {
		totalCount: number;
		bySource: Record<string, number>;
		byTarget: Record<string, number>;
		byKind: Record<string, number>;
		coverageViolationCount: number;
	};
	quarantine: {
		totalCount: number;
		byReason: Record<QuarantineReasonCode, number>;
		byDisposition: Record<string, number>;
	};
	aggregates: {
		generation: { published: number; suppressed: number };
		assessment: { published: number; suppressed: number };
		questionPerformance: { published: number; suppressed: number };
		publicationFloorViolationCount: number;
	};
	futureHierarchy: Record<string, number>;
	checks: SafeCheck[];
	passed: boolean;
}

export interface LogicalComparison {
	schemaVersion: typeof RECONCILIATION_SCHEMA_VERSION;
	equivalent: boolean;
	comparedTableCount: number;
	differences: Array<{ table: string; leftCount: number; rightCount: number }>;
}
