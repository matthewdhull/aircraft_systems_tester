<script lang="ts">
	import { resolve } from '$app/paths';
	import GeneratedExamSummary from '$lib/components/generated-tests/GeneratedExamSummary.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Generated test detail</title></svelte:head>
<article>
	<p class="eyebrow">Immutable snapshot</p>
	<h1>Generated test detail</h1>
	<GeneratedExamSummary exam={data.exam} />
	<nav aria-label="Generated test actions">
		<a href={resolve(`/generated-tests/${data.exam.id}/preview`)}>Staff preview</a> ·
		<a href={resolve(`/generated-tests/${data.exam.id}/print`)}>Printable exam</a
		>{#if data.canViewKeys}
			· <a href={resolve(`/generated-tests/${data.exam.id}/print?answerKey=1`)}
				>Printable answer key</a
			>{/if}
	</nav>
	<p>The access code is intentionally unavailable after generation.</p>
</article>
