<script lang="ts">
	import TextField from '$lib/components/TextField.svelte';
	import type { BloomLevelDto, DependencyWarningResult } from '$lib/server/curriculum/index.js';
	import DependencyWarning from './DependencyWarning.svelte';

	let {
		levels,
		dependencyWarnings = []
	}: {
		levels: readonly BloomLevelDto[];
		dependencyWarnings?: readonly DependencyWarningResult[];
	} = $props();

	const warningFor = (id: string, operation: DependencyWarningResult['operation']) =>
		dependencyWarnings.find(
			(warning) => warning.entityId === id && warning.operation === operation
		);
</script>

<section class="panel" aria-labelledby="create-level-heading">
	<h2 id="create-level-heading">Add Bloom level</h2>
	<p>Vocabulary starts empty. Add only reviewed program vocabulary; no taxonomy is seeded.</p>
	<form method="POST" action="?/createLevel">
		<TextField id="createLevel-name" name="name" label="Level name" maxlength={200} required />
		<label for="createLevel-ordinal">Ordinal</label>
		<input id="createLevel-ordinal" name="ordinal" type="number" min="1" step="1" required />
		<button type="submit">Create level draft</button>
	</form>
</section>

{#if levels.length === 0}
	<section class="empty" aria-labelledby="empty-bloom-heading">
		<h2 id="empty-bloom-heading">No Bloom vocabulary</h2>
		<p>This controlled vocabulary intentionally starts empty.</p>
	</section>
{:else}
	<div class="levels">
		{#each levels as level (level.id)}
			<section class="level" aria-labelledby={`level-${level.id}`}>
				<header>
					<div>
						<p class="ordinal">Level {level.ordinal}</p>
						<h2 id={`level-${level.id}`} tabindex="-1">{level.name}</h2>
					</div>
					<strong class={`status status--${level.status}`}>{level.status}</strong>
				</header>

				{#if level.status === 'draft'}
					<div class="controls">
						<form method="POST" action="?/updateLevel">
							<input type="hidden" name="id" value={level.id} />
							<TextField
								id={`updateLevel-${level.id}-name`}
								name="name"
								label="Level name"
								value={level.name}
								maxlength={200}
								required
							/>
							<label for={`updateLevel-${level.id}-ordinal`}>Ordinal</label>
							<input
								id={`updateLevel-${level.id}-ordinal`}
								name="ordinal"
								type="number"
								min="1"
								step="1"
								value={level.ordinal}
								required
							/>
							<button type="submit">Save level draft</button>
						</form>
						<form method="POST" action="?/publishLevel">
							<input type="hidden" name="id" value={level.id} />
							<button type="submit">Publish level</button>
						</form>
						{#if warningFor(level.id, 'delete')}
							<div>
								<DependencyWarning warning={warningFor(level.id, 'delete')!} />
								<form method="POST" action="?/deleteLevel">
									<input type="hidden" name="id" value={level.id} />
									<input
										type="hidden"
										name="expectedDependencyRevision"
										value={warningFor(level.id, 'delete')!.revision}
									/>
									<button type="submit" disabled={warningFor(level.id, 'delete')!.blocksHardDelete}
										>Delete level draft</button
									>
								</form>
							</div>
						{/if}
					</div>
				{:else if level.status === 'published' && warningFor(level.id, 'retire')}
					<DependencyWarning warning={warningFor(level.id, 'retire')!} />
					<form method="POST" action="?/retireLevel" class="retire-form">
						<input type="hidden" name="id" value={level.id} />
						<input
							type="hidden"
							name="expectedDependencyRevision"
							value={warningFor(level.id, 'retire')!.revision}
						/>
						<label for={`retireLevel-${level.id}-reason`}>Retirement reason</label>
						<textarea id={`retireLevel-${level.id}-reason`} name="reason" maxlength="2000" required
						></textarea>
						<button type="submit">Retire level</button>
					</form>
				{/if}

				<section aria-labelledby={`verbs-${level.id}`}>
					<h3 id={`verbs-${level.id}`}>Verbs</h3>
					{#if level.status !== 'retired'}
						<form method="POST" action="?/createVerb" class="add-verb">
							<input type="hidden" name="bloomLevelId" value={level.id} />
							<TextField
								id={`createVerb-${level.id}-verb`}
								name="verb"
								label={`Add verb to ${level.name}`}
								maxlength={200}
								required
							/>
							<button type="submit">Create verb draft</button>
						</form>
					{/if}
					{#if level.verbs.length === 0}
						<p>No verbs in this level.</p>
					{:else}
						<ul class="verbs">
							{#each level.verbs as verb (verb.id)}
								<li>
									<div class="verb-heading">
										<strong>{verb.verb}</strong><span class={`status status--${verb.status}`}
											>{verb.status}</span
										>
									</div>
									{#if verb.status === 'draft'}
										<div class="verb-actions">
											<form method="POST" action="?/updateVerb">
												<input type="hidden" name="id" value={verb.id} />
												<input type="hidden" name="bloomLevelId" value={level.id} />
												<label for={`updateVerb-${verb.id}`}>Verb</label>
												<input
													id={`updateVerb-${verb.id}`}
													name="verb"
													value={verb.verb}
													maxlength="200"
													required
												/>
												<button type="submit">Save verb</button>
											</form>
											<form method="POST" action="?/publishVerb">
												<input type="hidden" name="id" value={verb.id} />
												<button type="submit">Publish verb</button>
											</form>
											{#if warningFor(verb.id, 'delete')}
												<form method="POST" action="?/deleteVerb">
													<input type="hidden" name="id" value={verb.id} />
													<input
														type="hidden"
														name="expectedDependencyRevision"
														value={warningFor(verb.id, 'delete')!.revision}
													/>
													<button
														type="submit"
														disabled={warningFor(verb.id, 'delete')!.blocksHardDelete}
														>Delete verb</button
													>
												</form>
											{/if}
										</div>
									{:else if verb.status === 'published' && warningFor(verb.id, 'retire')}
										<DependencyWarning warning={warningFor(verb.id, 'retire')!} />
										<form method="POST" action="?/retireVerb" class="retire-form">
											<input type="hidden" name="id" value={verb.id} />
											<input
												type="hidden"
												name="expectedDependencyRevision"
												value={warningFor(verb.id, 'retire')!.revision}
											/>
											<label for={`retireVerb-${verb.id}-reason`}>Retirement reason</label>
											<textarea
												id={`retireVerb-${verb.id}-reason`}
												name="reason"
												maxlength="2000"
												required></textarea>
											<button type="submit">Retire verb</button>
										</form>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</section>
		{/each}
	</div>
{/if}

<style>
	.panel,
	.level,
	.empty {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.5rem;
		margin-block: 1rem;
		padding: 1rem;
	}
	.panel form,
	.controls form,
	.add-verb,
	.retire-form {
		display: grid;
		gap: 0.55rem;
	}
	.panel form {
		grid-template-columns: minmax(12rem, 2fr) minmax(6rem, 1fr) auto;
	}
	.panel form :global(.field) {
		grid-row: span 2;
	}
	.level > header,
	.verb-heading {
		align-items: start;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}
	.ordinal,
	h2 {
		margin: 0;
	}
	.ordinal {
		font-size: 0.85rem;
	}
	.status {
		text-transform: capitalize;
	}
	.status--published {
		color: #08724f;
	}
	.status--retired {
		color: #5b6570;
	}
	.controls {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		margin-block: 1rem;
	}
	.verbs {
		display: grid;
		gap: 0.75rem;
		list-style: none;
		padding: 0;
	}
	.verbs > li {
		background: #f7f9fa;
		border-radius: 0.35rem;
		padding: 0.75rem;
	}
	.verb-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.verb-actions form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	input,
	textarea,
	button {
		font: inherit;
		padding: 0.55rem;
	}
	textarea {
		min-height: 4rem;
	}
	@media (max-width: 42rem) {
		.panel form {
			grid-template-columns: 1fr;
		}
	}
</style>
