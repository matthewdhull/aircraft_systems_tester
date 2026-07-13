<script lang="ts">
	import type { CurriculumHierarchyDto } from '$lib/server/curriculum/index.js';
	import type {
		CurriculumReconciliationReport,
		LegacyCurriculumMappingDto,
		LegacyCurriculumNodeDto
	} from '$lib/server/curriculum-mapping/index.js';

	let {
		legacyHierarchy,
		mappings,
		hierarchy,
		reconciliation
	}: {
		legacyHierarchy: readonly LegacyCurriculumNodeDto[];
		mappings: readonly LegacyCurriculumMappingDto[];
		hierarchy: CurriculumHierarchyDto;
		reconciliation: CurriculumReconciliationReport;
	} = $props();

	const flattenLegacy = (
		nodes: readonly LegacyCurriculumNodeDto[],
		depth = 0
	): { node: LegacyCurriculumNodeDto; depth: number }[] =>
		nodes.flatMap((node) => [{ node, depth }, ...flattenLegacy(node.children, depth + 1)]);
	const legacyNodes = $derived(flattenLegacy(legacyHierarchy));
	const approvalBoundary =
		'Approval does not link questions or make them eligible for future generation.';
	const sourceTypes = ['tpo', 'spo', 'eo'] as const;
	const mappingStatuses = ['proposed', 'approved', 'rejected', 'retired'] as const;
	const targetNodes = $derived(
		hierarchy.phases.flatMap((phase) => [
			{ node: phase.node, path: phase.node.latestVersion.name },
			...phase.tasks.flatMap((task) => [
				{
					node: task.node,
					path: `${phase.node.latestVersion.name} / ${task.node.latestVersion.name}`
				},
				...task.subtasks.flatMap((subtask) => [
					{
						node: subtask.node,
						path: `${task.node.latestVersion.name} / ${subtask.node.latestVersion.name}`
					},
					...subtask.elements.map((element) => ({
						node: element,
						path: `${subtask.node.latestVersion.name} / ${element.latestVersion.name}`
					}))
				])
			])
		])
	);
	const publishedTargetNodes = $derived(
		targetNodes.filter((entry) => entry.node.latestVersion.status === 'published')
	);
	const legacyLabel = (type: string, id: string) => {
		const match = legacyNodes.find((entry) => entry.node.type === type && entry.node.id === id);
		return match
			? `${match.node.type.toUpperCase()} ${match.node.number}: ${match.node.name}`
			: 'Unavailable source';
	};
	const targetLabel = (type: string, id: string) => {
		const match = targetNodes.find((entry) => entry.node.type === type && entry.node.id === id);
		return match ? `${match.node.type}: ${match.path}` : 'Unavailable target';
	};
</script>

<section class="boundary" aria-labelledby="review-boundary-heading">
	<h2 id="review-boundary-heading">Manual review boundary</h2>
	<p>
		Every mapping begins as a proposal and requires an explicit attributable decision.
		{approvalBoundary}
	</p>
</section>

<div class="mapping-grid">
	<section class="panel" aria-labelledby="propose-heading">
		<h2 id="propose-heading">Propose mapping</h2>
		{#if legacyNodes.length === 0}
			<p>No historical TPO/SPO/EO records are available.</p>
		{:else if publishedTargetNodes.length === 0}
			<p>Create and publish a future curriculum target before proposing a mapping.</p>
		{:else}
			<form method="POST" action="?/proposeMapping">
				<label for="propose-source">Historical source</label>
				<select id="propose-source" name="source" required>
					<option value="">Select source</option>
					{#each legacyNodes as entry (`${entry.node.type}-${entry.node.id}`)}
						<option value={`${entry.node.type}:${entry.node.id}`}>
							{'—'.repeat(entry.depth)}
							{entry.node.type.toUpperCase()}
							{entry.node.number}: {entry.node.name}
						</option>
					{/each}
				</select>
				<label for="propose-target">Published future target</label>
				<select id="propose-target" name="target" required>
					<option value="">Select target</option>
					{#each publishedTargetNodes as entry (`${entry.node.type}-${entry.node.id}`)}
						<option value={`${entry.node.type}:${entry.node.id}`}>
							{entry.node.type}: {entry.path}
						</option>
					{/each}
				</select>
				<label for="propose-rationale">Proposal rationale</label>
				<textarea id="propose-rationale" name="rationale" maxlength="2000" required></textarea>
				<button type="submit">Create proposed mapping</button>
			</form>
		{/if}
	</section>

	<section class="panel" aria-labelledby="reconciliation-heading">
		<h2 id="reconciliation-heading">Reconciliation</h2>
		<p class:passed={reconciliation.passed} class:failed={!reconciliation.passed}>
			Overall: {reconciliation.passed ? 'passed' : 'attention required'}
		</p>
		<dl>
			{#each sourceTypes as sourceType (sourceType)}
				<div>
					<dt>Unmapped {sourceType.toUpperCase()}</dt>
					<dd>{reconciliation.unmappedBySourceType[sourceType]}</dd>
				</div>
			{/each}
			{#each mappingStatuses as status (status)}
				<div>
					<dt>{status}</dt>
					<dd>
						{reconciliation.statusCounts[status]}
					</dd>
				</div>
			{/each}
		</dl>
		<ul>
			{#each reconciliation.checks as check (check.name)}
				<li>
					{check.name.replaceAll('_', ' ')}: {check.passed
						? 'pass'
						: `${check.violationCount} violations`}
				</li>
			{/each}
		</ul>
	</section>
</div>

<section class="panel" aria-labelledby="mapping-list-heading">
	<h2 id="mapping-list-heading">Mapping decisions</h2>
	{#if mappings.length === 0}
		<p>No mappings have been proposed. Nothing is inferred automatically.</p>
	{:else}
		<ul class="mappings">
			{#each mappings as mapping (mapping.id)}
				<li>
					<h3>{legacyLabel(mapping.legacyEntityType, mapping.legacyEntityId)}</h3>
					<p>Target: {targetLabel(mapping.targetEntityType, mapping.targetEntityId)}</p>
					<p>
						Status: <strong class={`status status--${mapping.status}`}>{mapping.status}</strong>
					</p>
					{#if mapping.status === 'proposed'}
						<div class="decision-grid">
							<form method="POST" action="?/approveMapping">
								<input type="hidden" name="mappingId" value={mapping.id} />
								<label for={`approve-${mapping.id}-rationale`}>Approval rationale</label>
								<textarea
									id={`approve-${mapping.id}-rationale`}
									name="rationale"
									maxlength="2000"
									required></textarea>
								<button type="submit">Approve mapping</button>
							</form>
							<form method="POST" action="?/rejectMapping">
								<input type="hidden" name="mappingId" value={mapping.id} />
								<label for={`reject-${mapping.id}-rationale`}>Rejection rationale</label>
								<textarea
									id={`reject-${mapping.id}-rationale`}
									name="rationale"
									maxlength="2000"
									required></textarea>
								<button type="submit">Reject mapping</button>
							</form>
						</div>
					{:else if mapping.status === 'approved'}
						<form method="POST" action="?/retireMapping">
							<input type="hidden" name="mappingId" value={mapping.id} />
							<label for={`retire-${mapping.id}-rationale`}>Retirement rationale</label>
							<textarea
								id={`retire-${mapping.id}-rationale`}
								name="rationale"
								maxlength="2000"
								required></textarea>
							<button type="submit">Retire mapping</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.boundary {
		background: #eaf3f8;
		border-left: 0.3rem solid #24577a;
		padding: 0.8rem;
	}
	.mapping-grid,
	.decision-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
	}
	.panel {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.5rem;
		margin-block: 1rem;
		padding: 1rem;
	}
	form {
		display: grid;
		gap: 0.6rem;
	}
	select,
	textarea,
	button {
		font: inherit;
		padding: 0.55rem;
	}
	textarea {
		min-height: 5rem;
		resize: vertical;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
	}
	dl div {
		padding: 0.4rem;
	}
	dd {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
	}
	.passed {
		color: #08724f;
	}
	.failed {
		color: #a61b1b;
	}
	.mappings {
		display: grid;
		gap: 1rem;
		list-style: none;
		padding: 0;
	}
	.mappings > li {
		background: #f7f9fa;
		border-radius: 0.35rem;
		padding: 0.9rem;
	}
	.status {
		text-transform: capitalize;
	}
	.status--approved {
		color: #08724f;
	}
</style>
