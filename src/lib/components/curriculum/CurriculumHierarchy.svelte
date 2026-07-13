<script lang="ts">
	import type {
		BloomLevelDto,
		CurriculumHierarchyDto,
		DependencyWarningResult
	} from '$lib/server/curriculum/index.js';
	import CreateNodeForm from './CreateNodeForm.svelte';
	import CurriculumNodeCard from './CurriculumNodeCard.svelte';

	let {
		hierarchy,
		bloomLevels,
		dependencyWarnings = []
	}: {
		hierarchy: CurriculumHierarchyDto;
		bloomLevels: readonly BloomLevelDto[];
		dependencyWarnings?: readonly DependencyWarningResult[];
	} = $props();

	const warningsFor = (entityId: string) =>
		dependencyWarnings.filter((warning) => warning.entityId === entityId);
	const phaseParents = $derived(
		hierarchy.phases.map((phase) => ({
			id: phase.node.latestVersion.id,
			name: phase.node.latestVersion.name
		}))
	);
	const taskParents = $derived(
		hierarchy.phases.flatMap((phase) =>
			phase.tasks.map((task) => ({
				id: task.node.latestVersion.id,
				name: `${phase.node.latestVersion.name} / ${task.node.latestVersion.name}`
			}))
		)
	);
	const subtaskParents = $derived(
		hierarchy.phases.flatMap((phase) =>
			phase.tasks.flatMap((task) =>
				task.subtasks.map((subtask) => ({
					id: subtask.node.latestVersion.id,
					name: `${task.node.latestVersion.name} / ${subtask.node.latestVersion.name}`
				}))
			)
		)
	);
</script>

{#if hierarchy.phases.length === 0}
	<section class="empty" aria-labelledby="empty-curriculum-heading">
		<h2 id="empty-curriculum-heading">The future curriculum is empty</h2>
		<p>
			This is the expected initial state. Historical TPO/SPO/EO records are not copied into the
			future curriculum.
		</p>
		<CreateNodeForm type="phase" {bloomLevels} open />
	</section>
{:else}
	<div class="hierarchy" aria-label="Curriculum hierarchy">
		<CreateNodeForm type="phase" {bloomLevels} />
		{#each hierarchy.phases as phase (phase.node.id)}
			<CurriculumNodeCard
				node={phase.node}
				orderRevision={hierarchy.rootOrderRevision}
				orderedVersionIds={hierarchy.phases.map((item) => item.node.latestVersion.id)}
				parentVersionId={null}
				canReorder={hierarchy.phases.every((item) => item.node.latestVersion.status === 'draft')}
				{bloomLevels}
				warnings={warningsFor(phase.node.id)}
			>
				<CreateNodeForm type="task" parentVersionId={phase.node.latestVersion.id} {bloomLevels} />
				{#each phase.tasks as task (task.node.id)}
					<CurriculumNodeCard
						node={task.node}
						orderRevision={phase.childrenOrderRevision}
						orderedVersionIds={phase.tasks.map((item) => item.node.latestVersion.id)}
						parentVersionId={phase.node.latestVersion.id}
						canReorder={phase.tasks.every((item) => item.node.latestVersion.status === 'draft')}
						{bloomLevels}
						parentOptions={phaseParents}
						warnings={warningsFor(task.node.id)}
					>
						<CreateNodeForm
							type="subtask"
							parentVersionId={task.node.latestVersion.id}
							{bloomLevels}
						/>
						{#each task.subtasks as subtask (subtask.node.id)}
							<CurriculumNodeCard
								node={subtask.node}
								orderRevision={task.childrenOrderRevision}
								orderedVersionIds={task.subtasks.map((item) => item.node.latestVersion.id)}
								parentVersionId={task.node.latestVersion.id}
								canReorder={task.subtasks.every(
									(item) => item.node.latestVersion.status === 'draft'
								)}
								{bloomLevels}
								parentOptions={taskParents}
								warnings={warningsFor(subtask.node.id)}
							>
								<CreateNodeForm
									type="element"
									parentVersionId={subtask.node.latestVersion.id}
									{bloomLevels}
								/>
								{#each subtask.elements as element (element.id)}
									<CurriculumNodeCard
										node={element}
										orderRevision={subtask.childrenOrderRevision}
										orderedVersionIds={subtask.elements.map((item) => item.latestVersion.id)}
										parentVersionId={subtask.node.latestVersion.id}
										canReorder={subtask.elements.every(
											(item) => item.latestVersion.status === 'draft'
										)}
										{bloomLevels}
										parentOptions={subtaskParents}
										warnings={warningsFor(element.id)}
									/>
								{/each}
							</CurriculumNodeCard>
						{/each}
					</CurriculumNodeCard>
				{/each}
			</CurriculumNodeCard>
		{/each}
	</div>
{/if}

<style>
	.empty {
		border: 1px solid var(--color-border, #aeb7bf);
		border-radius: 0.5rem;
		padding: clamp(1rem, 4vw, 2rem);
		text-align: center;
	}
	.empty :global(form) {
		text-align: left;
	}
	.hierarchy {
		min-width: 0;
	}
</style>
