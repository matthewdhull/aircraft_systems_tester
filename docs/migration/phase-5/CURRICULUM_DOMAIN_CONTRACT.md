# Phase 5 Curriculum Domain Contract

## Authority and boundary

This contract implements the Phase 5 integration contract for the future
Phase → Task → Subtask → Element hierarchy and controlled Bloom vocabulary. The
future hierarchy and vocabulary start empty. This service never reads legacy
identifiers while creating future identities, creates no inferred mapping, and
does not write question eligibility, test-template, exam, or generation state.

The public server seam is `src/lib/server/curriculum/index.ts`. Production code
constructs `createCurriculumService(database)`. Tests may construct
`CurriculumService` with `defaultCurriculumDependencies` to inject a clock, UUID
factory, and caller-transaction audit writer.

## Identity, versions, and hierarchy reads

Every curriculum node has an immutable UUID identity and one or more immutable
UUID versions. Creation writes the identity and version 1 draft in one immediate
SQLite transaction. A later draft copies an explicitly selected source version,
increments the identity-local version number, keeps the source sibling position,
and never updates its published source.

`hierarchy({ publishedOnly: false })` returns one latest non-retired version per
active identity, ordered by zero-based position and version UUID. The
published-only form selects versions effective at the injected clock instant and
then removes any child without the exact published/effective parent version in
the returned chain.

Order revisions hash the complete editable draft UUID order. Reorder is enabled
only when the complete displayed sibling group consists of drafts. A mixed
draft/review/published group is immutable until new drafts exist for the complete
group. Review and published versions are never moved.

## Lifecycle

Allowed transitions are:

- draft → review through submit;
- review → draft through return for changes;
- review → published after explicit approval; and
- published → retired after a fresh dependency preview.

Approval requires a reviewer distinct from the author and records reviewer UUID
and timestamp. A return clears current approval fields; attribution for the
return remains in the audit event. Publication requires both a recorded distinct
approval and a publisher distinct from the author. Publication records canonical
UTC RFC 3339 millisecond effective dates and refuses an invalid or uncovered
range. Every non-root publication requires the exact parent version and every
ancestor to be published with an effective range covering the child.

Draft edits use the version number as an optimistic token. Published and retired
versions are immutable. Retirement is terminal. A published version with a newer
draft cannot be retired as though it were the current node version. Hard deletion
accepts drafts only, recomputes dependencies in the transaction, compares the
opaque preview revision, and removes the stable identity only when no versions
remain.

## Ordering and parent moves

Sibling positions are zero-based. Creation appends against the complete latest
sibling identity snapshot, not merely the current draft subset. Later drafts
retain their source position, so creating drafts out of order does not silently
reorder identities.

Reorder submits every draft sibling UUID exactly once and an expected revision.
The service rejects stale, partial, duplicate, mixed-lifecycle, and wrong-parent
orders. Writes use a collision-free temporary range followed by contiguous final
positions within one outer transaction. Parent moves require a fresh dependency
revision, move the draft through a temporary collision-free position, compact the
old group, and insert contiguously into the new group. Any storage or audit error
rolls back every position and parent write.

Partial unique indexes added by Phase 5 reject duplicate final draft/review
positions for root phases and for each exact parent version. Existing
effective-date position indexes continue to protect published snapshots.

## Dependency warnings

`dependencyPreview` returns counts and kinds only. It never returns curriculum
names, question material, source IDs, UUID lists, or quarantine details. Canonical
reads cover child versions, future-question links, template rules, required
elements, active legacy mappings, and published versions. Bloom previews cover
verbs beneath a level and curriculum version references to a verb.

Delete and parent-change previews are version-specific: they analyze the latest
draft version that the command can mutate. An older published version on the same
stable identity therefore does not prevent safe deletion of an unreferenced later
draft. Stable-identity mapping dependencies are considered for deletion only when
the deleted draft is the identity's final version. Retirement remains
identity-wide because it retires the current stable curriculum identity.

Delete, retire, and parent-change commands recompute the same preview inside the
mutation transaction. Stale revisions return `dependency_changed`; hard-delete
references return `dependency_exists`.

## Bloom vocabulary

No Bloom rows are seeded. Level and verb identities are UUIDs. Creation starts in
draft; drafts may be edited or safely deleted; draft may publish; published may
retire. Published and retired vocabulary is immutable and cannot be hard-deleted.
A verb cannot publish until its level is published.

New curriculum selections require both the verb and its level to be published.
An existing draft may retain its already-selected draft vocabulary, but retired
vocabulary is never available for a new selection. Element versions cannot select
a Bloom verb. When parent and child both select vocabulary, the child level
ordinal cannot be lower than the parent's level.

## Validation, transactions, and audit

Names and verbs are trimmed, nonblank, and at most 200 characters. Descriptions
and required reasons/rationales are at most 2,000 characters. Authored identities,
versions, parents, and vocabulary use validated UUIDs. Dates are canonicalized by
`Date.toISOString()` and effective ranges are half-open.

Each mutation owns one synchronous `DatabaseHandle.transaction`. Repositories,
dependency reads, and the injected audit writer use that transaction and never
start a nested transaction. Storage and audit exceptions return `unavailable`
without a partial write.

Audit actions follow the integration contract's `curriculum.*` vocabulary. Audit
metadata contains only allow-listed type, version, lifecycle, position, changed
field names, counts, decisions, or a fixed dependency-preview reason. Names,
descriptions, user rationale, source identifiers, and dependency UUID lists are
never sent to audit persistence.

## Ordered schema changes

- `0007_phase5_curriculum.sql` adds review timestamps, enforceable unpublished
  sibling position uniqueness, and legacy mapping proposal attribution. Its
  rebuild copies `NULL` for the newly introduced review timestamp from the
  0000–0006 tables.
- `0008_phase5_mapping_review_consistency.sql` requires proposed mappings to have
  no review attribution and every decided mapping to have both reviewer and
  review timestamp.
- `0009_phase5_curriculum_authorship.sql` makes author attribution non-null and
  delete-restricted on every future curriculum version.

Migrations 0000–0006 are unchanged. The migration chain is verified from an
empty database with `foreign_key_check` and `integrity_check`, and the future
curriculum remains empty after initialization.
