<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'success' | 'warning' | 'error';

	let { children, tone = 'info' }: { children: Snippet; tone?: Tone } = $props();
</script>

<div class={`status status--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
	{@render children()}
</div>
