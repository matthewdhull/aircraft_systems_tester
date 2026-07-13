import type { QuestionImportReconciliationReport } from './contracts.js';

function countLines(values: Record<string, number>): string[] {
	return Object.entries(values)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, value]) => `- ${key}: ${value}`);
}

export function renderQuestionImportJson(report: QuestionImportReconciliationReport): string {
	return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderQuestionImportMarkdown(report: QuestionImportReconciliationReport): string {
	const lines = [
		'# Imported Question Reconciliation',
		'',
		`Overall result: **${report.passed ? 'pass' : 'fail'}**`,
		'',
		'## Safe outcomes',
		'',
		`- Source: ${report.outcomes.source}`,
		`- Accepted: ${report.outcomes.accepted}`,
		`- Quarantined: ${report.outcomes.quarantined}`,
		`- Unreconciled: ${report.outcomes.unreconciled}`,
		'',
		'## Canonical types',
		'',
		...countLines(report.questions.byType),
		'',
		'## Aircraft applicability',
		'',
		...countLines(report.questions.byAircraftVariant),
		'',
		'## Lifecycle',
		'',
		...countLines(report.questions.byLifecycle),
		'',
		'## Generation status',
		'',
		...countLines(report.questions.byGenerationStatus),
		'',
		'## Legacy curriculum',
		'',
		`- Links: ${report.questions.legacyCurriculum.linkCount}`,
		`- Linked versions: ${report.questions.legacyCurriculum.linkedVersionCount}`,
		`- TPOs: ${report.questions.legacyCurriculum.tpoCount}`,
		`- SPOs: ${report.questions.legacyCurriculum.spoCount}`,
		`- EOs: ${report.questions.legacyCurriculum.eoCount}`,
		`- Parent violations: ${report.questions.legacyCurriculum.parentViolationCount}`,
		'',
		'## Future-link review status',
		'',
		`- Total links: ${report.questions.futureCurriculum.linkCount}`,
		...countLines(report.questions.futureCurriculum.byReviewStatus),
		'',
		'## Safe quarantine reasons',
		'',
		...countLines(report.quarantine.byReason),
		'',
		'## Verification',
		'',
		'| Check | Result | Violations |',
		'| --- | --- | ---: |',
		...report.checks.map(
			(item) => `| ${item.name} | ${item.passed ? 'pass' : 'fail'} | ${item.violationCount} |`
		),
		''
	];
	return `${lines.join('\n')}\n`;
}
