<script lang="ts">
	interface Choice {
		id: string;
		position: number;
		text: string;
		isCorrect?: boolean;
	}
	interface Question {
		id: string;
		position: number;
		promptText: string;
		questionType: string;
		choices: Choice[];
	}
	let { questions, showKeys = false }: { questions: Question[]; showKeys?: boolean } = $props();
	const letter = (position: number) => String.fromCharCode(65 + position);
</script>

<ol class="questions">
	{#each questions as question (question.id)}
		<li>
			<h2>Question {question.position + 1}</h2>
			<p>{question.promptText}</p>
			<ol class="choices">
				{#each question.choices as choice (choice.id)}
					<li class:key={showKeys && choice.isCorrect === true}>
						<span aria-hidden="true">{letter(choice.position)}.</span>
						{choice.text}
						{#if showKeys && choice.isCorrect}<strong> — response key</strong>{/if}
					</li>
				{/each}
			</ol>
		</li>
	{/each}
</ol>

<style>
	.questions {
		padding-left: 1.5rem;
	}
	.questions > li {
		break-inside: avoid;
		margin-bottom: 2rem;
	}
	.choices {
		list-style: none;
		padding: 0;
	}
	.choices li {
		margin: 0.5rem 0;
	}
	.key {
		background: var(--success-light, #e2f2e8);
	}
	@media print {
		.questions > li {
			page-break-inside: avoid;
		}
	}
</style>
