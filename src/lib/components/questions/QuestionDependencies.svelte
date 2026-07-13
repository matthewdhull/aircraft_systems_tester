<script lang="ts">
	import type { QuestionDependencyResult } from '$lib/server/questions/index.js';

	let { dependencies }: { dependencies: QuestionDependencyResult } = $props();
</script>

<section class="dependencies" aria-labelledby="question-dependencies-heading" role="status">
	<h3 id="question-dependencies-heading">Dependency analysis</h3>
	{#if dependencies.totalCount === 0}
		<p>No dependencies were found by the server.</p>
	{:else}
		<p>
			The server found {dependencies.totalCount}
			{dependencies.totalCount === 1 ? 'dependency' : 'dependencies'}.
			{dependencies.requiresRetirement
				? ' This version must be retired instead of hard-deleted.'
				: ' Review these counts before continuing.'}
		</p>
		<ul>
			{#each dependencies.items as item (`${item.kind}-${item.blocking}`)}
				<li>
					{item.kind.replaceAll('_', ' ')}: {item.count}{item.blocking ? ' (blocking)' : ''}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.dependencies {
		background: var(--warning-light, #fff4d6);
		border-left: 0.3rem solid var(--warning, #765410);
		padding: 0.8rem;
	}
	h3,
	p {
		margin-block: 0 0.4rem;
	}
</style>
