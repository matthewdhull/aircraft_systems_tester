<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import TemplateEditor from '$lib/components/templates/TemplateEditor.svelte';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Test templates | Aircraft Systems Tester</title></svelte:head>
<section>
	<p class="eyebrow">Test modeling</p>
	<h1>Test templates</h1>
	<p>Author attributable, versioned templates. Published versions are immutable.</p>
	{#if form}<ErrorSummary
			errors={(form.fields ?? []).map((item: { message: string }) => ({ message: item.message }))}
		/>{/if}
	<h2>Templates</h2>
	{#if data.templates.length}<ul>
			{#each data.templates as item (item.versionId)}<li>
					<a href={resolve('/test-models/[id]', { id: item.templateId })}>{item.name}</a>
					— version {item.version}, {item.lifecycle}, {item.configuredLength} questions
				</li>{/each}
		</ul>{:else}<p>No canonical templates have been created.</p>{/if}
	<h2>Create draft</h2>
	<TemplateEditor options={data.options} />
	<h2>Legacy sources awaiting explicit review</h2>
	<p><code>test_model</code> and <code>testModel</code> remain distinct; no lineage is inferred.</p>
	<ul>
		{#each data.legacySources as source (source.id)}<li>
				{source.sourceKind} / {source.sourceId} — {source.reconciliationState}
			</li>{/each}
	</ul>
	{#each data.legacySources.filter((source) => source.reconciliationState !== 'mapped') as source (source.id)}
		<details>
			<summary>Adopt {source.sourceKind} / {source.sourceId} as a new draft</summary>
			<p>Review and replace legacy values with canonical applicability and curriculum.</p>
			<TemplateEditor
				options={data.options}
				action="?/adopt"
				submitLabel="Create attributable adoption draft"
				legacySourceId={source.id}
			/>
		</details>
	{/each}
</section>
