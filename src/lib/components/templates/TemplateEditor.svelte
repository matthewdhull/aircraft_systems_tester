<script lang="ts">
	import type {
		TemplateAuthoringOptions,
		TemplateVersionDto
	} from '$lib/server/templates/index.js';
	import { untrack } from 'svelte';

	let {
		options,
		template,
		action = '?/create',
		submitLabel = 'Create template draft',
		legacySourceId
	}: {
		options: TemplateAuthoringOptions;
		template?: TemplateVersionDto;
		action?: string;
		submitLabel?: string;
		legacySourceId?: string;
	} = $props();

	let rules = $state(
		untrack(() => template?.rules ?? [{ subtaskVersionId: '', count: 1 }]).map((rule) => ({
			subtaskVersionId: rule.subtaskVersionId,
			count: rule.count
		}))
	);
	let required = $state(
		untrack(() => template?.mandatoryElements ?? []).map((item) => ({
			subtaskVersionId: item.subtaskVersionId,
			elementVersionId: item.elementVersionId
		}))
	);
	const total = $derived(rules.reduce((sum, rule) => sum + (Number(rule.count) || 0), 0));
	function move<T>(items: T[], position: number, offset: number) {
		const target = position + offset;
		if (target < 0 || target >= items.length) return;
		[items[position], items[target]] = [items[target]!, items[position]!];
	}
</script>

<form method="POST" {action} class="template-editor">
	{#if legacySourceId}<input type="hidden" name="legacySourceId" value={legacySourceId} />{/if}
	<div class="grid">
		<label>Name <input name="name" required maxlength="160" value={template?.name ?? ''} /></label>
		<label
			>Aircraft <select name="aircraftVariantId" required
				><option value="">Select aircraft</option>{#each options.aircraft as item (item.id)}<option
						value={item.id}
						selected={item.id === template?.aircraftVariantId}>{item.label}</option
					>{/each}</select
			></label
		>
		<label
			>Course type (optional) <select name="courseTypeId"
				><option value="">All course types</option
				>{#each options.courseTypes as item (item.id)}<option
						value={item.id}
						selected={item.id === template?.courseTypeId}>{item.label}</option
					>{/each}</select
			></label
		>
		<label
			>Configured length <input
				name="configuredLength"
				type="number"
				min="1"
				required
				value={template?.configuredLength ?? 1}
			/></label
		>
		<label
			>Allotted minutes <input
				name="allottedMinutes"
				type="number"
				min="1"
				required
				value={template?.allottedMinutes ?? 60}
			/></label
		>
	</div>
	<fieldset>
		<legend>Ordered Subtask quotas</legend>
		<p aria-live="polite"><strong>Rule total: {total}</strong></p>
		{#each rules as rule, position (rule)}
			<div class="row">
				<span>{position + 1}.</span><select
					name="ruleSubtaskVersionId"
					bind:value={rule.subtaskVersionId}
					required
					><option value="">Select Subtask</option>{#each options.subtasks as item (item.id)}<option
							value={item.id}>{item.label}</option
						>{/each}</select
				><input
					aria-label={`Questions for rule ${position + 1}`}
					name="ruleCount"
					type="number"
					min="1"
					bind:value={rule.count}
					required
				/><button
					type="button"
					aria-label={`Move rule ${position + 1} up`}
					onclick={() => move(rules, position, -1)}>↑</button
				><button
					type="button"
					aria-label={`Move rule ${position + 1} down`}
					onclick={() => move(rules, position, 1)}>↓</button
				><button type="button" onclick={() => rules.splice(position, 1)}>Remove</button>
			</div>
		{/each}
		<button type="button" onclick={() => rules.push({ subtaskVersionId: '', count: 1 })}
			>Add Subtask rule</button
		>
	</fieldset>
	<fieldset>
		<legend>Mandatory Elements</legend>
		{#each required as item, position (item)}
			<div class="row">
				<span>{position + 1}.</span><select
					aria-label={`Mandatory Subtask ${position + 1}`}
					name="mandatorySubtaskVersionId"
					bind:value={item.subtaskVersionId}
					required
					><option value="">Select Subtask</option
					>{#each options.subtasks as subtask (subtask.id)}<option value={subtask.id}
							>{subtask.label}</option
						>{/each}</select
				><select
					aria-label={`Mandatory Element ${position + 1}`}
					name="mandatoryElementVersionId"
					bind:value={item.elementVersionId}
					required
					><option value="">Select Element</option
					>{#each options.subtasks.find((candidate) => candidate.id === item.subtaskVersionId)?.elements ?? [] as element (element.id)}<option
							value={element.id}>{element.label}</option
						>{/each}</select
				><button
					type="button"
					aria-label={`Move mandatory Element ${position + 1} up`}
					onclick={() => move(required, position, -1)}>↑</button
				><button
					type="button"
					aria-label={`Move mandatory Element ${position + 1} down`}
					onclick={() => move(required, position, 1)}>↓</button
				><button type="button" onclick={() => required.splice(position, 1)}>Remove</button>
			</div>
		{/each}
		<button
			type="button"
			onclick={() => required.push({ subtaskVersionId: '', elementVersionId: '' })}
			>Add mandatory Element</button
		>
	</fieldset>
	<button class="primary" type="submit">{submitLabel}</button>
</form>

<style>
	.template-editor,
	.grid {
		display: grid;
		gap: 1rem;
	}
	.grid {
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
	}
	label {
		display: grid;
		gap: 0.35rem;
		font-weight: 650;
	}
	input,
	select,
	button {
		font: inherit;
		min-height: 2.75rem;
	}
	.row {
		display: grid;
		grid-template-columns: auto minmax(10rem, 2fr) minmax(5rem, 1fr) repeat(3, auto);
		gap: 0.5rem;
		align-items: center;
		margin: 0.5rem 0;
	}
	.primary {
		justify-self: start;
		font-weight: 700;
	}
	@media (max-width: 45rem) {
		.row {
			grid-template-columns: auto 1fr;
		}
		.row > * {
			grid-column: 2;
		}
		.row > span {
			grid-column: 1;
			grid-row: 1;
		}
	}
</style>
