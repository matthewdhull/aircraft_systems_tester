# Phase 6 Question Domain Contract

## Service boundary

`QuestionService` owns one synchronous `DatabaseHandle.transaction` for every
mutation. Repositories, dependency checks, curriculum-chain validation,
eligibility derivation, and audit recording use the caller's transaction. A
failure in any part rolls back content, lifecycle, applicability, eligibility,
and audit together. Production injects the system UTC clock and `randomUUID`;
tests inject deterministic implementations.

The public read API is:

- `search(query)` for safe list/filter/search/pagination;
- `versionSummary(questionId, { versionId? })` for a content-free attribution
  check before privileged access;
- `detail(questionId, { versionId? })` for authorized key-bearing authoring or
  review detail;
- `aircraftOptions()` and `futureCurriculumOptions()` for effective selectors;
- `dependencyPreview(versionId, operation)`; and
- `deriveGenerationEligibility(versionId, now?)`.

The mutation API is `createQuestion`, `updateDraft`, `createVersion`,
`submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`,
`deleteDraft`, `proposeFutureLink`, and `decideFutureLink`. Every mutation takes
`actorUserId` separately; request data never supplies the actor, role, or
permission set.

## Identity, versioning, and lifecycle

Creation inserts an immutable question UUID and version-one draft UUID. Drafts
alone may be edited in place. Submitted, published, retired, referenced, and
imported versions cannot be content-edited. Later work copies an explicit source
version into a new attributable draft with the next identity-local number and
fresh UUIDs for every version-owned row.

The lifecycle is draft → review, review → draft on return, review → published
after approval, and published → retired. Return clears the current submission
and approval attribution before another submission. Approval records a reviewer
and time without changing the review lifecycle until publication. Both review
and publication reject the author as actor, including administrators.
Publication requires a prior distinct approval, an effective range, and at least
one active aircraft whose range covers the publication range.

Hard deletion is limited to an attributable, unreferenced draft after a fresh
dependency revision check. Published/referenced history is retired. A stale
dependency revision returns `dependency_changed`.

## Imported adoption

Phase 3 imports remain provenance-preserving `review` / `blocked` versions with
null author attribution. They cannot be approved, edited, or published in
place. Adoption uses `createVersion` to copy prompts, source option rows,
aircraft, and faithful legacy TPO → SPO → EO links into a new draft attributed
to the adopting actor. Copied future applicability, if any, is always a new
unapproved proposal; imported future-link and eligible totals remain zero.

## Applicability and future-link review

Aircraft and both curriculum relationship families are version-owned. Legacy
links are accepted only when their stored TPO → SPO → EO foreign-key ancestry
is exact; legacy identifiers never become future hierarchy identifiers.

A future proposal requires a current published/effective Phase → Task → Subtask
chain and, when selected, an Element belonging to that exact Subtask version.
It is attributable and begins in `review`. New proposals are limited to drafts,
preserving published/referenced immutability. Existing proposals may be decided
after submission or publication. Approval and retirement require an actor
distinct from both the proposer and question author.

An explicitly supplied future-link array during draft update is replacement
input: unreviewed proposals are deleted/re-proposed to match it. A version with
approved or retired link history is referenced and therefore content-immutable;
draft update returns `referenced_immutable`. Omitting the array preserves
unreviewed proposals. Retiring an approved link recomputes generation status
transactionally.

No legacy mapping, Phase 5 mapping approval, identifier match, import, or
reconciliation process proposes or approves a question link.

An active review/approved question link blocks retirement of its target
Subtask/Element or any Task/Phase ancestor. The reviewer retires the question
link first; that transaction recomputes and audits the question as blocked.
Curriculum retirement can then proceed without leaving stale eligible state.

## Eligibility

Eligibility is derived at the injected clock instant. `eligible` requires the
version to be published and effective, the identity/version not retired, at
least one currently active/effective aircraft, at least one approved future
link, and every approved link to retain a complete published/effective future
ancestry. Otherwise the result is `blocked` with fixed safe reason codes and
counts only.

Publication, link decisions, retirement, and any other eligibility-affecting
mutation persist the derived status and `question.eligibility.changed` audit in
the same transaction. Publication by itself and an approved link on an
unpublished version remain blocked. Question or approved-link retirement
removes eligibility.

## Search, projections, dependencies, and privacy

Search uses parameterized prompt-only matching. Filters compose with AND across
categories and OR within a category. Latest versions order by activity/creation
descending and immutable version ID, with one-based pagination, a default of
25, and a maximum of 100. Phase 6 indexes cover question type/lifecycle/status,
activity, aircraft, future link, and prompt access; list queries never join or
scan question option/key rows.

Safe list items expose primary prompt, lifecycle/count metadata, and aircraft,
but never option text, correctness, semantic values, or derived keys.
`versionSummary` exposes no assessment text. `detail` is intentionally
privileged and key-bearing; route authorization must establish
`answer_keys.view` or the recognized author/reviewer workflow before calling.

Dependency previews expose only fixed kinds, counts, flags, and a SHA-256
revision. Audit metadata is limited to the Phase 6 allow-list. Prompt/option
content, correctness, semantic answers, derived keys, rationales, legacy source
IDs, and curriculum UUID lists never enter generic audit metadata or logs.

## Schema and migration

Migration `0010_phase6_question_bank` preserves the 65-table Phase 3–5 schema,
adds question review time, publication/reviewer consistency checks, future-link
proposal/review attribution, prompt length enforcement, and list/search
indexes. Migrations 0000–0009 are unchanged. The migration preserves populated
imported question rows and relies on the established prior-phase invariant that
future question links are zero before Phase 6; a nonzero unattributed legacy
future-link row fails rather than being silently invented, approved, or lost.
