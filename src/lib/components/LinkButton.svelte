<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'quiet';

	let {
		children,
		variant = 'primary',
		class: className = '',
		...attributes
	}: HTMLAnchorAttributes & { children: Snippet; variant?: Variant } = $props();
</script>

<a class={`button button--${variant} ${className}`} {...attributes}>
	{@render children()}
</a>
