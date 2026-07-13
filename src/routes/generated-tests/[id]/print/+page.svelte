<script lang="ts">
	import SnapshotView from '$lib/components/generated-tests/SnapshotView.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>{data.showKeys ? 'Answer key' : 'Printable exam'} | {data.exam.templateName}</title
	></svelte:head
>
<article>
	<h1>{data.exam.templateName} — {data.showKeys ? 'answer key' : 'printable exam'}</h1>
	<p>Template version {data.exam.templateVersion} · {data.exam.questionCount} questions</p>
	<SnapshotView questions={data.exam.questions} showKeys={data.showKeys} />
</article>

<style>
	@media print {
		:global(header),
		:global(nav),
		:global(footer) {
			display: none !important;
		}
	}
</style>
