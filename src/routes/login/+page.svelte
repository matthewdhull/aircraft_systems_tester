<script lang="ts">
	import { Button, ErrorSummary, Panel, TextField } from '$lib/components';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let employeeNumber = $derived(form?.employeeNumber ?? '');
</script>

<svelte:head>
	<title>Sign in | Aircraft Systems Tester</title>
</svelte:head>

<Panel heading="Sign in">
	<p>Use your assigned employee number and password.</p>
	<ErrorSummary errors={form?.error ? [{ message: form.error }] : []} />
	<form method="POST">
		<input type="hidden" name="next" value={form?.next ?? data.next} />
		<TextField
			id="employee-number"
			name="employeeNumber"
			label="Employee number"
			value={employeeNumber}
			autocomplete="username"
			required
		/>
		<TextField
			id="password"
			name="password"
			type="password"
			label="Password"
			autocomplete="current-password"
			required
		/>
		{#if form?.retryAfterSeconds}
			<p role="status">Wait before trying again.</p>
		{/if}
		<Button type="submit">Sign in</Button>
	</form>
</Panel>

<style>
	form {
		display: grid;
		gap: 1rem;
		max-width: 32rem;
	}
</style>
