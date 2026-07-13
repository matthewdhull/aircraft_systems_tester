# Phase 5 Curriculum Mapping Contract

## Purpose and authority

This contract defines the manually reviewed bridge from the historical TPO/SPO/EO curriculum to the future Phase → Task → Subtask → Element curriculum. It implements the mapping seam fixed by [INTEGRATION_CONTRACT.md](INTEGRATION_CONTRACT.md) and does not alter the Phase 3 importer or source dispositions.

The two curricula remain separate. A mapping is review evidence, not a copied curriculum identity. Legacy source identifiers are never reused as future UUIDs, and neither proposal nor approval creates a future node, Bloom value, question link, or generation-eligibility change.

## Public server API

`createCurriculumMappingService(database)` is exported from `src/lib/server/curriculum-mapping/index.ts`. The service exposes:

- `listLegacyHierarchy()` — deterministic read-only TPO/SPO/EO hierarchy;
- `listMappings()` — deterministic mapping DTO list;
- `reconcile()` — safe, count-only reconciliation;
- `propose(actorUserId, command)` — explicit proposal only;
- `decide(actorUserId, command)` — explicit approve or reject decision; and
- `retire(actorUserId, command)` — retirement of an approved mapping.

The DTOs and commands match the Phase 5 integration contract. Route code supplies the authenticated principal UUID separately from the command. Route authorization must require `curriculum.manage` for reads and mutations.

## Lifecycle and review boundary

The only transitions are:

1. An authorized actor explicitly submits a nonblank rationale to create `proposed`.
2. An authorized reviewer explicitly chooses `approve` or `reject` and supplies a new nonblank rationale.
3. An authorized actor may explicitly retire an `approved` mapping with a nonblank rationale.

No query, importer, reconciliation, heuristic, identifier comparison, name match, hierarchy position, or prior question relationship proposes or approves a mapping automatically. Rejected and retired mappings are terminal. A duplicate proposal for the same source/target pair is rejected. Approval is rejected when another approved mapping already maps the same legacy entity to the same future target type.

Proposal records `proposedByUserId` and `proposedAt`. Decisions record `reviewedByUserId`, `reviewedAt`, and the trimmed decision rationale. Retirement is also attributable through the row's current review attribution and the append-only audit event. Rejection remains possible when a proposal's target has become invalid; invalid data must not be made valid merely to reject it.

## Validation

All mutations validate UUID syntax, controlled type values, and a trimmed nonblank rationale no longer than 2,000 characters before opening the transaction.

Proposal requires:

- an existing legacy source with its complete TPO/SPO/EO parent chain;
- an existing target stable identity of the declared type; and
- no duplicate source/target pair.

Approval revalidates all proposal invariants and additionally requires:

- a currently published/effective target version at the injected clock instant;
- the target version's complete declared Phase/Task/Subtask/Element chain;
- published/effective ancestors whose ranges cover their descendants; and
- no conflicting approved mapping for the same legacy entity and target type.

These polymorphic existence and hierarchy rules are enforced by the service inside the mutation transaction because SQLite cannot express them safely as a single foreign key. Database checks enforce controlled types/status and attributable proposal/review fields.

## Transactions, audit, and failures

The service owns one synchronous `DatabaseHandle.transaction` per mutation. Validation reads, conflict checks, the row mutation, and audit insertion use the same supplied transaction. An audit or storage failure rolls back the mutation and returns `unavailable` without SQL or record content.

Audit actions are `curriculum.mapping.proposed`, `.approved`, `.rejected`, and `.retired`. Persisted audit metadata is limited to source type, target type, status, and decision. Rationales, source IDs, names, UUID lists, question content, and restricted import data are excluded.

Tests inject a deterministic clock, UUID factory, and audit writer. Production composition uses UTC system time, `randomUUID`, and the Phase 4 append-only audit writer.

## Explicit exclusions

Phase 5 mapping code does not:

- mutate legacy TPO/SPO/EO records or source IDs;
- read question prompts, options, or quarantine payloads;
- write `source_target_mappings` (the Phase 3 provenance table);
- write `question_future_curriculum_links`;
- change `question_versions.generation_status`;
- infer relationships from TPO/SPO/EO identifiers; or
- implement question-bank, template, generation, or exam behavior.

Phase 6 owns separately reviewed question-to-future-curriculum links and generation eligibility.
