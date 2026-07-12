<script lang="ts">
	export interface ValidationError {
		message: string;
		fieldId?: string;
	}

	let {
		errors,
		heading = 'There is a problem'
	}: { errors: readonly ValidationError[]; heading?: string } = $props();
</script>

{#if errors.length > 0}
	<section class="error-summary" aria-labelledby="error-summary-heading" role="alert" tabindex="-1">
		<h2 id="error-summary-heading">{heading}</h2>
		<ul>
			{#each errors as error (error)}
				<li>
					{#if error.fieldId}<a href={`#${error.fieldId}`}>{error.message}</a
						>{:else}{error.message}{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}
