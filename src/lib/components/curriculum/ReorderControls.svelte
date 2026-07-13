<script lang="ts">
	import type { CurriculumNodeType } from '$lib/server/curriculum/index.js';

	let {
		versionId,
		name,
		position,
		orderedVersionIds,
		parentVersionId,
		nodeType,
		expectedOrderRevision
	}: {
		versionId: string;
		name: string;
		position: number;
		orderedVersionIds: readonly string[];
		parentVersionId: string | null;
		nodeType: CurriculumNodeType;
		expectedOrderRevision: string;
	} = $props();

	const moved = (offset: -1 | 1) => {
		const next = [...orderedVersionIds];
		const target = position + offset;
		[next[position], next[target]] = [next[target]!, next[position]!];
		return next;
	};
</script>

<div class="reorder" aria-label={`Reorder ${name}`}>
	{#if position > 0}
		<form method="POST" action="?/reorderSiblings">
			{#if parentVersionId}<input
					type="hidden"
					name="parentVersionId"
					value={parentVersionId}
				/>{/if}
			<input type="hidden" name="nodeType" value={nodeType} />
			<input type="hidden" name="expectedOrderRevision" value={expectedOrderRevision} />
			{#each moved(-1) as id (id)}<input type="hidden" name="orderedVersionIds" value={id} />{/each}
			<input type="hidden" name="focusId" value={`node-${versionId}`} />
			<button type="submit" aria-label={`Move ${name} up`}
				>↑ <span aria-hidden="true">Up</span></button
			>
		</form>
	{/if}
	{#if position < orderedVersionIds.length - 1}
		<form method="POST" action="?/reorderSiblings">
			{#if parentVersionId}<input
					type="hidden"
					name="parentVersionId"
					value={parentVersionId}
				/>{/if}
			<input type="hidden" name="nodeType" value={nodeType} />
			<input type="hidden" name="expectedOrderRevision" value={expectedOrderRevision} />
			{#each moved(1) as id (id)}<input type="hidden" name="orderedVersionIds" value={id} />{/each}
			<input type="hidden" name="focusId" value={`node-${versionId}`} />
			<button type="submit" aria-label={`Move ${name} down`}
				>↓ <span aria-hidden="true">Down</span></button
			>
		</form>
	{/if}
</div>

<style>
	.reorder {
		display: inline-flex;
		gap: 0.35rem;
	}
	form {
		display: inline;
	}
	button {
		font: inherit;
		min-height: 2.5rem;
		padding: 0.4rem 0.65rem;
	}
</style>
