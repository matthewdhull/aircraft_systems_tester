<script lang="ts">
	import TextField from '$lib/components/TextField.svelte';
	import type {
		BloomLevelDto,
		CurriculumNodeType,
		FieldError
	} from '$lib/server/curriculum/index.js';

	let {
		type,
		parentVersionId = null,
		bloomLevels,
		fields = [],
		values = {},
		open = false
	}: {
		type: CurriculumNodeType;
		parentVersionId?: string | null;
		bloomLevels: readonly BloomLevelDto[];
		fields?: readonly FieldError[];
		values?: Record<string, unknown>;
		open?: boolean;
	} = $props();

	const label = $derived(type.charAt(0).toUpperCase() + type.slice(1));
	const fieldError = (name: string) => fields.find((item) => item.field === name)?.message ?? '';
	const publishedVerbs = $derived(
		bloomLevels
			.filter((level) => level.status === 'published')
			.flatMap((level) =>
				level.verbs
					.filter((verb) => verb.status === 'published')
					.map((verb) => ({ ...verb, levelName: level.name }))
			)
	);
</script>

<details class="create-node" {open}>
	<summary>Add {label}</summary>
	<form method="POST" action="?/createNode">
		<input type="hidden" name="type" value={type} />
		{#if parentVersionId}<input type="hidden" name="parentVersionId" value={parentVersionId} />{/if}
		<TextField
			id={`create-${type}-${parentVersionId ?? 'root'}-name`}
			name="name"
			label={`${label} name`}
			value={String(values.name ?? '')}
			error={fieldError('name')}
			maxlength={200}
			required
		/>
		<label for={`create-${type}-${parentVersionId ?? 'root'}-description`}>Description</label>
		<textarea
			id={`create-${type}-${parentVersionId ?? 'root'}-description`}
			name="description"
			maxlength="2000"
			aria-invalid={fieldError('description') ? 'true' : undefined}
			aria-describedby={fieldError('description')
				? `create-${type}-${parentVersionId ?? 'root'}-description-error`
				: undefined}>{String(values.description ?? '')}</textarea
		>
		{#if fieldError('description')}<p
				id={`create-${type}-${parentVersionId ?? 'root'}-description-error`}
				class="field-error"
			>
				{fieldError('description')}
			</p>{/if}

		{#if type !== 'element'}
			<label for={`create-${type}-${parentVersionId ?? 'root'}-bloom`}>Bloom verb</label>
			<select id={`create-${type}-${parentVersionId ?? 'root'}-bloom`} name="bloomVerbId">
				<option value="">No Bloom verb</option>
				{#each publishedVerbs as verb (verb.id)}
					<option value={verb.id} selected={values.bloomVerbId === verb.id}
						>{verb.levelName}: {verb.verb}</option
					>
				{/each}
			</select>
			{#if publishedVerbs.length === 0}<p class="hint">
					No published Bloom verbs are available. Vocabulary starts empty and is managed separately.
				</p>{/if}
		{/if}
		<button type="submit">Create {label} draft</button>
	</form>
</details>

<style>
	.create-node {
		border: 1px dashed var(--color-border, #aeb7bf);
		border-radius: 0.4rem;
		margin-block: 0.75rem;
		padding: 0.65rem;
	}
	summary {
		cursor: pointer;
		font-weight: 700;
	}
	form {
		display: grid;
		gap: 0.65rem;
		margin-top: 0.75rem;
	}
	textarea {
		font: inherit;
		min-height: 5rem;
		padding: 0.55rem;
		resize: vertical;
	}
	select,
	button {
		font: inherit;
		padding: 0.55rem;
	}
	.field-error {
		color: #a61b1b;
		margin: 0;
	}
	.hint {
		color: var(--color-text-muted, #4c5963);
		font-size: 0.9rem;
		margin: 0;
	}
</style>
