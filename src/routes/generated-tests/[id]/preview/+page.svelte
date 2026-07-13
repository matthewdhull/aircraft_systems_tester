<script lang="ts">
	import SnapshotView from '$lib/components/generated-tests/SnapshotView.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Staff preview | Generated test</title></svelte:head>
<article>
	<p class="eyebrow">Staff preview — no attempt is created</p>
	<h1>{data.exam.templateName}</h1>
	<SnapshotView questions={data.exam.questions} />
</article>
