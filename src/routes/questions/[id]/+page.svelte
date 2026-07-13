<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import QuestionApplicability from '$lib/components/questions/QuestionApplicability.svelte';
	import QuestionDependencies from '$lib/components/questions/QuestionDependencies.svelte';
	import QuestionEditorForm from '$lib/components/questions/QuestionEditorForm.svelte';
	import QuestionLifecycleControls from '$lib/components/questions/QuestionLifecycleControls.svelte';
	import QuestionPreview from '$lib/components/questions/QuestionPreview.svelte';
	import QuestionTypeSelector from '$lib/components/questions/QuestionTypeSelector.svelte';
	import { tick } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const errorMessages: Record<string, string> = {
		invalid_input: 'Review the highlighted fields and try again.',
		invalid_question_type: 'Select one of the five supported question types.',
		invalid_question_shape: 'The answer shape does not match the selected question type.',
		conflict: 'A conflicting question version or link already exists.',
		stale_version: 'This draft changed after the page loaded. Review the latest version.',
		invalid_transition: 'That lifecycle transition is not allowed from the current state.',
		distinct_reviewer_required: 'The author cannot review, publish, or approve their own content.',
		referenced_immutable:
			'Published, imported, or referenced content is immutable. Create a new version.',
		aircraft_not_effective:
			'Aircraft applicability is not valid for the requested effective range.',
		parent_chain_invalid: 'The selected future curriculum ancestry is invalid.',
		curriculum_not_published: 'The future curriculum target is not published and effective.',
		effective_range_invalid: 'Enter an effective range with an end after its start.',
		future_link_review_required: 'An explicit approved future curriculum link is required.',
		future_link_conflict: 'That future curriculum link already exists or has already been decided.',
		dependency_exists: 'Dependencies prevent hard deletion. Retire eligible content instead.',
		dependency_changed: 'Dependencies changed after the page loaded. Review them again.',
		not_found: 'The requested question content is no longer available.',
		unavailable: 'The change could not be saved. No partial change was applied.'
	};
	const fieldId = (field: string) => {
		const prompt = /^prompts\.(\d+)(?:\.text)?$/.exec(field);
		if (prompt) return `question-${data.detail.id}-prompt-${prompt[1]}`;
		const option = /^options\.(\d+)(?:\.text)?$/.exec(field);
		if (option) return `question-${data.detail.id}-option-${option[1]}`;
		const suffix: Record<string, string> = {
			rationale: 'rationale',
			effectiveFrom: 'from',
			effectiveTo: 'to',
			reason: 'reason'
		};
		return form?.fieldPrefix && suffix[field] ? `${form.fieldPrefix}-${suffix[field]}` : null;
	};
	const genericError = $derived(form?.error ? (errorMessages[form.error] ?? '') : '');
	const summaryErrors = $derived([
		...(form?.fields ?? []).map((item) => {
			const id = fieldId(item.field);
			return id ? { fieldId: id, message: item.message } : { message: item.message };
		}),
		...(genericError ? [{ message: genericError }] : [])
	]);
	const successMessages: Record<string, string> = {
		updateDraft: 'Draft updated.',
		createVersion: 'New attributable draft created.',
		submitReview: 'Version submitted for review.',
		reviewVersion: 'Review decision recorded.',
		publishVersion: 'Question version published.',
		retireVersion: 'Question version retired.',
		proposeFutureLink: 'Future curriculum link proposed for review.',
		approveFutureLink: 'Future curriculum link approved.',
		retireFutureLink: 'Future curriculum link retired.'
	};

	$effect(() => {
		if (!form) return;
		void tick().then(() => {
			if (form.success && form.focusId) document.getElementById(form.focusId)?.focus();
			else if (!form.success) document.querySelector<HTMLElement>('.error-summary')?.focus();
		});
	});
</script>

<svelte:head><title>Question version {data.detail.version} | Question bank</title></svelte:head>

<article aria-labelledby="question-detail-heading">
	<nav aria-label="Breadcrumb">
		<a href={resolve('/questions')}>Question bank</a> / Version {data.detail.version}
	</nav>
	<p class="eyebrow">Question authoring</p>
	<h1 id="question-detail-heading" tabindex="-1">Question version {data.detail.version}</h1>
	<div class="metadata" aria-label="Question version status">
		<span>{data.detail.questionType.replaceAll('_', ' ')}</span>
		<span>{data.detail.lifecycle}</span>
		<span>{data.detail.generationStatus}</span>
		<span>{data.detail.promptCount} {data.detail.promptCount === 1 ? 'prompt' : 'prompts'}</span>
	</div>

	{#if navigating.to}<p class="loading" role="status">Loading question version…</p>{/if}
	{#if form?.success}
		<p class="notice" role="status">
			{successMessages[form.operation] ?? 'Question change saved.'}
		</p>
	{/if}
	{#if form && !form.success}<ErrorSummary errors={summaryErrors} />{/if}

	<QuestionPreview display={data.detail.display} showKey={data.capabilities.canViewAnswerKey} />

	{#if data.detail.prompts.length > 1}
		<section aria-labelledby="alternate-prompts-heading">
			<h2 id="alternate-prompts-heading">Alternate prompts</h2>
			<ol>
				{#each data.detail.prompts.slice(1) as prompt (prompt.id)}
					<li>{prompt.text}</li>
				{/each}
			</ol>
		</section>
	{/if}

	<QuestionDependencies dependencies={data.detail.dependencies} />

	{#if data.detail.lifecycle === 'draft' && data.capabilities.canEdit}
		<details class="edit-panel" open={form?.operation === 'updateDraft'}>
			<summary>Edit draft</summary>
			<p>
				Changing the type reloads the exact type-specific fields and clears incompatible choices.
			</p>
			<QuestionTypeSelector
				selectedType={data.selectedType}
				versionId={data.detail.id}
				label="Draft question type"
				parameterName="editType"
			/>
			<QuestionEditorForm
				action="?/updateDraft"
				submitLabel="Save draft changes"
				questionType={data.selectedType}
				originalQuestionType={data.detail.questionType}
				prompts={data.detail.prompts}
				options={data.detail.options}
				aircraftOptions={data.aircraftOptions}
				selectedAircraftIds={data.detail.aircraft.map((aircraft) => aircraft.aircraftVariantId)}
				legacyCurriculumLinks={data.detail.legacyCurriculum}
				fields={form?.operation === 'updateDraft' ? (form.fields ?? []) : []}
				versionId={data.detail.id}
				expectedVersion={data.detail.version}
			/>
		</details>
	{/if}

	<QuestionLifecycleControls detail={data.detail} {...data.capabilities} />
	<QuestionApplicability
		detail={data.detail}
		futureCurriculumOptions={data.futureCurriculumOptions}
		canPropose={data.capabilities.canEdit}
		canReview={data.capabilities.canReview}
	/>
</article>

<style>
	.metadata {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.metadata span {
		background: var(--blue-light, #dcecf8);
		border-radius: 999px;
		font-size: 0.88rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		text-transform: capitalize;
	}
	.loading {
		font-weight: 700;
	}
	.notice {
		background: var(--success-light, #e2f2e8);
		border-left: 0.3rem solid var(--success, #25613d);
		padding: 0.75rem;
	}
	.edit-panel {
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		margin-block: 1rem;
		padding: 0.8rem;
	}
	.edit-panel > summary {
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: 700;
	}
</style>
