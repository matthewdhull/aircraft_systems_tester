export type GenerationErrorCode =
	| 'TEMPLATE_NOT_FOUND'
	| 'TEMPLATE_NOT_PUBLISHED'
	| 'TEMPLATE_NOT_EFFECTIVE'
	| 'TEMPLATE_INVALID'
	| 'CATEGORY_SHORTAGE'
	| 'MANDATORY_ELEMENT_SHORTAGE'
	| 'QUESTION_INELIGIBLE'
	| 'CURRICULUM_INELIGIBLE'
	| 'AIRCRAFT_INAPPLICABLE'
	| 'ROSTER_SCOPE_DENIED'
	| 'PERMISSION_DENIED'
	| 'UNSUPPORTED_ALGORITHM'
	| 'SEED_PROTECTION_FAILED'
	| 'CODE_PROTECTION_FAILED'
	| 'SNAPSHOT_WRITE_FAILED'
	| 'AUDIT_WRITE_FAILED'
	| 'DATABASE_BUSY';

export class GenerationError extends Error {
	constructor(
		readonly code: GenerationErrorCode,
		readonly shortages: readonly {
			code: 'CATEGORY_SHORTAGE' | 'MANDATORY_ELEMENT_SHORTAGE';
			id: string;
			needed: number;
			available: number;
		}[] = []
	) {
		super(code);
		this.name = 'GenerationError';
	}
}
