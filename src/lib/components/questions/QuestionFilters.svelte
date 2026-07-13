<script lang="ts">
	import { resolve } from '$app/paths';
	import type {
		AircraftApplicabilityDto,
		GenerationStatus,
		QuestionLifecycle,
		QuestionType
	} from '$lib/server/questions/index.js';

	export interface QuestionFilterValues {
		search: string;
		types: readonly QuestionType[];
		lifecycles: readonly QuestionLifecycle[];
		generationStatuses: readonly GenerationStatus[];
		aircraftVariantIds: readonly string[];
		futureLinkStatuses: readonly ('review' | 'approved' | 'retired')[];
		pageSize: number;
	}

	let {
		filters,
		aircraftOptions
	}: {
		filters: QuestionFilterValues;
		aircraftOptions: readonly AircraftApplicabilityDto[];
	} = $props();

	const typeOptions: readonly { value: QuestionType; label: string }[] = [
		{ value: 'true_false', label: 'True / false' },
		{ value: 'single_choice', label: 'Single choice' },
		{ value: 'two_correct_compound', label: 'Two-correct compound' },
		{ value: 'all_correct', label: 'All correct' },
		{ value: 'none_correct', label: 'None correct' }
	];
	const lifecycleOptions: readonly QuestionLifecycle[] = [
		'draft',
		'review',
		'published',
		'retired'
	];
</script>

<details class="filters" open>
	<summary>Search and filter questions</summary>
	<form method="GET" action={resolve('/questions')}>
		<div class="search-row">
			<label for="question-search">Prompt search</label>
			<input
				id="question-search"
				name="search"
				type="search"
				value={filters.search}
				maxlength="200"
				autocomplete="off"
			/>
		</div>

		<div class="filter-grid">
			<fieldset>
				<legend>Question type</legend>
				{#each typeOptions as option (option.value)}
					<label>
						<input
							type="checkbox"
							name="type"
							value={option.value}
							checked={filters.types.includes(option.value)}
						/>
						{option.label}
					</label>
				{/each}
			</fieldset>

			<fieldset>
				<legend>Lifecycle</legend>
				{#each lifecycleOptions as lifecycle (lifecycle)}
					<label>
						<input
							type="checkbox"
							name="lifecycle"
							value={lifecycle}
							checked={filters.lifecycles.includes(lifecycle)}
						/>
						{lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1)}
					</label>
				{/each}
			</fieldset>

			<fieldset>
				<legend>Generation status</legend>
				{#each ['blocked', 'eligible'] as status (status)}
					<label>
						<input
							type="checkbox"
							name="generationStatus"
							value={status}
							checked={filters.generationStatuses.includes(status as GenerationStatus)}
						/>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</label>
				{/each}
			</fieldset>

			<fieldset>
				<legend>Future-link status</legend>
				{#each ['review', 'approved', 'retired'] as status (status)}
					<label>
						<input
							type="checkbox"
							name="futureLinkStatus"
							value={status}
							checked={filters.futureLinkStatuses.includes(
								status as 'review' | 'approved' | 'retired'
							)}
						/>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</label>
				{/each}
			</fieldset>

			<fieldset>
				<legend>Aircraft</legend>
				{#if aircraftOptions.length === 0}
					<p>No aircraft variants are available.</p>
				{:else}
					{#each aircraftOptions as aircraft (aircraft.aircraftVariantId)}
						<label>
							<input
								type="checkbox"
								name="aircraftVariantId"
								value={aircraft.aircraftVariantId}
								checked={filters.aircraftVariantIds.includes(aircraft.aircraftVariantId)}
							/>
							{aircraft.code} — {aircraft.name}
						</label>
					{/each}
				{/if}
			</fieldset>
		</div>

		<div class="filter-actions">
			<label for="question-page-size">Rows per page</label>
			<select id="question-page-size" name="pageSize">
				{#each [10, 25, 50, 100] as size (size)}
					<option value={size} selected={filters.pageSize === size}>{size}</option>
				{/each}
			</select>
			<button type="submit">Apply filters</button>
			<a href={resolve('/questions')}>Clear filters</a>
		</div>
	</form>
</details>

<style>
	.filters {
		background: white;
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		margin-block: 1rem;
		padding: 0.8rem;
	}
	summary,
	legend {
		font-weight: 700;
	}
	form {
		display: grid;
		gap: 1rem;
		margin-top: 1rem;
	}
	.search-row {
		display: grid;
		gap: 0.35rem;
		max-width: 42rem;
	}
	.search-row label {
		font-weight: 700;
	}
	.search-row input,
	select,
	button {
		font: inherit;
		min-height: 2.75rem;
		padding: 0.5rem 0.65rem;
	}
	.filter-grid {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
	}
	fieldset {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		min-width: 0;
	}
	fieldset label {
		display: flex;
		gap: 0.45rem;
	}
	fieldset p {
		color: var(--muted, #536273);
		font-size: 0.9rem;
	}
	.filter-actions {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
	}
	.filter-actions label {
		font-weight: 700;
	}
</style>
