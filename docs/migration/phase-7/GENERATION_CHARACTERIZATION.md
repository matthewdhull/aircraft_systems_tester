# Phase 7 Generation Characterization

## Evidence boundary

Phase 7 executes the synthetic cases in `fixtures/phase-1/golden-behavior/test-generation.json` and traces them through the corresponding manifest entry. Legacy behavior is evidence, not an acceptance target when it conflicts with an approved rule.

## Executed Phase 7 cases

| Case                                                | Phase 7 assertion                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `gen-legacy-mandatory-first-fill`                   | Mandatory coverage occurs before remaining quota fill.                                                 |
| `gen-legacy-shortage-silently-shortens`             | Negative regression: exact generation rejects the legacy partial result.                               |
| `gen-target-exact-composition`                      | Every category quota and total length are exact.                                                       |
| `gen-target-every-mandatory-element`                | A distinct selected question covers every required Element.                                            |
| `gen-target-mandatory-shortage-rollback`            | Safe shortage and no persisted exam/snapshot/success audit.                                            |
| `gen-target-category-shortage-rollback`             | Safe shortage and no persisted exam/snapshot/success audit.                                            |
| `gen-target-seeded-replay`                          | Authorized same-version replay produces identical selection and layout without exposing seed material. |
| `gen-legacy-snapshot-content`                       | Final prompt, displayed choices, and actual response key are snapshotted.                              |
| `gen-target-snapshot-immutable-after-source-change` | Later source mutation cannot alter the generated snapshot.                                             |
| `gen-target-shared-content-distinct-attempt-order`  | Phase 7 proves only the shared immutable question set/layout; per-attempt ordering is deferred.        |
| `access-target-start-window-boundaries`             | Publication records a one-hour half-open start window.                                                 |
| `access-target-preview-no-attempt`                  | Staff preview is audited and creates no attempt, login, answer, grade, or result.                      |

## Intentional delta from legacy generation

The legacy generator selected mandatory rows and then filled categories with database randomness, could silently return fewer rows than configured, accepted caller-provided access values, and recovered a new header through a newest-timestamp lookup. Phase 7 replaces that behavior with a versioned deterministic constraint solver, caller-created UUIDs, secure server entropy, atomic exact persistence, and immutable canonical snapshots.

Legacy `test_model` and `testModel` remain separate source formats. No lineage is inferred. Explicit adoption creates a new attributable draft and does not publish or mutate either source.

## Phase 8 deferrals

Student roster access, attempt creation, per-attempt order, autosave, resume, recovery authorization, extensions, deadline submission, grading, remediation, and retakes are explicitly deferred. Phase 7 neither creates their records nor treats their absent fixture assertions as failures.
