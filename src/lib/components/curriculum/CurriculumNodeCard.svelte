<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		BloomLevelDto,
		CurriculumNodeDto,
		DependencyWarningResult
	} from '$lib/server/curriculum/index.js';
	import NodeLifecycle from './NodeLifecycle.svelte';
	import ReorderControls from './ReorderControls.svelte';

	interface ParentOption {
		id: string;
		name: string;
	}

	let {
		node,
		orderRevision,
		orderedVersionIds,
		parentVersionId,
		canReorder,
		bloomLevels,
		parentOptions = [],
		warnings = [],
		children
	}: {
		node: CurriculumNodeDto;
		orderRevision: string;
		orderedVersionIds: readonly string[];
		parentVersionId: string | null;
		canReorder: boolean;
		bloomLevels: readonly BloomLevelDto[];
		parentOptions?: readonly ParentOption[];
		warnings?: readonly DependencyWarningResult[];
		children?: Snippet;
	} = $props();

	const version = $derived(node.latestVersion);
</script>

<article class={`node node--${node.type}`} aria-labelledby={`node-${version.id}`}>
	<header>
		<div>
			<p class="node-type">{node.type}</p>
			<h3 id={`node-${version.id}`} tabindex="-1">{version.name}</h3>
			<p class="metadata">
				<span class={`status status--${version.status}`}>{version.status}</span>
				<span>Version {version.version}</span>
				<span>Position {version.position + 1}</span>
			</p>
		</div>
		{#if version.status === 'draft' && canReorder}
			<ReorderControls
				versionId={version.id}
				name={version.name}
				position={version.position}
				{orderedVersionIds}
				{parentVersionId}
				nodeType={node.type}
				expectedOrderRevision={orderRevision}
			/>
		{/if}
	</header>
	{#if version.description}<p>{version.description}</p>{/if}
	<NodeLifecycle {node} {bloomLevels} {parentOptions} {warnings} />
	{#if children}
		<details class="children">
			<summary>Children of {version.name}</summary>
			<div class="children__content">{@render children()}</div>
		</details>
	{/if}
</article>

<style>
	.node {
		border: 1px solid var(--color-border, #aeb7bf);
		border-left-width: 0.35rem;
		border-radius: 0.45rem;
		margin-block: 0.8rem;
		padding: 0.8rem;
	}
	.node--phase {
		border-left-color: #24577a;
	}
	.node--task {
		border-left-color: #4f6d2f;
	}
	.node--subtask {
		border-left-color: #805b24;
	}
	.node--element {
		border-left-color: #714b78;
	}
	header {
		align-items: start;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}
	h3,
	.node-type,
	.metadata {
		margin: 0;
	}
	.node-type {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.metadata {
		display: flex;
		flex-wrap: wrap;
		font-size: 0.9rem;
		gap: 0.7rem;
		margin-top: 0.25rem;
	}
	.status {
		font-weight: 700;
		text-transform: capitalize;
	}
	.status--published {
		color: #08724f;
	}
	.status--review {
		color: #795800;
	}
	.status--retired {
		color: #5b6570;
	}
	.children {
		margin-top: 0.75rem;
	}
	.children > summary {
		cursor: pointer;
		font-weight: 700;
	}
	.children__content {
		margin-left: clamp(0.35rem, 2vw, 1.5rem);
	}
	@media (max-width: 35rem) {
		header {
			align-items: stretch;
			flex-direction: column;
		}
		.children__content {
			margin-left: 0;
		}
	}
</style>
