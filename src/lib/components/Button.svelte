<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

	let {
		children,
		variant = 'primary',
		class: className = '',
		type = 'button',
		...attributes
	}: HTMLButtonAttributes & { children: Snippet; variant?: Variant } = $props();
</script>

<button {type} class={`button button--${variant} ${className}`} {...attributes}>
	{@render children()}
</button>
