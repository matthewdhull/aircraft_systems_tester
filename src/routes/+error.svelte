<script lang="ts">
	import { page } from '$app/state';
	import { LinkButton, Panel } from '$lib/components';

	let title = $derived(page.status === 404 ? 'Page not found' : 'The page could not be loaded');
	let message = $derived(
		page.status === 404
			? 'The requested location does not exist or is not available yet.'
			: 'Try again. If the problem continues, contact application support.'
	);
</script>

<svelte:head>
	<title>{title} | Aircraft Systems Tester</title>
</svelte:head>

<Panel heading={title}>
	<p>{message}</p>
	<p class="error-reference">Error reference: {page.status}</p>
	<LinkButton href="/">Return to the foundation home</LinkButton>
</Panel>

<style>
	.error-reference {
		color: var(--muted);
		font-size: 0.9rem;
	}
</style>
