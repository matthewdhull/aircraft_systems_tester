import type { FoundationDatabase } from '$lib/server/db/database.js';
import type { SelectionResult } from '$lib/server/generation/selection/index.js';
import type { AccessCodeProtector, SeedProtector } from '../security/index.js';

export interface SnapshotSelectionCandidate {
	questionVersionId: string;
	eligible: boolean;
	subtaskVersionIds: readonly string[];
	elementVersionIds: readonly string[];
}

export interface SnapshotRule {
	id: string;
	position: number;
	subtaskVersionId: string;
	count: number;
}

export interface SnapshotMandatoryElement {
	id: string;
	position: number;
	elementVersionId: string;
	subtaskVersionId: string;
}

export type Selector = (input: {
	algorithmVersion: string;
	seedBytes: Uint8Array;
	rules: readonly SnapshotRule[];
	mandatoryElements: readonly SnapshotMandatoryElement[];
	candidates: readonly SnapshotSelectionCandidate[];
}) => SelectionResult;

export interface GenerateExamInput {
	actorUserId: string;
	templateVersionId: string;
	classRosterId: string;
	algorithmVersion: string;
}

export interface GenerateExamResult {
	examId: string;
	rawAccessCode: string;
}

export interface SnapshotDependencies {
	selector: Selector;
	seedProtector: SeedProtector;
	accessCodeProtector: AccessCodeProtector;
	secureEntropy(size: number): Uint8Array;
	now(): Date;
	uuid(): string;
	authorize(tx: FoundationDatabase, actorUserId: string, permission: 'exams.publish'): void;
	authorizeRosterScope(tx: FoundationDatabase, actorUserId: string, classRosterId: string): void;
	recordSuccessAudit(
		tx: FoundationDatabase,
		input: {
			actorUserId: string;
			examId: string;
			occurredAt: Date;
			questionCount: number;
			algorithmVersion: string;
			envelopeVersion: string;
		}
	): void;
}
