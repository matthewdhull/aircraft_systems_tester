# Phase 5 Task-Modeling Characterization

## Evidence and interpretation

This catalog converts the approved legacy task-modeling workflow into Phase 5
automation. Repository evidence is static because the legacy application and
database are shut down. It establishes historical intent, not runtime success,
security, accessibility, HTTP status, or a production vocabulary.

Primary evidence:

- [`taskModeling.php`](../../../taskModeling.php) and
  [`CSS/taskModeling.css`](../../../CSS/taskModeling.css);
- `Classes/phase.php`, `task.php`, `subtask.php`, `element.php`, and `blooms.php`;
- the corresponding `PHPScripts/create*`, `update*`, `delete*`, and `get*`
  dispatchers;
- Phase 1 [endpoint contracts](../../discovery/phase-1/workflow-catalog/endpoint-contracts.md),
  [pages and states](../../discovery/phase-1/workflow-catalog/pages-and-states.md),
  and [scope boundary](../../discovery/phase-1/workflow-catalog/scope-and-exclusions.md);
- `Task Analysis Planning/requirements.md`, `prototyping.md`, `usecasemodel.md`,
  `testplan.md`, and `inventory.md` as design evidence only.

The Phase 0 owner decision is authoritative when repository behavior conflicts
with the target. Phase → Task → Subtask → Element is the future hierarchy. The
source export contains none of those rows and no Bloom rows; both structures
start empty. TPO/SPO/EO is separate and no identifier or mapping is inferred.

## Approved workflow characterization

| Case                                     | Legacy evidence                                                                                                                                          | Automated target assertion                                                                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read hierarchy                           | The page loads Phases, then Tasks, Subtasks, and Elements through parent-keyed calls and displays them nested.                                           | A guarded hierarchy query returns all four levels, deterministic contiguous sibling order, explicit lifecycle text, and an empty state when no future rows exist.                                   |
| Create Phase                             | `+ phase` reveals title/order/Bloom controls and `createPhase.php` persists the root.                                                                    | An authorized command creates an immutable UUID identity and version 1 draft atomically; blank input creates nothing.                                                                               |
| Create Task                              | `+ Task` appears in Phase context and supplies the Phase ID.                                                                                             | Task creation requires the exact Phase version parent and appends or inserts without a collision.                                                                                                   |
| Create Subtask                           | `+ Sub-Task` appears in Task context and supplies the Task ID.                                                                                           | Subtask creation requires the exact Task version parent and preserves the complete chain.                                                                                                           |
| Create Element                           | The implemented page extends the planning-era three levels with nested Element forms and an Element endpoint family.                                     | Element creation requires the exact Subtask version parent; Element never accepts a Bloom verb.                                                                                                     |
| Edit each level                          | Save dispatch chooses create for an unsaved DOM node and update for a persisted ID.                                                                      | Only drafts are editable. Editing writes safe fields and audit attribution without mutating published versions.                                                                                     |
| Create later version                     | Legacy update overwrites one row; Phase 0 instead requires versioning.                                                                                   | A later draft receives the next version number and UUID while the published source remains byte-for-byte unchanged.                                                                                 |
| Submit/review/publish                    | No legacy lifecycle exists; Phase 0 requires a distinct authorized reviewer.                                                                             | Only allowed transitions succeed; author review/publication is rejected; child publication requires a published/effective parent chain.                                                             |
| Reorder siblings                         | Every level has a user-entered number; the browser sorts ascending after reload. Planning evidence explicitly allows later reordering.                   | A complete ordered UUID list produces zero-based contiguous positions in one transaction. First/middle/last moves work; stale/colliding/failing writes roll back.                                   |
| Bloom level and verb selection           | Levels are read separately, verbs are read by level, and legacy descendants limit displayed level ranges from the parent level.                          | Empty controlled vocabulary is valid. Authorized users create/publish/retire levels and verbs; selectors use stored records only and enforce parent compatibility server-side.                      |
| Safe draft deletion                      | Legacy leaf delete removes the DOM node before calling an unconditional hard-delete endpoint.                                                            | A safely unreferenced draft may be hard-deleted only inside a successful transaction and emits an audit event.                                                                                      |
| Published/referenced deletion            | Legacy browser code blocks Phase/Task deletion only when currently rendered children exist; Subtask and Element delete do not perform equivalent checks. | The server enumerates every dependency. Published or referenced versions reject hard deletion and use retirement.                                                                                   |
| Parent dependency warning                | Legacy parent delete silently returns when a rendered child exists.                                                                                      | A server-derived warning returns safe dependency kinds/counts and a revision; changed dependencies invalidate confirmation.                                                                         |
| Blank/invalid fields                     | Endpoints read raw POST fields and construct SQL without complete validation.                                                                            | Fixed field-safe errors reject blank/oversized names, descriptions/rationales, invalid UUIDs/dates/ordinals, wrong parent types, invalid Bloom selections, and noncontiguous orders with no writes. |
| Authorization denial                     | The page has no page-level authentication check and endpoints have no explicit authorization.                                                            | Every load and direct POST requires the real `curriculum.manage` permission; anonymous, insufficient, Instructor-only, revoked, and suspended principals are denied.                                |
| Atomic rollback                          | Legacy operations are independent writes with no transaction contract.                                                                                   | Identity/version, reorder, lifecycle/audit, retirement, mapping decision, and draft deletion roll back completely on injected persistence or audit failure.                                         |
| Progressive enhancement and keyboard use | Legacy interaction is pointer-oriented dynamic jQuery with no documented accessible semantics.                                                           | Ordinary SvelteKit forms work without client-only authorization; disclosure, focus, errors, dependency warnings, and every reorder control are keyboard operable and named.                         |

## Legacy mapping boundary

The export faithfully supplies TPO → SPO → EO only. Phase 5 exposes that legacy
tree read-only and permits a Curriculum Manager to propose a legacy-to-future
mapping. Approval/rejection/retirement is an explicit attributable decision with
rationale. Target existence, type, and both hierarchy chains are validated at
decision time. Reconciliation reports counts and invalid states but repairs
nothing.

Mapping approval does not create `question_future_curriculum_links`, does not
change `question_versions.generation_status`, and does not make a legacy
question eligible. That reviewed question-to-future-curriculum workflow belongs
to Phase 6 and is not implemented here.

## Intentionally rejected legacy defects

These observations become negative regressions, never parity requirements:

1. No page-level or endpoint-level authentication/authorization.
2. SQL assembled from request values and malformed or content-bearing database
   errors returned to the browser.
3. No complete server validation for names, descriptions, positions, parent
   types, Bloom values, or lifecycle.
4. Client-side-only dependency gating based on the currently rendered DOM.
5. Optimistic DOM removal before delete success.
6. Unconditional hard deletion of content that may be referenced.
7. Arbitrary user-entered ordering numbers, duplicate collisions, gaps, partial
   writes, and browser-only sorting.
8. Direct mutation of the only stored curriculum row, erasing history.
9. Missing distinct-reviewer, publication, retirement, effective-date, and
   published-parent-chain rules.
10. A fixed upper Bloom range and assumed starting level/verb in client code.
    No Bloom taxonomy is copied from memory or the absent source tables.
11. Markup assembled from unescaped database content and controls without a
    documented accessible keyboard/focus/error model.
12. Treating legacy numeric IDs as future identities or silently connecting
    TPO/SPO/EO to Phase/Task/Subtask/Element.

## Required automation map

| Suite                                    | Cases                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/curriculum/characterization`      | Evidence inventory, empty-start boundary, four-level CRUD intent, version/lifecycle deltas, rejected defects                           |
| `tests/curriculum/integration`           | Real service CRUD, parent/effective chain, audit/rollback, dependency/delete/retire, real route guards/actions, mapping isolation      |
| `tests/curriculum/accessibility`         | Keyboard disclosure/reorder, focus after mutations, field errors/error summary, dependency announcement, lifecycle text, narrow layout |
| `tests/curriculum/e2e`                   | Built-application Curriculum Manager hierarchy CRUD and keyboard reorder when browser execution is available                           |
| `tests/curriculum/domain` and `database` | 5A lifecycle, ordering, constraints, and rollback details                                                                              |
| `tests/curriculum/ui`                    | 5B component and route-state details                                                                                                   |
| `tests/curriculum/mapping`               | 5C explicit decisions and deterministic reconciliation details                                                                         |

No test may seed a guessed production Bloom taxonomy, copy a protected question
or answer, use a legacy source ID as a future UUID, auto-approve a mapping, or
claim browser/manual evidence that did not actually run.
