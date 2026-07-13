<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button, ErrorSummary, Panel, TextField } from '$lib/components';

	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Set password | Aircraft Systems Tester</title></svelte:head>

<Panel heading="Set password">
	{#if form?.success}
		<p role="status">Your password has been set. You may now sign in.</p>
		<p><a href={resolve('/login')}>Continue to sign in</a></p>
	{:else}
		<ErrorSummary errors={form?.error ? [{ message: form.error }] : []} />
		<form method="POST">
			<TextField id="token" name="token" label="Single-use setup token" required />
			<TextField
				id="password"
				name="password"
				type="password"
				label="New password"
				description="Use at least 14 characters."
				autocomplete="new-password"
				required
			/>
			<TextField
				id="confirmation"
				name="confirmation"
				type="password"
				label="Confirm new password"
				autocomplete="new-password"
				required
			/>
			<Button type="submit">Set password</Button>
		</form>
	{/if}
</Panel>

<style>
	form {
		display: grid;
		gap: 1rem;
		max-width: 36rem;
	}
</style>
