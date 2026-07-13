import type { LogicalComparison, ReconciliationReport } from './contracts.js';

export function renderReconciliationJson(report: ReconciliationReport): string {
	return `${JSON.stringify(report, null, 2)}\n`;
}

function countLines(values: Record<string, number>): string[] {
	return Object.entries(values)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, value]) => `- ${key}: ${value}`);
}

export function renderReconciliationMarkdown(report: ReconciliationReport): string {
	const lines = [
		'# Migration Reconciliation Report',
		'',
		`Overall result: **${report.passed ? 'pass' : 'fail'}**`,
		'',
		'## Source',
		'',
		`- Checksum: \`${report.source.checksum}\``,
		`- Importer version: \`${report.source.importerVersion}\``,
		`- Run status: \`${report.source.status}\``,
		'',
		'## Safe outcome counts',
		'',
		...countLines(report.summary),
		'',
		'## Source-table dispositions',
		'',
		'| Table | Disposition | Source | Accepted | Quarantined | Excluded | Aggregated | Suppressed |',
		'| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
		...report.sourceTables.map(
			(row) =>
				`| ${row.name} | ${row.disposition} | ${row.counts.source} | ${row.counts.accepted} | ${row.counts.quarantined} | ${row.counts.excluded} | ${row.counts.aggregated} | ${row.counts.suppressed} |`
		),
		'',
		'## Question validation',
		'',
		...countLines(report.questions.byType),
		'',
		'Validation reason counts:',
		'',
		...countLines(report.questions.validationReasons),
		'',
		'Question lifecycle counts:',
		'',
		...countLines(report.questions.byLifecycle),
		'',
		'Question generation-state counts:',
		'',
		...countLines(report.questions.byGenerationStatus),
		'',
		'## Curriculum and variants',
		'',
		`- TPO: ${report.curriculum.tpoCount}`,
		`- SPO: ${report.curriculum.spoCount}`,
		`- EO: ${report.curriculum.eoCount}`,
		`- Parent violations: ${report.curriculum.parentViolationCount}`,
		`- Variants: ${report.variants.acceptedCount}`,
		'',
		'## Legacy template sources',
		'',
		...countLines(report.templates.bySource),
		'',
		'Template reconciliation states:',
		'',
		...countLines(report.templates.byState),
		'',
		`Extracted rules: ${report.templates.ruleCount}`,
		'',
		'## Source-to-target mappings',
		'',
		`- Total: ${report.mappings.totalCount}`,
		`- Coverage violations: ${report.mappings.coverageViolationCount}`,
		'',
		'Mapping target counts:',
		'',
		...countLines(report.mappings.byTarget),
		'',
		'Mapping source counts:',
		'',
		...countLines(report.mappings.bySource),
		'',
		'Mapping kind counts:',
		'',
		...countLines(report.mappings.byKind),
		'',
		'## Quarantine reasons',
		'',
		...countLines(report.quarantine.byReason),
		'',
		'Quarantine disposition counts:',
		'',
		...countLines(report.quarantine.byDisposition),
		'',
		'## Historical aggregates',
		'',
		'| Kind | Published | Suppressed |',
		'| --- | ---: | ---: |',
		`| Generation | ${report.aggregates.generation.published} | ${report.aggregates.generation.suppressed} |`,
		`| Assessment | ${report.aggregates.assessment.published} | ${report.aggregates.assessment.suppressed} |`,
		`| Question performance | ${report.aggregates.questionPerformance.published} | ${report.aggregates.questionPerformance.suppressed} |`,
		'',
		`Publication-floor violations: ${report.aggregates.publicationFloorViolationCount}`,
		'',
		'## Future hierarchy row counts',
		'',
		...countLines(report.futureHierarchy),
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

export function renderComparisonMarkdown(comparison: LogicalComparison): string {
	const lines = [
		'# Independent Import Comparison',
		'',
		`Logical result: **${comparison.equivalent ? 'equivalent' : 'different'}**`,
		'',
		`Tables compared: ${comparison.comparedTableCount}`,
		'',
		'| Table | First count | Second count |',
		'| --- | ---: | ---: |',
		...comparison.differences.map(
			(row) => `| ${row.table} | ${row.leftCount} | ${row.rightCount} |`
		),
		''
	];
	return `${lines.join('\n')}\n`;
}
