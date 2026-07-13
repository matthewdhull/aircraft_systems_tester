<script lang="ts">
	import { navigating } from '$app/state';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import QuestionEditorForm from '$lib/components/questions/QuestionEditorForm.svelte';
	import QuestionFilters from '$lib/components/questions/QuestionFilters.svelte';
	import QuestionList from '$lib/components/questions/QuestionList.svelte';
	import QuestionTypeSelector from '$lib/components/questions/QuestionTypeSelector.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const errorMessages: Record<string, string> = {
		invalid_input: 'Review the highlighted fields and try again.',
		invalid_question_type: 'Select one of the five supported question types.',
		invalid_question_shape: 'The answer shape does not match the selected question type.',
		aircraft_not_effective: 'Select at least one published, effective aircraft variant.',
		parent_chain_invalid: 'The selected future curriculum target has an invalid ancestry.',
		curriculum_not_published:
			'The selected future curriculum target is not published and effective.',
		future_link_conflict: 'That future curriculum link already exists.',
		unavailable: 'The question could not be saved. No partial change was applied.'
	};
	const fieldId = (field: string) => {
		const prompt = /^prompts\.(\d+)(?:\.text)?$/.exec(field);
		if (prompt) return `question-new-prompt-${prompt[1]}`;
		const option = /^options\.(\d+)(?:\.text)?$/.exec(field);
		if (option) return `question-new-option-${option[1]}`;
		return null;
	};
	const genericError = $derived(form ? (errorMessages[form.error] ?? '') : '');
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => {
			const id = fieldId(item.field);
			return id ? { fieldId: id, message: item.message } : { message: item.message };
		}),
		...(genericError ? [{ message: genericError }] : [])
	]);

	$effect(() => {
		if (form) {
			void tick().then(() => document.querySelector<HTMLElement>('.error-summary')?.focus());
		}
	});
</script>

<svelte:head><title>Question bank | Aircraft Systems Tester</title></svelte:head>

<section aria-labelledby="questions-heading">
	<p class="eyebrow">Question authoring</p>
	<h1 id="questions-heading">Question bank</h1>
	<p>
		Author, review, publish, and retire versioned questions. General results intentionally omit
		answer choices and keys.
	</p>

	{#if navigating.to}<p class="loading" role="status">Loading question bank…</p>{/if}
	{#if form}<ErrorSummary errors={summaryErrors} />{/if}

	<QuestionFilters filters={data.filters} aircraftOptions={data.aircraftOptions} />
	<QuestionList result={data.questions} queryString={data.queryString} />

	{#if data.canCreate}
		<section class="create-panel" aria-labelledby="create-question-heading">
			<h2 id="create-question-heading">Create question draft</h2>
			<p>
				Choose a type to load its exact fields. The server validates the complete shape before
				saving.
			</p>
			<QuestionTypeSelector selectedType={data.createType} />
			<QuestionEditorForm
				action="?/createQuestion"
				submitLabel="Create question draft"
				questionType={data.createType}
				aircraftOptions={data.aircraftOptions}
				futureCurriculumOptions={data.futureCurriculumOptions}
				fields={form?.operation === 'createQuestion' ? form.fields : []}
				allowInitialFutureLink
			/>
		</section>
	{/if}
</section>

<style>
	.loading {
		font-weight: 700;
	}
	.create-panel {
		background: white;
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.4rem;
		margin-top: 2rem;
		padding: clamp(0.9rem, 3vw, 1.4rem);
	}
	.create-panel > h2 {
		margin-top: 0;
	}
</style>
