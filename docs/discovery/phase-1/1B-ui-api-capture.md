# Phase 1B — Legacy UI and API capture

## Result

The approved legacy workflow surfaces have been preserved as an offline,
repository-evidenced page/state and request/response catalog. No application,
database, production system, or external service was started or contacted. No
screenshots, browser recording, or live request capture occurred.

This is characterization evidence, not a target UI specification. The detailed
catalog is indexed in [workflow-catalog/README.md](workflow-catalog/README.md).

## Evidence and status vocabulary

- **Legacy observed:** behavior directly evidenced in checked-in PHP or
  JavaScript. It does not establish that the behavior ever ran successfully or
  should be preserved.
- **Target approved:** product intent approved in
  [OWNER_DECISIONS.md](../phase-0/OWNER_DECISIONS.md). It may replace observed
  behavior.
- **Suspected defect:** repository behavior rejected as a target requirement or
  an implementation inconsistency requiring a negative regression case.
- **Runtime unavailable:** behavior that cannot be demonstrated because the
  application and database are shut down.

Phase 0 approves the primary dashboard, exam, reporting, and task-modeling
curriculum/question/template behavior; it excludes duplicate older interfaces,
daily/predefined WIP flows, FAQ, mail, demos, offline analysis, and other orphan
or prototype artifacts ([owner scope](../phase-0/OWNER_DECISIONS.md#curriculum-content-and-scope)).
No workflow is active today ([Phase 0 summary](../phase-0/PHASE_0_SUMMARY.md#2-no-application-surface-is-currently-active)).

## Approved surfaces characterized

| Workflow | Legacy evidence captured | Approved target distinction |
| --- | --- | --- |
| Instructor login/logout | Login form, session response, dashboard visibility, logout transition | New accounts, secure authentication/session rules, and server authorization replace plaintext/client visibility behavior. |
| Instructor/admin dashboard | Primary tasks, report selection, admin tools, navigation contradiction | Granular multi-role permissions and assigned/organization scope replace the binary UI flag. |
| Curriculum authoring | Phase/Task/Subtask/Element tree and Bloom metadata interactions | Future hierarchy begins empty; version/publish/retire replaces destructive CRUD. |
| Question authoring | Task-modeling create/list/edit/delete states, five type-shaped forms, endpoint payloads | Draft/review/publish, distinct reviewer, versioning, and server validation are approved. |
| Test-model authoring | Task-modeling count and mandatory-element composition plus legacy template selection | Both source template shapes are staged and reconciled; target templates are versioned, not hard-deleted. |
| Test generation | Saved-model selection, credential-pair generation, random selection, snapshot creation | Atomic exact-count generation, recorded seeded randomness, actionable shortages, and immutable published exams are approved. |
| Student access/delivery | Entry form, one-hour access check, override re-entry, navigation, marks/unanswered lists | Roster validation, persisted attempt state, autosave, full single-use recovery, timing, and extensions are approved. |
| Grading/remediation | Two-click submit readiness, key comparison, displayed result, client correction loop | Actual valid-item denominator, exact 80.00% decision, persisted instructor-opened remediation, and audited waiver are approved. |
| Reports/exports | Student, class, curriculum, history, organization score, print, and CSV surfaces | All approved outputs remain required with explicit permissions, audit, scope, privacy, and retention controls. |

## Key convergence findings

1. Repository navigation does not describe one coherent deployed UI. The
   dashboard routes to older question/model pages while the shared navigation
   routes to task-modeling pages
   ([dashboard routes](../../../instructorArea.php#L381),
   [shared routes](../../../Classes/contentClass.php#L32)). Phase 0 resolves
   scope by approving a synthesis, not either duplicate interface wholesale.
2. The dashboard uses a binary `admin` response to reveal controls
   ([instructorArea.php](../../../instructorArea.php#L79)), but the shared report
   dispatcher checks only that a session name exists
   ([getReports.php](../../../PHPScripts/admin/getReports.php#L30)). This is a
   suspected authorization defect, not the target policy.
3. Legacy re-entry returns the same generated question snapshot but restores no
   answers, marks, order, or position
   ([Exam.php](../../../Classes/Exam.php#L330),
   [examCMS.php](../../../examCMS.php#L259)). Target full resume is an approved
   replacement.
4. The client supplies a flag that suppresses persistence during instructor
   preview ([examCMS.php](../../../examCMS.php#L600),
   [Exam.php](../../../Classes/Exam.php#L452)). Target preview must be
   server-authorized, audited, and create no attempt, login, score, or reportable
   result.
5. The legacy correction loop exists only in browser memory
   ([examCMS.php](../../../examCMS.php#L180)); target remediation is persisted,
   instructor-opened, and does not alter the original result.
6. Legacy ejection grants credit and increments stored scores rather than
   removing an item from denominators
   ([ReportsClass.php](../../../Classes/ReportsClass.php#L574)). Its update scope
   also appears broader than the current student iteration
   ([ReportsClass.php](../../../Classes/ReportsClass.php#L589)). Both are negative
   regression evidence; target corrections are append-only and attributable.

## Offline substitute and limitations

The page/state catalog and endpoint contract catalog are the approved substitute
for live screenshots and request recordings. Static inspection can establish
submitted field names, client state transitions, dispatch branches, and encoded
response shapes. It cannot establish HTTP status codes, actual rendered layout,
browser compatibility, database-dependent values/order, timing, production
authorization, endpoint reachability, or whether malformed paths completed.

No screenshots were fabricated. No production traffic, runtime response, access
log, or current user workflow was observed. Error strings listed in the catalog
are synthetic labels or repository control-flow summaries; no credential,
assessment content, answer key, access code, or personal record is reproduced.

## Deliverables

- [Page and state catalog](workflow-catalog/pages-and-states.md)
- [Endpoint contracts](workflow-catalog/endpoint-contracts.md)
- [Navigation and transitions](workflow-catalog/navigation-and-transitions.md)
- [Scope and exclusions](workflow-catalog/scope-and-exclusions.md)

## Phase 1B status

**Complete for offline characterization.** Every requested workflow has a
repository-evidenced entry/state/contract trace and an approved-target
distinction. Runtime visual and traffic evidence is permanently unavailable for
the shut-down legacy system and is recorded as a limitation rather than inferred.
