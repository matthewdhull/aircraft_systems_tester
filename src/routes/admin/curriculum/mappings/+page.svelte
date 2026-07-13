<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import LegacyMappingReview from '$lib/components/curriculum/LegacyMappingReview.svelte';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const fieldSuffix: Record<string, string> = {
		legacyEntityType: 'source',
		legacyEntityId: 'source',
		targetEntityType: 'target',
		targetEntityId: 'target',
		rationale: 'rationale'
	};
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => {
			const fieldId =
				form?.fieldPrefix && fieldSuffix[item.field]
					? `${form.fieldPrefix}-${fieldSuffix[item.field]}`
					: null;
			return fieldId ? { fieldId, message: item.message } : { message: item.message };
		}),
		...(form?.error
			? [{ message: `The mapping decision failed: ${form.error.replaceAll('_', ' ')}.` }]
			: [])
	]);
	$effect(() => {
		if (!form) return;
		void tick().then(() => {
			if (form.success && form.focusId) document.getElementById(form.focusId)?.focus();
			else if (!form.success) {
				for (const item of summaryErrors) {
					if ('fieldId' in item && item.fieldId)
						document.getElementById(item.fieldId)?.setAttribute('aria-invalid', 'true');
				}
				document.querySelector<HTMLElement>('.error-summary')?.focus();
			}
		});
	});
</script>

<svelte:head><title>Legacy mapping review | Curriculum modeling</title></svelte:head>

<section aria-labelledby="mappings-heading">
	<p class="eyebrow">Curriculum modeling</p>
	<h1 id="mappings-heading">Legacy mapping review</h1>
	<p>Review explicit TPO/SPO/EO proposals without changing the historical curriculum.</p>
	<nav class="section-navigation" aria-label="Curriculum management">
		<a href={resolve('/admin/curriculum')}>Hierarchy</a>
		<a href={resolve('/admin/curriculum/bloom')}>Bloom vocabulary</a>
		<a aria-current="page" href={resolve('/admin/curriculum/mappings')}>Legacy mapping review</a>
	</nav>
	{#if form?.success}<p class="notice" role="status">Mapping decision recorded.</p>{/if}
	{#if navigating.to}<p class="loading" role="status">Loading mapping review…</p>{/if}
	{#if form && !form.success}<ErrorSummary errors={summaryErrors} />{/if}
	<LegacyMappingReview
		legacyHierarchy={data.legacyHierarchy}
		mappings={data.mappings}
		hierarchy={data.hierarchy}
		reconciliation={data.reconciliation}
	/>
</section>

<style>
	.section-navigation {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-block: 1rem;
	}
	.section-navigation a {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.35rem;
		padding: 0.55rem 0.75rem;
		text-decoration: none;
	}
	.section-navigation a[aria-current='page'] {
		background: #e7f0f6;
		font-weight: 700;
	}
	.notice {
		border-left: 0.3rem solid #087f5b;
		padding: 0.75rem;
	}
	.loading {
		font-weight: 700;
	}
</style>
