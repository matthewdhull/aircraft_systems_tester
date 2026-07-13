<script lang="ts">
	import type { PrivilegedQuestionDetailDto } from '$lib/server/questions/index.js';

	let {
		detail,
		canEdit,
		canReview,
		canPublish,
		canRetire
	}: {
		detail: PrivilegedQuestionDetailDto;
		canEdit: boolean;
		canReview: boolean;
		canPublish: boolean;
		canRetire: boolean;
	} = $props();
</script>

<section class="lifecycle" aria-labelledby="question-lifecycle-heading">
	<h2 id="question-lifecycle-heading">Lifecycle controls</h2>
	<p>
		Current state: <strong>{detail.lifecycle}</strong>. Generation status:
		<strong>{detail.generationStatus}</strong>.
	</p>

	<div class="control-grid">
		{#if detail.lifecycle === 'draft' && canEdit}
			<form method="POST" action="?/submitReview">
				<input type="hidden" name="versionId" value={detail.id} />
				<h3>Submit for review</h3>
				<p>Draft editing ends until a reviewer returns this version.</p>
				<button type="submit">Submit version {detail.version}</button>
			</form>
		{/if}

		{#if detail.lifecycle === 'review' && detail.authoredByUserId !== null && canReview}
			<form method="POST" action="?/reviewVersion">
				<input type="hidden" name="versionId" value={detail.id} />
				<h3>Review version</h3>
				<label for={`review-${detail.id}-rationale`}>Review rationale</label>
				<textarea id={`review-${detail.id}-rationale`} name="rationale" maxlength="2000" required
				></textarea>
				<div class="button-row">
					<button type="submit" name="decision" value="approve">Approve version</button>
					<button type="submit" name="decision" value="return">Return to draft</button>
				</div>
			</form>
		{/if}

		{#if detail.lifecycle === 'review' && detail.reviewedByUserId && canPublish}
			<form method="POST" action="?/publishVersion">
				<input type="hidden" name="versionId" value={detail.id} />
				<h3>Publish approved version</h3>
				<label for={`publish-${detail.id}-from`}>Effective from</label>
				<input
					id={`publish-${detail.id}-from`}
					type="datetime-local"
					name="effectiveFrom"
					required
				/>
				<label for={`publish-${detail.id}-to`}>Effective to (optional)</label>
				<input id={`publish-${detail.id}-to`} type="datetime-local" name="effectiveTo" />
				<button type="submit">Publish version</button>
			</form>
		{/if}

		{#if (detail.lifecycle === 'published' || (detail.lifecycle === 'review' && detail.authoredByUserId === null)) && canEdit}
			<form method="POST" action="?/createVersion">
				<input type="hidden" name="questionId" value={detail.questionId} />
				<input type="hidden" name="fromVersionId" value={detail.id} />
				<h3>
					{detail.authoredByUserId === null ? 'Adopt imported version' : 'Create new version'}
				</h3>
				<p>
					{detail.authoredByUserId === null
						? 'Create an attributable draft. The imported version remains unchanged and blocked.'
						: 'Copy this immutable published version into a new attributable draft.'}
				</p>
				<button type="submit">
					{detail.authoredByUserId === null ? 'Create adoption draft' : 'Create next draft version'}
				</button>
			</form>
		{/if}

		{#if detail.lifecycle === 'published' && canRetire}
			<form method="POST" action="?/retireVersion">
				<input type="hidden" name="versionId" value={detail.id} />
				<input
					type="hidden"
					name="expectedDependencyRevision"
					value={detail.dependencies.revision}
				/>
				<h3>Retire published version</h3>
				<label for={`retire-${detail.id}-reason`}>Retirement reason</label>
				<textarea id={`retire-${detail.id}-reason`} name="reason" maxlength="2000" required
				></textarea>
				<button type="submit" class="danger">Retire version</button>
			</form>
		{/if}

		{#if detail.lifecycle === 'draft' && canEdit}
			<form method="POST" action="?/deleteDraft">
				<input type="hidden" name="versionId" value={detail.id} />
				<input
					type="hidden"
					name="expectedDependencyRevision"
					value={detail.dependencies.revision}
				/>
				<h3>Delete unreferenced draft</h3>
				<label class="confirmation">
					<input type="checkbox" name="confirmed" value="yes" required />
					I understand this permanently deletes only a safely unreferenced draft.
				</label>
				<button type="submit" class="danger">Delete draft</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.lifecycle {
		margin-block: 1rem;
	}
	.control-grid {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
	}
	form {
		align-content: start;
		border: 1px solid var(--border, #bac5cf);
		border-radius: 0.35rem;
		display: grid;
		gap: 0.55rem;
		padding: 0.8rem;
	}
	h3,
	p {
		margin-block: 0 0.4rem;
	}
	label {
		font-weight: 700;
	}
	input[type='datetime-local'],
	textarea,
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
	.confirmation {
		display: flex;
		gap: 0.5rem;
	}
	.danger {
		color: white;
		background: var(--danger, #a42b2b);
		border-color: var(--danger, #a42b2b);
	}
</style>
