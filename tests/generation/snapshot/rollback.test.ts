import { describe, expect, it, vi } from 'vitest';

import type { DatabaseHandle } from '$lib/server/db';
import {
	GenerationError,
	SnapshotGenerationService,
	type GenerationErrorCode,
	type SnapshotDependencies
} from '$lib/server/generation/snapshot';

const command = {
	actorUserId: 'actor',
	templateVersionId: 'template',
	classRosterId: 'roster',
	algorithmVersion: 'ast-selection-v1'
};

function dependencies(): SnapshotDependencies {
	return {
		selector: vi.fn(),
		seedProtector: { encrypt: vi.fn() },
		accessCodeProtector: { createAndProtect: vi.fn(), verify: vi.fn() },
		secureEntropy: vi.fn(),
		retryDelay: vi.fn(),
		now: vi.fn(),
		uuid: vi.fn(),
		authorize: vi.fn(),
		authorizeRosterScope: vi.fn(),
		recordSuccessAudit: vi.fn()
	};
}

describe('Phase 7 snapshot rollback failure boundary', () => {
	it.each([
		'TEMPLATE_INVALID',
		'QUESTION_INELIGIBLE',
		'CATEGORY_SHORTAGE',
		'MANDATORY_ELEMENT_SHORTAGE',
		'SNAPSHOT_WRITE_FAILED',
		'CODE_PROTECTION_FAILED',
		'SEED_PROTECTION_FAILED',
		'AUDIT_WRITE_FAILED'
	] satisfies GenerationErrorCode[])('never presents %s as a partial success', (code) => {
		const transaction = vi.fn(() => {
			throw new GenerationError(code);
		});
		const database = { transaction } as unknown as DatabaseHandle;
		const service = new SnapshotGenerationService(database, dependencies());

		expect(() => service.generate(command)).toThrowError(expect.objectContaining({ code }));
		expect(transaction).toHaveBeenCalledOnce();
	});

	it('propagates an injected snapshot insert failure without minting a success result', () => {
		const state = { exams: 0, questions: 0, audits: 0 };
		const transaction = vi.fn(() => {
			const before = { ...state };
			try {
				state.exams += 1;
				state.questions += 1;
				throw new GenerationError('SNAPSHOT_WRITE_FAILED');
			} catch (error) {
				Object.assign(state, before);
				throw error;
			}
		});
		const database = { transaction } as unknown as DatabaseHandle;

		expect(() =>
			new SnapshotGenerationService(database, dependencies()).generate(command)
		).toThrowError(expect.objectContaining({ code: 'SNAPSHOT_WRITE_FAILED' }));
		expect(state).toEqual({ exams: 0, questions: 0, audits: 0 });
	});
});
