import { describe, expect, it, vi } from 'vitest';

import type { DatabaseHandle } from '$lib/server/db';
import {
	GenerationError,
	SnapshotGenerationService,
	type SnapshotDependencies
} from '$lib/server/generation/snapshot';

const result = { examId: 'exam-retry', rawAccessCode: 'returned-once' };

function dependencies(delays: number[]): SnapshotDependencies {
	return {
		selector: vi.fn(),
		seedProtector: { encrypt: vi.fn() },
		accessCodeProtector: { createAndProtect: vi.fn(), verify: vi.fn() },
		secureEntropy: vi.fn(),
		retryDelay: (milliseconds) => delays.push(milliseconds),
		now: vi.fn(),
		uuid: vi.fn(),
		authorize: vi.fn(),
		authorizeRosterScope: vi.fn(),
		recordSuccessAudit: vi.fn()
	};
}

function input() {
	return {
		actorUserId: 'actor',
		templateVersionId: 'template',
		classRosterId: 'roster',
		algorithmVersion: 'ast-selection-v1'
	};
}

describe('snapshot SQLite busy retry policy', () => {
	it('retries three busy transactions at 50, 150, and 450 ms before succeeding', () => {
		const delays: number[] = [];
		const transaction = vi
			.fn()
			.mockImplementationOnce(() => {
				throw new Error('SQLITE_BUSY: database is locked');
			})
			.mockImplementationOnce(() => {
				throw new GenerationError('DATABASE_BUSY');
			})
			.mockImplementationOnce(() => {
				throw new Error('database table is locked');
			})
			.mockReturnValueOnce(result);
		const database = { transaction } as unknown as DatabaseHandle;

		expect(new SnapshotGenerationService(database, dependencies(delays)).generate(input())).toEqual(
			result
		);
		expect(transaction).toHaveBeenCalledTimes(4);
		expect(delays).toEqual([50, 150, 450]);
	});

	it('returns DATABASE_BUSY after the bounded retry budget is exhausted', () => {
		const delays: number[] = [];
		const transaction = vi.fn(() => {
			throw new Error('SQLITE_BUSY');
		});
		const database = { transaction } as unknown as DatabaseHandle;

		expect(() =>
			new SnapshotGenerationService(database, dependencies(delays)).generate(input())
		).toThrowError(expect.objectContaining({ code: 'DATABASE_BUSY' }));
		expect(transaction).toHaveBeenCalledTimes(4);
		expect(delays).toEqual([50, 150, 450]);
	});

	it('does not retry non-busy failures', () => {
		const delays: number[] = [];
		const transaction = vi.fn(() => {
			throw new Error('constraint failed');
		});
		const database = { transaction } as unknown as DatabaseHandle;

		expect(() =>
			new SnapshotGenerationService(database, dependencies(delays)).generate(input())
		).toThrow('constraint failed');
		expect(transaction).toHaveBeenCalledOnce();
		expect(delays).toEqual([]);
	});
});
