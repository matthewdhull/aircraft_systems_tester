<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import GeneratedExamSummary from '$lib/components/generated-tests/GeneratedExamSummary.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const error = $derived(
		form && !form.success
			? [
					{
						message:
							form.error === 'ROSTER_SCOPE_DENIED'
								? 'You may generate only for an assigned roster.'
								: 'Generation could not satisfy the published template. No exam was created.'
					}
				]
			: []
	);
	$effect(() => {
		if (form)
			void tick().then(() =>
				document
					.querySelector<HTMLElement>(form.success ? '#access-code' : '.error-summary')
					?.focus()
			);
	});
</script>

<svelte:head><title>Generated tests | Aircraft Systems Tester</title></svelte:head>
<section aria-labelledby="generated-heading">
	<p class="eyebrow">Test publication</p>
	<h1 id="generated-heading">Generated tests</h1>
	{#if form?.success}
		<section id="access-code" tabindex="-1" class="one-time" aria-labelledby="code-heading">
			<h2 id="code-heading">Copy the access code now</h2>
			<p>This code is shown once and cannot be recovered after refresh.</p>
			<output>{form.rawAccessCode}</output>
			<p><a href={resolve(`/generated-tests/${form.examId}`)}>Open generated test</a></p>
		</section>
	{:else if error.length}<ErrorSummary errors={error} />{/if}
	<form method="POST" action="?/generate" class="generation-form">
		<h2>Generate from a published template</h2>
		<label
			>Template<select name="templateVersionId" required
				><option value="">Select a template</option
				>{#each data.templates as template (template.id)}<option value={template.id}
						>{template.name} — version {template.version}</option
					>{/each}</select
			></label
		>
		<label
			>Assigned roster<select name="classRosterId" required
				><option value="">Select a roster</option>{#each data.rosters as roster (roster.id)}<option
						value={roster.id}>{roster.name}</option
					>{/each}</select
			></label
		>
		<button>Generate and publish exact snapshot</button>
	</form>
	<div class="list">
		{#each data.exams as exam (exam.id)}<GeneratedExamSummary {exam} />{:else}<p>
				No generated tests are available.
			</p>{/each}
	</div>
</section>

<style>
	.generation-form,
	.one-time {
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.4rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}
	.generation-form label {
		display: grid;
		gap: 0.3rem;
		margin: 0.8rem 0;
		max-width: 34rem;
		font-weight: 700;
	}
	select,
	button {
		font: inherit;
		min-height: 2.75rem;
		padding: 0.5rem;
	}
	.one-time {
		background: #fff5c2;
	}
	output {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	.list {
		display: grid;
		gap: 1rem;
	}
</style>
