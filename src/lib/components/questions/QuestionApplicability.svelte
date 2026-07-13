<script lang="ts">
	import type {
		FutureCurriculumOptionDto,
		PrivilegedQuestionDetailDto
	} from '$lib/server/questions/index.js';

	let {
		detail,
		futureCurriculumOptions,
		canPropose,
		canReview
	}: {
		detail: PrivilegedQuestionDetailDto;
		futureCurriculumOptions: readonly FutureCurriculumOptionDto[];
		canPropose: boolean;
		canReview: boolean;
	} = $props();

	function targetLabel(subtaskVersionId: string, elementVersionId: string | null): string {
		const option = futureCurriculumOptions.find(
			(item) =>
				item.subtaskVersionId === subtaskVersionId && item.elementVersionId === elementVersionId
		);
		return option
			? `${option.ancestryLabel}${option.elementName ? ` → ${option.elementName}` : ''}`
			: 'Previously effective curriculum target';
	}
</script>

<section class="applicability" aria-labelledby="question-applicability-heading">
	<h2 id="question-applicability-heading">Applicability</h2>
	<div class="applicability-grid">
		<section aria-labelledby="aircraft-applicability-heading">
			<h3 id="aircraft-applicability-heading">Aircraft</h3>
			{#if detail.aircraft.length === 0}
				<p>No aircraft applicability.</p>
			{:else}
				<ul>
					{#each detail.aircraft as aircraft (aircraft.aircraftVariantId)}
						<li><strong>{aircraft.code}</strong> — {aircraft.name}</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section aria-labelledby="legacy-applicability-heading">
			<h3 id="legacy-applicability-heading">Historical curriculum</h3>
			{#if detail.legacyCurriculum.length === 0}
				<p>No historical TPO/SPO/EO relationship.</p>
			{:else}
				<ul>
					{#each detail.legacyCurriculum as link (`${link.legacyTpoId}-${link.legacySpoId}-${link.legacyEoId}`)}
						<li>TPO {link.legacyTpoId} → SPO {link.legacySpoId} → EO {link.legacyEoId}</li>
					{/each}
				</ul>
			{/if}
			<p class="boundary">Historical identifiers are never interpreted as future hierarchy IDs.</p>
		</section>
	</div>

	<section aria-labelledby="future-applicability-heading">
		<h3 id="future-applicability-heading">Future curriculum links</h3>
		<p>
			Every link requires its own attributable review. Phase 5 mapping approval does not make a
			question eligible.
		</p>
		{#if detail.futureCurriculum.length === 0}
			<p>No future curriculum links.</p>
		{:else}
			<div class="future-links">
				{#each detail.futureCurriculum as link (`${link.subtaskVersionId}-${link.elementVersionId ?? ''}`)}
					<article>
						<h4>{targetLabel(link.subtaskVersionId, link.elementVersionId)}</h4>
						<p><strong>Status:</strong> {link.status}</p>
						{#if ['review', 'approved'].includes(link.status) && canReview}
							<form method="POST" action="?/approveFutureLink">
								<input type="hidden" name="questionVersionId" value={detail.id} />
								<input type="hidden" name="subtaskVersionId" value={link.subtaskVersionId} />
								<label for={`approve-link-${link.subtaskVersionId}-rationale`}
									>Review rationale</label
								>
								<textarea
									id={`approve-link-${link.subtaskVersionId}-rationale`}
									name="rationale"
									maxlength="2000"
									required></textarea>
								<div class="button-row">
									{#if link.status === 'review'}
										<button type="submit">Approve link</button>
									{/if}
									<button type="submit" formaction="?/retireFutureLink" class="danger"
										>Retire link</button
									>
								</div>
							</form>
						{/if}
					</article>
				{/each}
			</div>
		{/if}

		{#if canPropose && detail.lifecycle === 'draft'}
			<form method="POST" action="?/proposeFutureLink" class="propose-link">
				<input type="hidden" name="questionVersionId" value={detail.id} />
				<label for="future-curriculum-target">Propose a published future curriculum target</label>
				<select id="future-curriculum-target" name="futureTarget" required>
					<option value="">Select a target</option>
					{#each futureCurriculumOptions as target (`${target.subtaskVersionId}:${target.elementVersionId ?? ''}`)}
						<option value={`${target.subtaskVersionId}:${target.elementVersionId ?? ''}`}>
							{target.ancestryLabel}{target.elementName ? ` → ${target.elementName}` : ''}
						</option>
					{/each}
				</select>
				<button type="submit">Propose link for review</button>
			</form>
		{/if}
	</section>
</section>

<style>
	.applicability {
		display: grid;
		gap: 1rem;
	}
	.applicability-grid,
	.future-links {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
	}
	.applicability-grid > section,
	.future-links article {
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		padding: 0.8rem;
	}
	h2,
	h3,
	h4 {
		margin-top: 0;
	}
	.boundary {
		color: var(--muted, #536273);
		font-size: 0.9rem;
	}
	form {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.75rem;
	}
	label {
		font-weight: 700;
	}
	textarea,
	select,
	button {
		font: inherit;
		padding: 0.55rem 0.65rem;
	}
	textarea {
		min-height: 5rem;
		resize: vertical;
	}
	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.danger {
		color: white;
		background: var(--danger, #a42b2b);
		border-color: var(--danger, #a42b2b);
	}
	.propose-link {
		max-width: 50rem;
	}
</style>
