import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Phase 7 generated-test leakage boundary', () => {
	it('keeps protected seed and access-code fields out of public projections', () => {
		const service = read('src/lib/server/generation/service.ts');
		const projection = service.slice(service.indexOf('export function listGeneratedExams'));
		expect(projection).not.toMatch(/random_seed_ciphertext|access_code_hash|protectedDigest/);
		expect(projection).not.toMatch(/rawAccessCode/);
	});

	it('returns response keys only when the privileged projection is explicitly requested', () => {
		const service = read('src/lib/server/generation/service.ts');
		expect(service).toContain(
			'if (includeKeys && !principal.permissions.has(PERMISSIONS.ANSWER_KEYS_VIEW))'
		);
		expect(service).toContain('...(includeKeys ? { isCorrect: row.isCorrect === 1 } : {})');
	});

	it('does not place access codes or seed material in generated-test URLs', () => {
		const routes = [
			'src/routes/generated-tests/+page.svelte',
			'src/routes/generated-tests/[id]/+page.svelte',
			'src/routes/generated-tests/[id]/preview/+page.svelte',
			'src/routes/generated-tests/[id]/print/+page.svelte'
		]
			.map(read)
			.join('\n');
		expect(routes).not.toMatch(/(?:href|action)=.*(?:rawAccessCode|seed|access_code_hash)/i);
	});
});
