<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'id' | 'value' | 'aria-invalid'> {
		id: string;
		label: string;
		value?: string;
		description?: string;
		error?: string;
	}

	let {
		id,
		label,
		value = $bindable(''),
		description,
		error,
		class: className = '',
		...attributes
	}: Props = $props();

	let describedBy = $derived(
		[description ? `${id}-description` : undefined, error ? `${id}-error` : undefined]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

<div class={`field ${className}`}>
	<label for={id}
		>{label}{#if attributes.required}<span aria-hidden="true"> *</span>{/if}</label
	>
	{#if description}<p id={`${id}-description`} class="field__description">{description}</p>{/if}
	<input
		{id}
		bind:value
		aria-describedby={describedBy}
		aria-invalid={error ? 'true' : undefined}
		{...attributes}
	/>
	{#if error}<p id={`${id}-error`} class="field__error">{error}</p>{/if}
</div>
