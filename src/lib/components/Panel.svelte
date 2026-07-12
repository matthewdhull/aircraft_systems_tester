<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, heading, intro }: { children: Snippet; heading?: string; intro?: string } =
		$props();
</script>

<section class="panel">
	{#if heading}<h2>{heading}</h2>{/if}
	{#if intro}<p class="panel__intro">{intro}</p>{/if}
	{@render children()}
</section>
