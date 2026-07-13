export const SELECTION_ALGORITHM_VERSION = 'ast-selection-v1' as const;

export interface SelectionRule {
	id: string;
	position: number;
	subtaskVersionId: string;
	count: number;
}

export interface MandatoryElement {
	elementVersionId: string;
	subtaskVersionId: string;
	position: number;
}

export interface SelectionCandidate {
	questionVersionId: string;
	eligible: boolean;
	subtaskVersionIds: readonly string[];
	elementVersionIds: readonly string[];
}

export interface SelectionInput {
	algorithmVersion: string;
	seedBytes: Uint8Array;
	rules: readonly SelectionRule[];
	mandatoryElements: readonly MandatoryElement[];
	candidates: readonly SelectionCandidate[];
}

export interface CategoryAssignment {
	questionVersionId: string;
	ruleId: string;
	categoryPosition: number;
}

export interface MandatoryAssignment {
	elementVersionId: string;
	questionVersionId: string;
}

export interface SelectionSuccess {
	ok: true;
	algorithmVersion: typeof SELECTION_ALGORITHM_VERSION;
	assignments: readonly CategoryAssignment[];
	mandatoryAssignments: readonly MandatoryAssignment[];
}

export type SelectionShortage =
	| {
			code: 'CATEGORY_SHORTAGE';
			ruleId: string;
			subtaskVersionId: string;
			needed: number;
			available: number;
	  }
	| {
			code: 'MANDATORY_ELEMENT_SHORTAGE';
			elementVersionId: string;
			subtaskVersionId: string;
			needed: number;
			available: number;
	  };

export interface SelectionFailure {
	ok: false;
	code: 'UNSUPPORTED_ALGORITHM' | 'INVALID_SELECTION_INPUT' | 'SELECTION_SHORTAGE';
	shortages: readonly SelectionShortage[];
}

export type SelectionResult = SelectionSuccess | SelectionFailure;

export interface SeededRandomSource {
	nextUint32(): number;
	nextBoundedInt(exclusiveUpperBound: number): number;
	shuffle<T>(values: readonly T[]): T[];
}
