<script lang="ts">
	import type { DependencyWarningResult } from '$lib/server/curriculum/index.js';

	let {
		warning,
		heading = 'Dependency warning'
	}: { warning: DependencyWarningResult; heading?: string } = $props();
</script>

<section
	class="warning"
	aria-labelledby={`dependency-${warning.entityId}-${warning.operation}`}
	role="status"
>
	<h4 id={`dependency-${warning.entityId}-${warning.operation}`}>{heading}</h4>
	{#if warning.totalCount === 0}
		<p>No dependencies were found by the server.</p>
	{:else}
		<p>
			The server found {warning.totalCount}
			{warning.totalCount === 1 ? 'dependency' : 'dependencies'}.
			{warning.requiresRetirement
				? ' This content must be retired instead of deleted.'
				: ' Review these counts before continuing.'}
		</p>
		<ul>
			{#each warning.items as item (`${item.kind}-${item.blocking}`)}
				<li>{item.kind.replaceAll('_', ' ')}: {item.count}{item.blocking ? ' (blocking)' : ''}</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.warning {
		background: #fff7df;
		border-left: 0.3rem solid #a66a00;
		margin-block: 0.75rem;
		padding: 0.75rem;
	}
	h4,
	p {
		margin-block: 0 0.4rem;
	}
</style>
