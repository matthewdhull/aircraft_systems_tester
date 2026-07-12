<script lang="ts">
	import type { Snippet } from 'svelte';

	let { heading, children }: { heading: string; children: Snippet } = $props();
</script>

<div class="empty-state">
	<h2>{heading}</h2>
	{@render children()}
</div>
