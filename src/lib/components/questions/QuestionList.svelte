<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { QuestionSearchResult } from '$lib/server/questions/index.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let {
		result,
		queryString = ''
	}: {
		result: QuestionSearchResult;
		queryString?: string;
	} = $props();

	function pageHref(page: number): string {
		const parameters = new SvelteURLSearchParams(queryString);
		parameters.set('page', String(page));
		return `?${parameters.toString()}`;
	}

	function typeLabel(value: string): string {
		return value.replaceAll('_', ' ');
	}
</script>

<section aria-labelledby="question-results-heading">
	<div class="results-heading">
		<h2 id="question-results-heading" tabindex="-1">Question bank</h2>
		<p>{result.totalItems} {result.totalItems === 1 ? 'version' : 'versions'} found</p>
	</div>
	{#if result.items.length === 0}
		<EmptyState heading="No questions match">
			<p>Change the search or filters, or create a question draft.</p>
		</EmptyState>
	{:else}
		<div class="question-grid">
			{#each result.items as item (item.id)}
				<article class="question-card" aria-labelledby={`question-${item.id}`}>
					<header>
						<p class="type">{typeLabel(item.questionType)}</p>
						<h3 id={`question-${item.id}`}>
							<a href={resolve(`/questions/${item.questionId}`)}>{item.primaryPrompt}</a>
						</h3>
					</header>
					<dl>
						<div>
							<dt>Version</dt>
							<dd>{item.version}</dd>
						</div>
						<div>
							<dt>Lifecycle</dt>
							<dd>{item.lifecycle}</dd>
						</div>
						<div>
							<dt>Generation</dt>
							<dd>{item.generationStatus}</dd>
						</div>
						<div>
							<dt>Prompts</dt>
							<dd>{item.promptCount}</dd>
						</div>
					</dl>
					<p class="aircraft">
						<strong>Aircraft:</strong>
						{item.aircraft.length > 0
							? item.aircraft.map((aircraft) => aircraft.code).join(', ')
							: 'None'}
					</p>
					<p class="link-counts">
						Future links — review: {item.futureLinkCounts.review}, approved: {item.futureLinkCounts
							.approved}, retired: {item.futureLinkCounts.retired}
					</p>
				</article>
			{/each}
		</div>

		<nav class="pagination" aria-label="Question result pages">
			{#if result.page > 1}
				<a href={resolve(pageHref(result.page - 1) as '/')} rel="prev">Previous</a>
			{/if}
			<span>Page {result.page} of {result.totalPages}</span>
			{#if result.page < result.totalPages}
				<a href={resolve(pageHref(result.page + 1) as '/')} rel="next">Next</a>
			{/if}
		</nav>
	{/if}
</section>

<style>
	.results-heading {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		justify-content: space-between;
	}
	.results-heading h2,
	.results-heading p {
		margin-block: 0;
	}
	.question-grid {
		display: grid;
		gap: 0.9rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		margin-top: 1rem;
	}
	.question-card {
		background: var(--cream, #fffdf7);
		border: 1px solid var(--border, #bac5cf);
		border-left: 0.35rem solid var(--blue, #235d8f);
		border-radius: 0.35rem;
		padding: 0.9rem;
	}
	.type {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		margin: 0;
		text-transform: uppercase;
	}
	h3 {
		font-size: 1.08rem;
		margin-block: 0.25rem 0.75rem;
	}
	dl {
		display: grid;
		gap: 0.35rem 0.7rem;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin: 0;
	}
	dl div {
		min-width: 0;
	}
	dt {
		color: var(--muted, #536273);
		font-size: 0.8rem;
	}
	dd {
		font-weight: 700;
		margin: 0;
		text-transform: capitalize;
	}
	.aircraft,
	.link-counts {
		font-size: 0.9rem;
		margin-bottom: 0;
	}
	.link-counts {
		color: var(--muted, #536273);
	}
	.pagination {
		align-items: center;
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.25rem;
	}
	.pagination a {
		border: 1px solid var(--navy, #173654);
		border-radius: 0.25rem;
		padding: 0.45rem 0.7rem;
		text-decoration: none;
	}
</style>
