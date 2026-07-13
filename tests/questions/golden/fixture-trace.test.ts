import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

interface GoldenCase {
	id: string;
	behavior_class: 'legacy_observed' | 'target_approved';
	negative_regression?: boolean;
	input: Record<string, unknown>;
	expected: Record<string, unknown>;
}

interface QuestionsFixture {
	schema_version: string;
	cases: GoldenCase[];
}

interface ManifestEntry {
	case_ids: string[];
	evidence: string[];
	future_test_layer: string;
}

interface GoldenManifest {
	schema_version: string;
	entries: ManifestEntry[];
	coverage_requirements: { question_types: string[]; data_classification: string };
}

function fixture<T>(name: string): T {
	return JSON.parse(readFileSync(resolve('fixtures/phase-1/golden-behavior', name), 'utf8')) as T;
}

describe('Phase 6 golden question traceability', () => {
	const questions = fixture<QuestionsFixture>('questions.json');
	const manifest = fixture<GoldenManifest>('manifest.json');
	const questionEntries = manifest.entries.filter((entry) =>
		entry.case_ids.some((id) => id.startsWith('q-'))
	);

	it('loads the approved 17-case synthetic question fixture', () => {
		expect(questions.schema_version).toBe('phase1-golden-v1');
		expect(questions.cases).toHaveLength(17);
		expect(new Set(questions.cases.map((item) => item.id)).size).toBe(17);
		expect(
			questions.cases.filter((item) => item.behavior_class === 'legacy_observed')
		).toHaveLength(5);
		expect(
			questions.cases.filter((item) => item.behavior_class === 'target_approved')
		).toHaveLength(12);
		expect(questions.cases.filter((item) => item.negative_regression)).toHaveLength(2);
	});

	it('maps every question case to evidence and a future test layer exactly once', () => {
		const fixtureIds = questions.cases.map((item) => item.id).sort();
		const referencedIds = questionEntries.flatMap((entry) => entry.case_ids).sort();
		expect(referencedIds).toEqual(fixtureIds);
		expect(questionEntries.every((entry) => entry.evidence.length > 0)).toBe(true);
		expect(questionEntries.every((entry) => entry.future_test_layer.trim().length > 0)).toBe(true);
	});

	it('retains all five legacy aliases and the synthetic-only classification', () => {
		expect(manifest.coverage_requirements.question_types).toEqual(['tf', 'mc', 'c2', 'ac', 'nc']);
		expect(manifest.coverage_requirements.data_classification).toBe('synthetic_only');
	});
});
