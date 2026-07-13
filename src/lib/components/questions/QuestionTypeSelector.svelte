<script lang="ts">
	import type { QuestionType } from '$lib/server/questions/index.js';

	let {
		selectedType,
		action = '',
		versionId = null,
		label = 'Question type',
		parameterName = 'createType'
	}: {
		selectedType: QuestionType;
		action?: string;
		versionId?: string | null;
		label?: string;
		parameterName?: string;
	} = $props();

	const types: readonly { value: QuestionType; label: string }[] = [
		{ value: 'true_false', label: 'True / false' },
		{ value: 'single_choice', label: 'Single-answer multiple choice' },
		{ value: 'two_correct_compound', label: 'Two-correct compound' },
		{ value: 'all_correct', label: 'All correct' },
		{ value: 'none_correct', label: 'None correct' }
	];
</script>

<form method="GET" {action} class="type-selector">
	{#if versionId}<input type="hidden" name="version" value={versionId} />{/if}
	<label for={`question-type-selector-${versionId ?? 'new'}`}>{label}</label>
	<select id={`question-type-selector-${versionId ?? 'new'}`} name={parameterName}>
		{#each types as type (type.value)}
			<option value={type.value} selected={selectedType === type.value}>{type.label}</option>
		{/each}
	</select>
	<button type="submit">Use this type</button>
</form>

<style>
	.type-selector {
		align-items: end;
		display: grid;
		gap: 0.45rem;
		grid-template-columns: minmax(12rem, 24rem) auto;
		margin-block: 0.75rem;
	}
	label {
		font-weight: 700;
		grid-column: 1 / -1;
	}
	select,
	button {
		font: inherit;
		min-height: 2.75rem;
		padding: 0.5rem 0.65rem;
	}
	@media (max-width: 32rem) {
		.type-selector {
			grid-template-columns: 1fr;
		}
	}
</style>
