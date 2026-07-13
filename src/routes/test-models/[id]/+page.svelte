<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import CapacityPanel from '$lib/components/templates/CapacityPanel.svelte';
	import TemplateEditor from '$lib/components/templates/TemplateEditor.svelte';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const hidden = (name: string, value: string) => ({ name, value });
</script>

<svelte:head><title>{data.template.name} | Test templates</title></svelte:head>
<section>
	<a href={resolve('/test-models')}>← Templates</a>
	<h1>{data.template.name}</h1>
	<p>Version {data.template.version} · {data.template.lifecycle} · {data.template.aircraftLabel}</p>
	{#if form}<ErrorSummary
			errors={[{ message: form.error ?? 'Template action completed.' }]}
		/>{/if}{#if data.capacity}<CapacityPanel
			capacity={data.capacity}
		/>{/if}{#if data.template.lifecycle === 'draft'}<h2>Edit draft</h2>
		<TemplateEditor
			options={data.options}
			template={data.template}
			action="?/update"
			submitLabel="Save draft"
		/>
		<form method="POST" action="?/submit">
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><button
				>Submit for review</button
			>
		</form>
		<form method="POST" action="?/delete">
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><input
				type="hidden"
				{...hidden('revision', data.dependency.revision)}
			/><button>Delete unreferenced draft</button>
		</form>{:else if data.template.lifecycle === 'review'}<form
			method="POST"
			action="?/returnToDraft"
		>
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><button
				>Return to draft</button
			>
		</form>
		<form method="POST" action="?/publish">
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><label
				>Effective from <input name="effectiveFrom" type="datetime-local" required /></label
			><label>Effective to (optional) <input name="effectiveTo" type="datetime-local" /></label
			><button>Review and publish</button>
		</form>{:else if data.template.lifecycle === 'published'}<form
			method="POST"
			action="?/newVersion"
		>
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><button
				>Create new draft version</button
			>
		</form>
		<form method="POST" action="?/retire">
			<input type="hidden" {...hidden('versionId', data.template.versionId)} /><button
				>Retire version</button
			>
		</form>{/if}
	<h2>Rules</h2>
	<ol>
		{#each data.template.rules as rule (rule.id)}<li>{rule.subtaskName}: {rule.count}</li>{/each}
	</ol>
	<h2>Mandatory Elements</h2>
	{#if data.template.mandatoryElements.length}<ol>
			{#each data.template.mandatoryElements as item (item.elementVersionId)}<li>
					{item.elementName}
				</li>{/each}
		</ol>{:else}<p>None.</p>{/if}
</section>
