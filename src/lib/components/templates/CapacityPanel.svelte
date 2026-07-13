<script lang="ts">
	import type { CapacityResult } from '$lib/server/templates/index.js';
	let { capacity }: { capacity: CapacityResult } = $props();
</script>

<section aria-labelledby="capacity-heading">
	<h2 id="capacity-heading">Current inventory capacity</h2>
	<p class:short={capacity.status === 'insufficient'}>
		{capacity.status === 'sufficient'
			? 'Current eligible inventory can satisfy this template.'
			: 'Inventory shortages must be resolved before publication.'}
	</p>
	<ul>
		{#each capacity.ruleCapacity as item (item.ruleId)}<li>
				Rule {item.ruleId}: {item.available} available / {item.needed} required
			</li>{/each}{#each capacity.mandatoryCapacity as item (item.elementVersionId)}<li>
				Element {item.elementVersionId}: {item.available} available / 1 required
			</li>{/each}
	</ul>
	<p>Capacity is advisory. Generation revalidates inventory atomically.</p>
</section>

<style>
	.short {
		color: #9b1c1c;
		font-weight: 700;
	}
</style>
