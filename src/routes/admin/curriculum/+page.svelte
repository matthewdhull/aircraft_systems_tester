<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import CurriculumHierarchy from '$lib/components/curriculum/CurriculumHierarchy.svelte';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const errorMessages: Record<string, string> = {
		conflict: 'The curriculum changed or already contains conflicting content.',
		stale_version:
			'This draft changed after the page loaded. Review the latest version and try again.',
		stale_order: 'The sibling order changed after the page loaded. No reorder was applied.',
		invalid_transition: 'That lifecycle transition is not allowed from the current state.',
		distinct_reviewer_required: 'The author cannot approve their own version.',
		parent_chain_invalid: 'The selected parent does not form a valid curriculum hierarchy.',
		parent_not_published: 'Publish an effective parent chain before publishing this child.',
		effective_range_invalid: 'The effective range is invalid or is not covered by its parent.',
		dependency_exists:
			'Dependencies prevent this draft from being deleted. Retire it when eligible.',
		dependency_changed: 'Dependencies changed after the warning was calculated. Review them again.',
		referenced_immutable:
			'Published or referenced content is immutable. Create a new draft version.',
		not_found: 'The requested curriculum record is no longer available.',
		unavailable: 'The change could not be saved. No partial changes were applied.'
	};
	const genericError = $derived(form?.error ? (errorMessages[form.error] ?? '') : '');
	const fieldSuffix: Record<string, string> = {
		bloomVerbId: 'bloom',
		parentVersionId: 'parent',
		effectiveFrom: 'from',
		effectiveTo: 'to'
	};
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => {
			const fieldId = form?.fieldPrefix
				? `${form.fieldPrefix}-${fieldSuffix[item.field] ?? item.field}`
				: null;
			return fieldId ? { fieldId, message: item.message } : { message: item.message };
		}),
		...(genericError ? [{ message: genericError }] : [])
	]);
	const successMessage = $derived(
		form?.success
			? form.operation === 'reorderSiblings'
				? 'Sibling order updated.'
				: form.operation === 'deleteDraft'
					? 'Draft deleted.'
					: 'Curriculum change saved.'
			: ''
	);

	$effect(() => {
		if (!form) return;
		void tick().then(() => {
			if (form.success && form.focusId) {
				document.getElementById(form.focusId)?.focus();
			} else if (!form.success) {
				for (const item of summaryErrors) {
					if ('fieldId' in item && item.fieldId)
						document.getElementById(item.fieldId)?.setAttribute('aria-invalid', 'true');
				}
				document.querySelector<HTMLElement>('.error-summary')?.focus();
			}
		});
	});
</script>

<svelte:head><title>Curriculum modeling | Aircraft Systems Tester</title></svelte:head>

<section aria-labelledby="curriculum-heading">
	<p class="eyebrow">Administration</p>
	<h1 id="curriculum-heading" tabindex="-1">Curriculum modeling</h1>
	<p>
		Manage the versioned Phase → Task → Subtask → Element hierarchy. Published history remains
		immutable.
	</p>
	<nav class="section-navigation" aria-label="Curriculum management">
		<a aria-current="page" href={resolve('/admin/curriculum')}>Hierarchy</a>
		<a href={resolve('/admin/curriculum/bloom')}>Bloom vocabulary</a>
		<a href={resolve('/admin/curriculum/mappings')}>Legacy mapping review</a>
	</nav>

	{#if successMessage}<p class="notice" role="status">{successMessage}</p>{/if}
	{#if navigating.to}<p class="loading" role="status">Loading curriculum…</p>{/if}
	{#if form && !form.success}<ErrorSummary errors={summaryErrors} />{/if}

	<CurriculumHierarchy
		hierarchy={data.hierarchy}
		bloomLevels={data.bloomLevels}
		dependencyWarnings={data.dependencyWarnings}
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
