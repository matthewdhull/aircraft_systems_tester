<script lang="ts">
	import TextField from '$lib/components/TextField.svelte';
	import type {
		BloomLevelDto,
		CurriculumNodeDto,
		CurriculumNodeType,
		DependencyWarningResult
	} from '$lib/server/curriculum/index.js';
	import DependencyWarning from './DependencyWarning.svelte';

	interface ParentOption {
		id: string;
		name: string;
	}

	let {
		node,
		bloomLevels,
		parentOptions = [],
		warnings = []
	}: {
		node: CurriculumNodeDto;
		bloomLevels: readonly BloomLevelDto[];
		parentOptions?: readonly ParentOption[];
		warnings?: readonly DependencyWarningResult[];
	} = $props();

	const version = $derived(node.latestVersion);
	const label = $derived(node.type.charAt(0).toUpperCase() + node.type.slice(1));
	const warningFor = (operation: DependencyWarningResult['operation']) =>
		warnings.find((warning) => warning.operation === operation);
	const publishedVerbs = $derived(
		bloomLevels.flatMap((level) =>
			level.verbs
				.filter(
					(verb) =>
						(level.status === 'published' && verb.status === 'published') ||
						verb.id === version.bloomVerbId
				)
				.map((verb) => ({ ...verb, levelName: level.name }))
		)
	);
	const parentType: Record<CurriculumNodeType, string> = {
		phase: '',
		task: 'Phase',
		subtask: 'Task',
		element: 'Subtask'
	};
</script>

<details class="lifecycle">
	<summary>Manage {label} “{version.name}”</summary>
	<div class="actions">
		{#if version.status === 'draft'}
			<section aria-labelledby={`edit-${version.id}-heading`}>
				<h4 id={`edit-${version.id}-heading`}>Edit draft</h4>
				<form method="POST" action="?/updateDraft">
					<input type="hidden" name="versionId" value={version.id} />
					<input type="hidden" name="expectedVersion" value={version.version} />
					<TextField
						id={`edit-${version.id}-name`}
						name="name"
						label={`${label} name`}
						value={version.name}
						maxlength={200}
						required
					/>
					<label for={`edit-${version.id}-description`}>Description</label>
					<textarea id={`edit-${version.id}-description`} name="description" maxlength="2000"
						>{version.description ?? ''}</textarea
					>
					{#if node.type !== 'element'}
						<label for={`edit-${version.id}-bloom`}>Bloom verb</label>
						<select id={`edit-${version.id}-bloom`} name="bloomVerbId">
							<option value="">No Bloom verb</option>
							{#each publishedVerbs as verb (verb.id)}
								<option value={verb.id} selected={version.bloomVerbId === verb.id}
									>{verb.levelName}: {verb.verb}</option
								>
							{/each}
						</select>
					{/if}
					{#if node.type !== 'phase' && parentOptions.length > 0}
						<label for={`edit-${version.id}-parent`}>{parentType[node.type]}</label>
						<select id={`edit-${version.id}-parent`} name="parentVersionId">
							{#each parentOptions as parent (parent.id)}
								<option value={parent.id} selected={version.parentVersionId === parent.id}
									>{parent.name}</option
								>
							{/each}
						</select>
						{#if warningFor('parent_change')}
							<DependencyWarning
								warning={warningFor('parent_change')!}
								heading="Parent-change dependencies"
							/>
							<input
								type="hidden"
								name="expectedDependencyRevision"
								value={warningFor('parent_change')!.revision}
							/>
						{/if}
					{/if}
					<button type="submit">Save draft</button>
				</form>
			</section>

			<form method="POST" action="?/submitReview">
				<input type="hidden" name="versionId" value={version.id} />
				<button type="submit">Submit for review</button>
			</form>
		{/if}

		{#if version.status === 'review'}
			<section aria-labelledby={`review-${version.id}-heading`}>
				<h4 id={`review-${version.id}-heading`}>Review decision</h4>
				<p>The approving reviewer must be different from the author.</p>
				<form method="POST" action="?/reviewVersion">
					<input type="hidden" name="versionId" value={version.id} />
					<label for={`review-${version.id}-decision`}>Decision</label>
					<select id={`review-${version.id}-decision`} name="decision" required>
						<option value="">Select decision</option>
						<option value="approve">Approve</option>
						<option value="return">Return for changes</option>
					</select>
					<label for={`review-${version.id}-rationale`}>Rationale</label>
					<textarea id={`review-${version.id}-rationale`} name="rationale" maxlength="2000" required
					></textarea>
					<button type="submit">Record review</button>
				</form>
			</section>

			{#if version.reviewedByUserId}
				<section aria-labelledby={`publish-${version.id}-heading`}>
					<h4 id={`publish-${version.id}-heading`}>Publish approved version</h4>
					<form method="POST" action="?/publishVersion">
						<input type="hidden" name="versionId" value={version.id} />
						<label for={`publish-${version.id}-from`}>Effective from</label>
						<input
							id={`publish-${version.id}-from`}
							name="effectiveFrom"
							type="datetime-local"
							required
						/>
						<label for={`publish-${version.id}-to`}>Effective to (optional)</label>
						<input id={`publish-${version.id}-to`} name="effectiveTo" type="datetime-local" />
						<button type="submit">Publish version</button>
					</form>
				</section>
			{/if}
		{/if}

		{#if version.status === 'published'}
			<form method="POST" action="?/createVersion">
				<input type="hidden" name="nodeId" value={node.id} />
				<input type="hidden" name="fromVersionId" value={version.id} />
				<button type="submit">Create new draft version</button>
			</form>
		{/if}

		{#if version.status !== 'retired' && warningFor('retire')}
			<section aria-labelledby={`retire-${version.id}-heading`}>
				<h4 id={`retire-${version.id}-heading`}>Retire version</h4>
				<DependencyWarning warning={warningFor('retire')!} />
				<form method="POST" action="?/retireVersion">
					<input type="hidden" name="versionId" value={version.id} />
					<input
						type="hidden"
						name="expectedDependencyRevision"
						value={warningFor('retire')!.revision}
					/>
					<label for={`retire-${version.id}-reason`}>Reason</label>
					<textarea id={`retire-${version.id}-reason`} name="reason" maxlength="2000" required
					></textarea>
					<button type="submit">Retire version</button>
				</form>
			</section>
		{/if}

		{#if version.status === 'draft' && warningFor('delete')}
			<section aria-labelledby={`delete-${version.id}-heading`}>
				<h4 id={`delete-${version.id}-heading`}>Delete draft</h4>
				<DependencyWarning warning={warningFor('delete')!} />
				<form method="POST" action="?/deleteDraft">
					<input type="hidden" name="versionId" value={version.id} />
					<input
						type="hidden"
						name="expectedDependencyRevision"
						value={warningFor('delete')!.revision}
					/>
					<label for={`delete-${version.id}-confirmed`}>
						<input
							id={`delete-${version.id}-confirmed`}
							type="checkbox"
							name="confirmed"
							value="yes"
							required
						/>
						I understand this safely unreferenced draft will be permanently deleted.
					</label>
					<button type="submit" disabled={warningFor('delete')!.blocksHardDelete}
						>Delete draft</button
					>
				</form>
			</section>
		{/if}
	</div>
</details>

<style>
	.lifecycle {
		margin-top: 0.65rem;
	}
	summary {
		cursor: pointer;
	}
	.actions {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		margin-top: 0.75rem;
	}
	.actions > section,
	.actions > form {
		border: 1px solid var(--color-border, #d5dadd);
		border-radius: 0.35rem;
		padding: 0.75rem;
	}
	form {
		display: grid;
		gap: 0.55rem;
	}
	textarea {
		font: inherit;
		min-height: 5rem;
		padding: 0.55rem;
	}
	select,
	input,
	button {
		font: inherit;
		padding: 0.55rem;
	}
	h4 {
		margin-top: 0;
	}
</style>
