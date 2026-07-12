# Navigation and transitions

## Repository navigation map

```text
instructorArea.php
  logged out -> login submit -> instructor dashboard
  instructor dashboard -> testCRUD.php -> saved model -> generated exam
  instructor dashboard -> examCMS.php -> access -> delivery -> grade -> review
  instructor dashboard -> report criteria -> report/print/export
  legacy admin buttons -> questionCRUD.php / testModeling.php

shared navigation
  -> instructorArea.php
  -> questionCRUD_taskModeling.php
  -> testModeling_taskModeling.php
  -> taskModeling.php
```

The two authoring navigation branches conflict
([dashboard](../../../../instructorArea.php#L381),
[shared navigation](../../../../Classes/contentClass.php#L32)). Phase 0 approves
the primary workflow plus task-modeling behavior and rejects treating either
legacy page set as a target route map.

## Workflow state transitions

| Workflow | Legacy observed transition | Target approved transition |
| --- | --- | --- |
| Login | logged out → submit → success/dashboard or error; session probe can enter dashboard directly; logout clears UI/session fields | authenticated new account → server-authorized role/scoped dashboard; revocation, idle/absolute expiry, rotation, and audit enforced |
| Question authoring | browse → create or edit → submit → refresh; delete removes list row | draft version → submit for review → distinct reviewer publishes/retires; referenced versions persist |
| Curriculum | load tree → add/edit/delete nodes and Bloom metadata | draft/version → reviewed publish/retire; future hierarchy initially empty |
| Template authoring | inventory load → adjust counts → select mandatory elements → submit | versioned template composition → validation/review → publish/retire |
| Generation | filter models → choose model → generate access pair → create → status | approved template → atomic seeded selection → immutable published snapshot, or actionable shortage with no partial exam |
| First exam entry | form valid → code accepted → access row inserted → in-memory shuffled exam | roster + active code → one persisted attempt/order/deadline → autosaved delivery |
| Legacy re-entry | prior access → recovery prompt → code pair accepted → fresh in-memory state over same snapshot | single-use audited recovery → same attempt, answers, marks, order, position, and timing restored |
| Submit | click → readiness/warning → second click → grading → results | explicit/auto-submit once → exact-count grading; duplicate rejected; unanswered deadline items incorrect |
| Correction | missed items → client reveals key → correct each → local completion message | instructor opens persisted remediation → completion or audited waiver; original score unchanged |
| Invalidation | snapshot report → client 24-hour gate → ejection → direct result/score mutation | explicit permission → append-only reasoned event → denominator recomputation preserving originals |
| Reports | select criteria → endpoint → DOM table/list → optional popup or CSV | scoped report → permission/audit → privacy/retention-safe view or export |

## Error and boundary states

- Instructor login: missing fields, no record, password mismatch
  ([instructorLogin.php](../../../../PHPScripts/admin/instructorLogin.php#L46)).
- Exam access: invalid/expired code, recovery required, recovery mismatch
  ([Exam.php](../../../../Classes/Exam.php#L277)).
- Exam readiness: unanswered items or all answered/confirmation
  ([examCMS.php](../../../../examCMS.php#L672)).
- Student report: no matching record for submitted criteria
  ([instructorArea.php](../../../../instructorArea.php#L150)).
- Generation: repository code accumulates a free-form error string after writes,
  but lacks a reliable shortage rollback state
  ([Exam.php](../../../../Classes/Exam.php#L203)). Target failure is atomic.
- Endpoint unauthenticated behavior is often empty or unstructured rather than a
  defined error response (for example
  [getReports.php](../../../../PHPScripts/admin/getReports.php#L30)).

## Runtime-unavailable transitions

The catalog does not establish page rendering, animation timing, popup behavior,
download race reproduction, database result ordering, random outcome frequency,
or production reachability. Those transitions are documented only as static
code paths. There was no live screenshot or request/response capture.
