import { describe, expect, it } from 'vitest';
import { validateTemplateDraft } from '../../src/lib/server/templates/validation.js';

const A = '71000000-0000-4000-8000-000000000001',
	B = '71000000-0000-4000-8000-000000000002',
	E = '71000000-0000-4000-8000-000000000003';
const valid = () => ({
	name: 'Synthetic template',
	aircraftVariantId: A,
	configuredLength: 2,
	allottedMinutes: 30,
	rules: [{ subtaskVersionId: B, count: 2 }],
	mandatoryElements: [{ subtaskVersionId: B, elementVersionId: E }]
});
describe('template validation', () => {
	it('requires exact rule totals', () => {
		expect(validateTemplateDraft({ ...valid(), configuredLength: 3 })).toMatchObject({
			ok: false,
			fields: expect.arrayContaining([expect.objectContaining({ field: 'configuredLength' })])
		});
	});
	it('rejects duplicate Subtasks', () => {
		const input = valid();
		expect(
			validateTemplateDraft({ ...input, rules: [...input.rules, ...input.rules] })
		).toMatchObject({
			ok: false,
			fields: expect.arrayContaining([expect.objectContaining({ field: 'rules' })])
		});
	});
	it('requires mandatory Elements to belong to a selected Subtask', () => {
		expect(
			validateTemplateDraft({
				...valid(),
				mandatoryElements: [{ subtaskVersionId: A, elementVersionId: E }]
			})
		).toMatchObject({ ok: false });
	});
	it('requires mandatory counts to fit the category quota', () => {
		const input = valid();
		expect(
			validateTemplateDraft({
				...input,
				configuredLength: 1,
				rules: [{ subtaskVersionId: B, count: 1 }],
				mandatoryElements: [
					{ subtaskVersionId: B, elementVersionId: E },
					{ subtaskVersionId: B, elementVersionId: A }
				]
			})
		).toMatchObject({ ok: false });
	});
	it('accepts a complete ordered draft', () =>
		expect(validateTemplateDraft(valid())).toEqual(expect.objectContaining({ ok: true })));
});
