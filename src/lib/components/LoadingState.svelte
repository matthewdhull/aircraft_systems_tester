<script lang="ts">
	let { message = 'Loading…' }: { message?: string } = $props();
</script>

<div class="state-message" role="status" aria-live="polite">
	<span class="loading-indicator" aria-hidden="true"></span>
	<span>{message}</span>
</div>
