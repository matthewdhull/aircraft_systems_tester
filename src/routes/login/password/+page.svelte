<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button, ErrorSummary, Panel, TextField } from '$lib/components';
	import {
		MAXIMUM_PASSWORD_LENGTH,
		MINIMUM_PASSWORD_LENGTH,
		PASSWORD_REQUIREMENT_MESSAGE
	} from '$lib/password-policy';

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
				description={PASSWORD_REQUIREMENT_MESSAGE}
				minlength={MINIMUM_PASSWORD_LENGTH}
				maxlength={MAXIMUM_PASSWORD_LENGTH}
				autocomplete="new-password"
				required
			/>
			<TextField
				id="confirmation"
				name="confirmation"
				type="password"
				label="Confirm new password"
				minlength={MINIMUM_PASSWORD_LENGTH}
				maxlength={MAXIMUM_PASSWORD_LENGTH}
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
