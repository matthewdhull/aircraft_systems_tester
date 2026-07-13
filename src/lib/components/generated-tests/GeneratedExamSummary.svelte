<script lang="ts">
	import { resolve } from '$app/paths';
	interface Summary {
		id: string;
		status: string;
		templateName: string;
		templateVersion: number;
		questionCount: number;
		algorithmVersion: string;
		publishedAt: string;
		startClosesAt: string;
	}

	let { exam }: { exam: Summary } = $props();
</script>

<article class="summary">
	<h2><a href={resolve(`/generated-tests/${exam.id}`)}>{exam.templateName}</a></h2>
	<dl>
		<div>
			<dt>Status</dt>
			<dd>{exam.status}</dd>
		</div>
		<div>
			<dt>Template</dt>
			<dd>Version {exam.templateVersion}</dd>
		</div>
		<div>
			<dt>Questions</dt>
			<dd>{exam.questionCount}</dd>
		</div>
		<div>
			<dt>Algorithm</dt>
			<dd>{exam.algorithmVersion}</dd>
		</div>
		<div>
			<dt>Published</dt>
			<dd>{exam.publishedAt}</dd>
		</div>
		<div>
			<dt>New starts close</dt>
			<dd>{exam.startClosesAt}</dd>
		</div>
	</dl>
</article>

<style>
	.summary {
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.4rem;
		padding: 1rem;
	}
	h2 {
		margin-top: 0;
	}
	dl {
		display: grid;
		gap: 0.6rem;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		margin: 0;
	}
	dt {
		font-size: 0.85rem;
		font-weight: 700;
	}
	dd {
		margin: 0.15rem 0 0;
		overflow-wrap: anywhere;
	}
</style>
