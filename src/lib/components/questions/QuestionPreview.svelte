<script lang="ts">
	import type { CanonicalQuestionDisplayDto } from '$lib/server/questions/index.js';

	let {
		display,
		showKey = false,
		heading = 'Question preview'
	}: {
		display: CanonicalQuestionDisplayDto;
		showKey?: boolean;
		heading?: string;
	} = $props();
</script>

<section class="preview" aria-labelledby="question-preview-heading">
	<h2 id="question-preview-heading">{heading}</h2>
	<p class="prompt">{display.prompt}</p>
	<ol class="choices" type="A">
		{#each display.choices as choice (choice.letter)}
			<li class:keyed={showKey && display.keyLetter === choice.letter}>
				<span>{choice.text}</span>
				{#if showKey && display.keyLetter === choice.letter}
					<strong class="key-label">Correct answer</strong>
				{/if}
			</li>
		{/each}
	</ol>
	{#if !showKey}
		<p class="key-note">Answer-key material is hidden in this view.</p>
	{/if}
</section>

<style>
	.preview {
		background: var(--cream, #fffdf7);
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		padding: clamp(0.9rem, 3vw, 1.35rem);
	}
	h2 {
		margin-top: 0;
	}
	.prompt {
		font-size: 1.08rem;
		font-weight: 700;
		white-space: pre-wrap;
	}
	.choices {
		display: grid;
		gap: 0.5rem;
		padding-left: 2rem;
	}
	.choices li {
		padding: 0.55rem 0.75rem;
		white-space: pre-wrap;
	}
	.choices li::marker {
		font-weight: 700;
	}
	.choices li.keyed {
		background: var(--success-light, #e2f2e8);
		border-left: 0.25rem solid var(--success, #25613d);
	}
	.key-label {
		display: block;
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}
	.key-note {
		color: var(--muted, #536273);
		font-size: 0.9rem;
		margin-bottom: 0;
	}
</style>
