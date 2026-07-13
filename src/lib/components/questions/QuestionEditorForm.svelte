<script lang="ts">
	import type {
		AircraftApplicabilityDto,
		FieldError,
		FutureCurriculumOptionDto,
		LegacyQuestionLinkDto,
		PersistedQuestionOptionDto,
		QuestionPromptDto,
		QuestionType
	} from '$lib/server/questions/index.js';

	let {
		action,
		submitLabel,
		questionType,
		originalQuestionType = questionType,
		prompts = [],
		options = [],
		aircraftOptions,
		selectedAircraftIds = [],
		futureCurriculumOptions = [],
		legacyCurriculumLinks = [],
		fields = [],
		versionId = null,
		expectedVersion = null,
		allowInitialFutureLink = false
	}: {
		action: string;
		submitLabel: string;
		questionType: QuestionType;
		originalQuestionType?: QuestionType;
		prompts?: readonly QuestionPromptDto[];
		options?: readonly PersistedQuestionOptionDto[];
		aircraftOptions: readonly AircraftApplicabilityDto[];
		selectedAircraftIds?: readonly string[];
		futureCurriculumOptions?: readonly FutureCurriculumOptionDto[];
		legacyCurriculumLinks?: readonly LegacyQuestionLinkDto[];
		fields?: readonly FieldError[];
		versionId?: string | null;
		expectedVersion?: number | null;
		allowInitialFutureLink?: boolean;
	} = $props();

	const letters = ['A', 'B', 'C', 'D'] as const;
	const promptAt = (position: number) =>
		prompts.find((prompt) => prompt.position === position)?.text ?? '';
	const optionAt = (position: number) =>
		originalQuestionType === questionType
			? (options.find((option) => option.position === position) ?? null)
			: null;
	const fieldError = (...names: string[]) =>
		fields.find((item) => names.includes(item.field))?.message ?? '';
	const promptError = (position: number) =>
		fieldError(
			`prompts.${position}.text`,
			`prompts.${position}`,
			`prompts[${position}]`,
			position === 0 ? 'prompts' : 'alternatePrompts'
		);
	const optionError = (position: number) =>
		fieldError(`options.${position}.text`, `options[${position}].text`, `options.${position}`);
	const typeLabel: Record<QuestionType, string> = {
		true_false: 'True / false',
		single_choice: 'Single-answer multiple choice',
		two_correct_compound: 'Two-correct compound',
		all_correct: 'All correct',
		none_correct: 'None correct'
	};
	const optionPositions = $derived(questionType === 'single_choice' ? [0, 1, 2, 3] : [0, 1, 2]);
</script>

<form method="POST" {action} class="question-editor">
	<input type="hidden" name="questionType" value={questionType} />
	{#if versionId}<input type="hidden" name="versionId" value={versionId} />{/if}
	{#if expectedVersion !== null}
		<input type="hidden" name="expectedVersion" value={expectedVersion} />
	{/if}
	{#each legacyCurriculumLinks as link (`${link.legacyTpoId}-${link.legacySpoId}-${link.legacyEoId}`)}
		<input type="hidden" name="legacyTpoId" value={link.legacyTpoId} />
		<input type="hidden" name="legacySpoId" value={link.legacySpoId} />
		<input type="hidden" name="legacyEoId" value={link.legacyEoId} />
	{/each}

	<section aria-labelledby={`prompt-heading-${versionId ?? 'new'}`}>
		<h3 id={`prompt-heading-${versionId ?? 'new'}`}>Prompts</h3>
		<p>The first prompt is primary. Alternate prompts are ordered and must be distinct.</p>
		{#each [0, 1, 2, 3] as position (position)}
			<div class="field">
				<label for={`question-${versionId ?? 'new'}-prompt-${position}`}>
					{position === 0 ? 'Primary prompt' : `Alternate prompt ${position}`}
				</label>
				<textarea
					id={`question-${versionId ?? 'new'}-prompt-${position}`}
					name="prompts"
					maxlength="4000"
					required={position === 0}
					aria-invalid={promptError(position) ? 'true' : undefined}
					aria-describedby={promptError(position)
						? `question-${versionId ?? 'new'}-prompt-${position}-error`
						: undefined}>{promptAt(position)}</textarea
				>
				{#if promptError(position)}
					<p id={`question-${versionId ?? 'new'}-prompt-${position}-error`} class="field-error">
						{promptError(position)}
					</p>
				{/if}
			</div>
		{/each}
	</section>

	<fieldset class="answer-shape">
		<legend>{typeLabel[questionType]} answer shape</legend>
		{#if fieldError('questionType')}
			<p class="field-error">{fieldError('questionType')}</p>
		{/if}

		{#if questionType === 'true_false'}
			<p>Choose the one semantic Boolean answer. Presentation is always canonical.</p>
			{#each ['True', 'False'] as text, position (text)}
				<input type="hidden" name="optionText" value={text} />
				<input type="hidden" name="semanticValue" value={text.toLowerCase()} />
				<label class="answer-row">
					<input
						type="radio"
						name="keyedPosition"
						value={position}
						checked={optionAt(position)?.isCorrect ?? false}
						required
					/>
					<span><strong>{letters[position]}.</strong> {text}</span>
				</label>
			{/each}
		{:else}
			<p>
				{questionType === 'single_choice'
					? 'Enter four distinct choices and choose exactly one answer.'
					: questionType === 'two_correct_compound'
						? 'Enter three distinct statements and choose exactly two. Choice D is derived by the server.'
						: questionType === 'all_correct'
							? 'Enter three distinct correct statements. Choice D is the canonical all-correct answer.'
							: 'Enter three distinct incorrect statements. Choice D is the canonical none-correct answer.'}
			</p>
			{#each optionPositions as position (position)}
				<div class="option-row">
					{#if questionType === 'single_choice'}
						<input
							aria-label={`Mark choice ${letters[position]} correct`}
							type="radio"
							name="keyedPosition"
							value={position}
							checked={optionAt(position)?.isCorrect ?? false}
							required
						/>
					{:else if questionType === 'two_correct_compound'}
						<input
							aria-label={`Mark statement ${letters[position]} correct`}
							type="checkbox"
							name="keyedPosition"
							value={position}
							checked={optionAt(position)?.isCorrect ?? false}
						/>
					{:else if questionType === 'all_correct'}
						<input type="hidden" name="keyedPosition" value={position} />
						<span aria-label={`Statement ${letters[position]} is correct`}>Correct</span>
					{:else}
						<span aria-label={`Statement ${letters[position]} is incorrect`}>Incorrect</span>
					{/if}
					<label for={`question-${versionId ?? 'new'}-option-${position}`}>
						<span>{letters[position]}.</span>
						<input
							id={`question-${versionId ?? 'new'}-option-${position}`}
							name="optionText"
							type="text"
							value={optionAt(position)?.text ?? ''}
							maxlength="2000"
							required
							aria-invalid={optionError(position) ? 'true' : undefined}
							aria-describedby={optionError(position)
								? `question-${versionId ?? 'new'}-option-${position}-error`
								: undefined}
						/>
					</label>
					{#if optionError(position)}
						<p id={`question-${versionId ?? 'new'}-option-${position}-error`} class="field-error">
							{optionError(position)}
						</p>
					{/if}
				</div>
			{/each}
			{#if questionType === 'two_correct_compound'}
				<p class="derived-choice">
					<strong>D.</strong> The server derives the two correct letters.
				</p>
			{:else if questionType === 'all_correct'}
				<p class="derived-choice"><strong>D.</strong> All of the above.</p>
			{:else if questionType === 'none_correct'}
				<p class="derived-choice"><strong>D.</strong> None of the above.</p>
			{/if}
		{/if}
	</fieldset>

	<fieldset>
		<legend>Aircraft applicability</legend>
		<p>Select at least one published, effective aircraft variant.</p>
		{#if aircraftOptions.length === 0}
			<p class="field-error">No effective aircraft variants are available.</p>
		{:else}
			<div class="checkbox-grid">
				{#each aircraftOptions as aircraft (aircraft.aircraftVariantId)}
					<label>
						<input
							type="checkbox"
							name="aircraftVariantId"
							value={aircraft.aircraftVariantId}
							checked={selectedAircraftIds.includes(aircraft.aircraftVariantId)}
						/>
						{aircraft.code} — {aircraft.name}
					</label>
				{/each}
			</div>
		{/if}
		{#if fieldError('aircraftVariantIds')}
			<p class="field-error">{fieldError('aircraftVariantIds')}</p>
		{/if}
	</fieldset>

	{#if allowInitialFutureLink}
		<div class="field">
			<label for={`question-${versionId ?? 'new'}-future-target`}
				>Initial future curriculum link</label
			>
			<select id={`question-${versionId ?? 'new'}-future-target`} name="futureTarget">
				<option value="">No link proposed</option>
				{#each futureCurriculumOptions as target (`${target.subtaskVersionId}:${target.elementVersionId ?? ''}`)}
					<option value={`${target.subtaskVersionId}:${target.elementVersionId ?? ''}`}>
						{target.ancestryLabel}{target.elementName ? ` → ${target.elementName}` : ''}
					</option>
				{/each}
			</select>
			<p class="hint">
				A proposed link starts in review. Phase 5 mapping approval does not approve this link.
			</p>
		</div>
	{/if}

	<button type="submit" class="submit-button">{submitLabel}</button>
</form>

<style>
	.question-editor {
		display: grid;
		gap: 1rem;
	}
	.question-editor > section,
	.question-editor > fieldset {
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		margin: 0;
		padding: 0.9rem;
	}
	.question-editor h3,
	.question-editor legend {
		font-weight: 700;
		margin-top: 0;
	}
	.field {
		display: grid;
		gap: 0.35rem;
		margin-block: 0.75rem;
		max-width: 50rem;
	}
	.field label,
	.option-row label {
		font-weight: 700;
	}
	textarea,
	input[type='text'],
	select,
	button {
		font: inherit;
		padding: 0.55rem 0.65rem;
	}
	textarea {
		min-height: 6rem;
		resize: vertical;
	}
	textarea,
	input[type='text'],
	select {
		border: 0.125rem solid #687787;
		border-radius: 0.2rem;
		width: 100%;
	}
	[aria-invalid='true'] {
		border-color: var(--danger, #a42b2b);
	}
	.answer-shape {
		display: grid;
		gap: 0.65rem;
	}
	.answer-row {
		align-items: center;
		display: flex;
		gap: 0.65rem;
		min-height: 2.75rem;
	}
	.option-row {
		align-items: center;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: auto minmax(0, 1fr);
	}
	.option-row label {
		align-items: center;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: auto minmax(0, 1fr);
	}
	.option-row .field-error {
		grid-column: 2;
	}
	.derived-choice {
		background: var(--blue-light, #dcecf8);
		padding: 0.65rem;
	}
	.checkbox-grid {
		display: grid;
		gap: 0.45rem;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}
	.checkbox-grid label {
		display: flex;
		gap: 0.45rem;
	}
	.field-error {
		color: var(--danger, #a42b2b);
		font-weight: 650;
		margin: 0;
	}
	.hint {
		color: var(--muted, #536273);
		font-size: 0.9rem;
		margin: 0;
	}
	.submit-button {
		justify-self: start;
		min-height: 2.75rem;
	}
	@media (max-width: 32rem) {
		.option-row {
			align-items: start;
			grid-template-columns: 1fr;
		}
		.option-row label,
		.option-row .field-error {
			grid-column: 1;
		}
	}
</style>
