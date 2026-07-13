export const QUESTION_IMPORT_RECONCILIATION_SCHEMA_VERSION = 1 as const;

export const IMPORTED_QUESTION_TYPES = [
	'true_false',
	'single_choice',
	'two_correct_compound',
	'all_correct',
	'none_correct'
] as const;

export const IMPORTED_QUESTION_LIFECYCLES = ['draft', 'review', 'published', 'retired'] as const;
export const IMPORTED_QUESTION_GENERATION_STATUSES = ['blocked', 'eligible'] as const;
export const IMPORTED_FUTURE_LINK_STATUSES = ['review', 'approved', 'retired'] as const;

export interface QuestionImportCheck {
	name: string;
	passed: boolean;
	violationCount: number;
}

export interface QuestionImportReconciliationReport {
	schemaVersion: typeof QUESTION_IMPORT_RECONCILIATION_SCHEMA_VERSION;
	source: {
		checksum: string;
		importerVersion: string;
		status: string;
	};
	inventory: {
		tableCount: number;
		dispositionViolationCount: number;
	};
	outcomes: {
		source: number;
		accepted: number;
		quarantined: number;
		unreconciled: number;
		acceptedQuarantineOverlapCount: number;
	};
	questions: {
		identityCount: number;
		versionCount: number;
		byType: Record<string, number>;
		byAircraftVariant: Record<string, number>;
		byLifecycle: Record<string, number>;
		byGenerationStatus: Record<string, number>;
		legacyCurriculum: {
			linkCount: number;
			linkedVersionCount: number;
			tpoCount: number;
			spoCount: number;
			eoCount: number;
			parentViolationCount: number;
		};
		futureCurriculum: {
			linkCount: number;
			byReviewStatus: Record<string, number>;
		};
	};
	quarantine: {
		totalCount: number;
		byReason: Record<string, number>;
	};
	checks: QuestionImportCheck[];
	passed: boolean;
}

export class QuestionImportReconciliationError extends Error {
	constructor() {
		super('Imported-question reconciliation failed.');
		this.name = 'QuestionImportReconciliationError';
	}
}
