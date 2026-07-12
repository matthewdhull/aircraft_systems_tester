<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, label }: { children: Snippet; label: string } = $props();
</script>

<div class="data-container" role="region" aria-label={label}>
	{@render children()}
</div>
