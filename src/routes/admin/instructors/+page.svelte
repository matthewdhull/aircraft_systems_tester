<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const fieldError = (name: string) =>
		form?.fields?.find((item) => item.field === name)?.message ?? '';
	const genericError = $derived(
		form?.error === 'conflict'
			? 'That employee number is already in use.'
			: form?.error === 'unavailable'
				? 'The account could not be saved. Try again.'
				: ''
	);
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => ({
			fieldId: `create-${item.field}`,
			message: item.message
		})),
		...(genericError ? [{ message: genericError }] : [])
	]);

	$effect(() => {
		if (form?.operation === 'create' && !form.success) {
			void tick().then(() => document.querySelector<HTMLElement>('.error-summary')?.focus());
		}
	});
</script>

<svelte:head><title>Instructor administration | Aircraft Systems Tester</title></svelte:head>

<section aria-labelledby="instructors-heading">
	<p class="eyebrow">Administration</p>
	<h1 id="instructors-heading">Instructors and users</h1>
	<p>Create accounts without a password, then manage lifecycle and roles from the user record.</p>

	{#if form?.operation === 'create' && form.success}
		<p class="notice" role="status">
			Account created. It remains pending until explicitly activated.
		</p>
	{/if}

	<div class="admin-grid">
		<section aria-labelledby="account-list-heading">
			<h2 id="account-list-heading">Accounts</h2>
			{#if data.instructors.length === 0}
				<p>No accounts are available.</p>
			{:else}
				<div class="table-scroll" role="region" aria-label="User accounts">
					<table>
						<thead
							><tr
								><th scope="col">Name</th><th scope="col">Employee number</th><th scope="col"
									>Status</th
								><th scope="col">Roles</th></tr
							></thead
						>
						<tbody>
							{#each data.instructors as user (user.id)}
								<tr>
									<th scope="row"
										><a href={resolve(`/admin/instructors/${user.id}`)}
											>{user.lastName}, {user.firstName}</a
										></th
									>
									<td>{user.employeeNumber}</td><td><span class="status">{user.status}</span></td>
									<td>{user.roles.map((role) => role.displayName).join(', ') || 'None'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>

		<section class="panel" aria-labelledby="create-account-heading">
			<h2 id="create-account-heading">Add account</h2>
			<p>New accounts are pending and have no password.</p>
			{#if form?.operation === 'create' && !form.success}
				<ErrorSummary errors={summaryErrors} />
			{/if}
			<form method="POST" action="?/create">
				<TextField
					id="create-employeeNumber"
					name="employeeNumber"
					label="Employee number"
					description="Leading zeroes are preserved."
					value={String(form?.values?.employeeNumber ?? '')}
					error={fieldError('employeeNumber')}
					required
				/>
				<TextField
					id="create-firstName"
					name="firstName"
					label="First name"
					value={String(form?.values?.firstName ?? '')}
					error={fieldError('firstName')}
					required
				/>
				<TextField
					id="create-lastName"
					name="lastName"
					label="Last name"
					value={String(form?.values?.lastName ?? '')}
					error={fieldError('lastName')}
					required
				/>
				<button type="submit">Add pending account</button>
			</form>
		</section>
	</div>
</section>

<style>
	.admin-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 2fr) minmax(18rem, 1fr);
	}
	.panel {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.5rem;
		padding: 1rem;
	}
	.table-scroll {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		border-bottom: 1px solid var(--color-border, #d5dadd);
		padding: 0.65rem;
		text-align: left;
		vertical-align: top;
	}
	.status {
		text-transform: capitalize;
	}
	.notice {
		border-left: 0.3rem solid #087f5b;
		padding: 0.75rem;
	}
	form :global(.text-field) {
		margin-block: 1rem;
	}
	@media (max-width: 52rem) {
		.admin-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
