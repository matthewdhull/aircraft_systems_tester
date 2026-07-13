import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { recordAuditEvent, UnsafeAuditMetadataError } from '../../../src/lib/server/audit/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

let database: DatabaseHandle;

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
});

afterEach(() => database.close());

describe('Phase 6 answer-key audit boundary', () => {
	it.each([
		['promptText', 'Synthetic assessment statement.'],
		['optionText', 'Synthetic keyed choice.'],
		['isCorrect', true],
		['semanticValue', 'true'],
		['answerKey', 'D'],
		['correctAnswer', 'Synthetic keyed choice.']
	])('rejects %s from generic audit metadata', (field, value) => {
		expect(() =>
			recordAuditEvent(database.db, {
				actorUserId: null,
				action: 'question.version.updated',
				entityType: 'question',
				entityId: null,
				occurredAt: new Date('2026-07-13T00:00:00.000Z'),
				after: { [field]: value }
			})
		).toThrow(UnsafeAuditMetadataError);
		expect(database.sqlite.prepare('select count(*) from audit_events').pluck().get()).toBe(0);
	});

	it('accepts only the safe Phase 6 metadata vocabulary', () => {
		recordAuditEvent(database.db, {
			actorUserId: null,
			action: 'question.eligibility.changed',
			entityType: 'question',
			entityId: null,
			occurredAt: new Date('2026-07-13T00:00:00.000Z'),
			after: {
				questionType: 'single_choice',
				version: 2,
				generationStatus: 'blocked',
				aircraftCount: 1,
				futureLinkCount: 0,
				reason: 'future_link_review_required'
			}
		});
		const stored = database.sqlite
			.prepare('select after_json from audit_events')
			.pluck()
			.get() as string;
		expect(stored).not.toMatch(/prompt|option|correct|answer.?key|semantic/i);
	});
});
