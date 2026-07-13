<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const user = $derived(data.instructor);
	const message = $derived(form?.success ? 'The account was updated.' : '');
	const fieldError = (operation: string, field: string) =>
		form?.operation === operation
			? (form.fields?.find((item) => item.field === field)?.message ?? '')
			: '';
	const genericError = $derived(
		form?.error === 'conflict'
			? 'That employee number is already in use.'
			: form?.error === 'final_active_administrator'
				? 'This change would remove the final active administrator.'
				: form?.error === 'unavailable'
					? 'The change could not be saved. No changes were applied.'
					: form?.error === 'not_found'
						? 'The requested account or role is no longer available.'
						: ''
	);
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => ({
			fieldId: `${form?.operation}-${item.field}`,
			message: item.message
		})),
		...(genericError ? [{ message: genericError }] : [])
	]);

	$effect(() => {
		if (form && !form.success) {
			void tick().then(() => document.querySelector<HTMLElement>('.error-summary')?.focus());
		}
	});
</script>

<svelte:head
	><title>{user.firstName} {user.lastName} | Instructor administration</title></svelte:head
>

<nav aria-label="Breadcrumb">
	<a href={resolve('/admin/instructors')}>Instructors and users</a> /
	<span aria-current="page">{user.firstName} {user.lastName}</span>
</nav>
<h1>{user.firstName} {user.lastName}</h1>
<p>
	Employee number: <strong>{user.employeeNumber}</strong> · Status:
	<strong class="capitalize">{user.status}</strong>
</p>
{#if message}<p class="notice" role="status">{message}</p>{/if}
{#if form && !form.success}
	<ErrorSummary errors={summaryErrors} />
{/if}

<div class="sections">
	<section class="panel" aria-labelledby="profile-heading">
		<h2 id="profile-heading">Profile</h2>
		<form method="POST" action="?/edit">
			<TextField
				id="edit-firstName"
				name="firstName"
				label="First name"
				value={user.firstName}
				error={fieldError('edit', 'firstName')}
				required
			/>
			<TextField
				id="edit-lastName"
				name="lastName"
				label="Last name"
				value={user.lastName}
				error={fieldError('edit', 'lastName')}
				required
			/>
			<button type="submit">Save profile</button>
		</form>
	</section>

	<section class="panel" aria-labelledby="employee-number-heading">
		<h2 id="employee-number-heading">Correct employee number</h2>
		<p>Corrections are permanently recorded in append-only history.</p>
		<form method="POST" action="?/correctEmployeeNumber">
			<TextField
				id="correctEmployeeNumber-employeeNumber"
				name="employeeNumber"
				label="Replacement employee number"
				description="Leading zeroes are preserved."
				error={fieldError('correctEmployeeNumber', 'employeeNumber')}
				required
			/>
			<TextField
				id="correctEmployeeNumber-reason"
				name="reason"
				label="Reason for correction"
				error={fieldError('correctEmployeeNumber', 'reason')}
				required
			/>
			<button type="submit">Record correction</button>
		</form>
	</section>

	<section class="panel" aria-labelledby="lifecycle-heading">
		<h2 id="lifecycle-heading">Account lifecycle</h2>
		<form method="POST" action="?/changeStatus">
			<label for="changeStatus-status">New status</label>
			<select
				id="changeStatus-status"
				name="status"
				aria-invalid={fieldError('changeStatus', 'status') ? 'true' : undefined}
				aria-describedby={fieldError('changeStatus', 'status')
					? 'changeStatus-status-error'
					: undefined}
				required
			>
				<option value="">Select status</option><option value="active">Active</option><option
					value="suspended">Suspended</option
				><option value="retired">Retired</option>
			</select>
			{#if fieldError('changeStatus', 'status')}<p id="changeStatus-status-error" class="error">
					{fieldError('changeStatus', 'status')}
				</p>{/if}
			<p>
				Suspending or retiring immediately revokes every active session. Retirement is permanent.
			</p>
			<button type="submit">Change status</button>
		</form>
	</section>

	<section class="panel" aria-labelledby="roles-heading">
		<h2 id="roles-heading">Roles</h2>
		{#if user.roles.length}<ul>
				{#each user.roles as role (role.id)}<li>
						{role.displayName}
						<form class="inline" method="POST" action="?/revokeRole">
							<input type="hidden" name="roleId" value={role.id} /><button type="submit"
								>Revoke <span class="visually-hidden">{role.displayName}</span></button
							>
						</form>
					</li>{/each}
			</ul>{:else}<p>No roles granted.</p>{/if}
		<form method="POST" action="?/grantRole">
			<label for="grantRole-roleId">Role to grant</label>
			<select
				id="grantRole-roleId"
				name="roleId"
				aria-invalid={fieldError('grantRole', 'roleId') ? 'true' : undefined}
				aria-describedby={fieldError('grantRole', 'roleId') ? 'grantRole-roleId-error' : undefined}
				required
				><option value="">Select role</option>{#each data.roles as role (role.id)}<option
						value={role.id}>{role.displayName}</option
					>{/each}</select
			>
			{#if fieldError('grantRole', 'roleId')}<p id="grantRole-roleId-error" class="error">
					{fieldError('grantRole', 'roleId')}
				</p>{/if}
			<button type="submit">Grant role</button>
		</form>
	</section>

	<section class="panel" aria-labelledby="history-heading">
		<h2 id="history-heading">Employee number history</h2>
		{#if user.employeeNumberHistory.length}<ol>
				{#each user.employeeNumberHistory as entry (entry.id)}<li>
						<strong>{entry.previousValue}</strong> changed to
						<strong>{entry.replacementValue}</strong>
						on
						<time datetime={entry.changedAt}>{new Date(entry.changedAt).toLocaleDateString()}</time
						>. Reason: {entry.reason}
					</li>{/each}
			</ol>{:else}<p>No corrections recorded.</p>{/if}
	</section>
</div>

<style>
	.sections {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		margin-top: 1.5rem;
	}
	.panel {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.5rem;
		padding: 1rem;
	}
	.panel form {
		display: grid;
		gap: 0.75rem;
		margin-block: 1rem;
	}
	.inline {
		display: inline !important;
		margin-left: 0.75rem;
	}
	.notice {
		border-left: 0.3rem solid #087f5b;
		padding: 0.75rem;
	}
	.error {
		color: #a61b1b;
	}
	.capitalize {
		text-transform: capitalize;
	}
	.visually-hidden {
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}
	select,
	button {
		font: inherit;
		padding: 0.55rem;
	}
</style>
