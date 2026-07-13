# Phase 5 Summary — Curriculum Modeling

## Acceptance result

Phase 5 passes its acceptance gate. The application now provides an authorized,
versioned Phase → Task → Subtask → Element curriculum, controlled empty-start
Bloom vocabulary, and explicitly reviewed legacy TPO/SPO/EO mappings. Phase 6
question-bank, template, eligibility, and generation behavior is not included.

No commit, push, merge, or branch switch was performed. The completed work
remains uncommitted on `curriculum_modeling` pending explicit authorization.

## Tranche results

### 5A — curriculum domain and database

The curriculum service creates immutable UUID identities and version-one drafts,
creates later drafts without changing published rows, enforces review and
publication rules, validates effective parent chains, derives dependency
warnings, and performs collision-free sibling reorder and parent moves in one
transaction. Hard deletion is limited to unreferenced drafts; published content
is retired while its version history remains stored.

Bloom levels and verbs start empty. Their draft, publish, retire, dependency, and
selection rules are enforced on the server without seeding an assumed taxonomy.
The complete design is in
[CURRICULUM_DOMAIN_CONTRACT.md](./CURRICULUM_DOMAIN_CONTRACT.md).

### 5B — curriculum routes and user experience

Three protected route families provide hierarchy modeling, Bloom vocabulary
management, and legacy mapping review. Native disclosures provide progressive
hierarchy navigation. Every mutation is a SvelteKit form action and therefore
works through normal server form submission; enhanced responses restore focus or
focus the error summary. Reordering uses named up/down buttons and submits a
complete sibling order rather than depending on drag interaction.

The layout uses fluid grids and explicit narrow-screen rules. Lifecycle state,
loading, success, error, and dependency information is textually announced and
not communicated by color alone. See
[CURRICULUM_UI_CONTRACT.md](./CURRICULUM_UI_CONTRACT.md).

### 5C — reviewed legacy mapping and reconciliation

Legacy TPO/SPO/EO data remains a separate read-only hierarchy. A mapping starts
as a proposal and becomes usable only after an explicit attributable approve,
reject, or retire decision with a rationale. Target identity, type, publication,
effective hierarchy chain, conflicts, and stale references are validated by the
server. Nothing infers a mapping, and approval does not create a question link or
make a question eligible for future generation.

The deterministic reconciliation report includes unmapped source counts, status
counts, invalid references, conflicts, broken chains, importer-created future
nodes, and question-eligibility side effects. See
[CURRICULUM_MAPPING_CONTRACT.md](./CURRICULUM_MAPPING_CONTRACT.md) and
[CURRICULUM_RECONCILIATION.md](./CURRICULUM_RECONCILIATION.md).

### 5D — authorization, characterization, and convergence

The coordinator added all Phase 5 pages and named mutations to the Phase 4
authorization inventory, retained the real route/action guards, extended only
the safe audit metadata allow-list, integrated authorized navigation, and added
cross-tranche route, hook/session, CRUD, accessibility, rollback, and legacy
characterization coverage.

The final inventory contains 11 protected route patterns and 32 named mutations.
Phase 5 contributes 3 route patterns and 23 mutations; every one requires
`curriculum.manage`. Curriculum Manager and Administrator principals are allowed.
Anonymous, insufficient, Instructor-only, revoked-role, and suspended principals
are denied, including direct action requests.

Legacy behavior and intentional rejections are recorded in
[TASK_MODELING_CHARACTERIZATION.md](./TASK_MODELING_CHARACTERIZATION.md). The
shared typed seams and transaction ownership are recorded in
[INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md).

## Schema and ordered migrations

Migrations `0000`–`0006` are unchanged. Phase 5 adds:

- `0007_phase5_curriculum.sql`: reviewer timestamps, lifecycle/publication
  checks, editable sibling-position uniqueness, and mapping proposal
  attribution;
- `0008_phase5_mapping_review_consistency.sql`: proposed-versus-decided mapping
  attribution consistency; and
- `0009_phase5_curriculum_authorship.sql`: non-null, delete-restricted author
  attribution for all future curriculum versions.

The application schema still has 65 non-internal tables. Clean initialization
through all ten ordered migrations leaves the future hierarchy, Bloom
vocabulary, and mapping set empty and passes `foreign_key_check` and
`integrity_check`.

## Lifecycle and ordering design

The allowed node lifecycle is draft → review → published → retired, with review
→ draft for returned work. Approval and publication require fresh approval by a
reviewer distinct from the author, and the publisher must also differ from the
author. Publishing a child requires the exact parent version and complete
published/effective ancestor chain to cover the child's effective interval.

Positions are zero-based and contiguous inside a sibling group. Creation appends
against the complete latest sibling snapshot. A later draft retains its source
position. Reorder is allowed only when the complete displayed sibling group is
draft; the command carries every sibling version UUID and an optimistic order
revision. The service moves rows through a collision-free temporary range and
writes final positions inside one transaction. Database unique indexes reject
editable position collisions, and a stale or failed operation leaves every
position unchanged.

## Dependencies

No production or development dependency was added or changed. `package-lock.json`
is unchanged. `package.json` adds only `curriculum:test` and
`curriculum:reconcile` scripts.

## Prior-phase invariants

The 15 Phase 3 source dispositions remain unchanged. Fixture import still
creates zero Phase, Task, Subtask, Element, Bloom, mapping, future-question-link,
or eligible-question rows. No legacy ID is reused as a future UUID and no mapping
is inferred. Imported users, credentials, sessions, attempts, and access codes
remain zero. Phase 4 authentication, session, authorization, audit redaction,
origin/CSRF, and secure-cookie behavior remains covered by the passing regression
suite. No authoritative import output or runtime database is tracked.

## Verification and browser status

The command-by-command results and test totals are in
[PHASE_5_VERIFICATION_MATRIX.md](./PHASE_5_VERIFICATION_MATRIX.md). The available
browser-control runtime exposed no browser backend, so no actual browser or
manual verification is claimed. Production build, protected route-action CRUD,
jsdom component/focus/keyboard-control tests, and narrow-layout contract checks
ran successfully. The running development preview additionally passed a live
origin smoke: both loopback aliases and the captured opaque local preview origin
reached the login action, while an unrelated cross-site origin remained
forbidden. These exceptions exist only in an explicit development build.

## Non-blocking future work

Phase 6 may add reviewed question-to-future-curriculum links and generation
eligibility under its own acceptance gate. It must not reinterpret mapping
approval as question eligibility. Browser CRUD and keyboard smoke tests should
also be rerun when a browser backend is available; this does not alter the Phase
5 code or security boundary.
