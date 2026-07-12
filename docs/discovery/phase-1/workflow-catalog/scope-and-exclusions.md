# Scope, exclusions, and defect boundary

## Approved synthesis

Phase 0 approves these capabilities for replacement characterization:

- primary instructor dashboard, secure login/logout, and scoped administration;
- task-modeling curriculum, question, and template behavior;
- saved-template exam generation and immutable snapshots;
- student exam access, delivery, grading, persisted remediation, and authorized
  preview;
- student, class, curriculum-performance, generated-test-history, and
  organization-wide reports; printable exams; audited CSV exports.

The authority is
[OWNER_DECISIONS.md](../../phase-0/OWNER_DECISIONS.md), especially
[scope](../../phase-0/OWNER_DECISIONS.md#curriculum-content-and-scope),
[assessment workflows](../../phase-0/OWNER_DECISIONS.md#questions-models-and-generation),
and [roles/reports](../../phase-0/OWNER_DECISIONS.md#identity-authorization-and-reports).

## Excluded surfaces

| Surface | Disposition | Evidence / reason |
| --- | --- | --- |
| `instructorArea_wip.php` | Excluded WIP | Unlinked WIP/prototype; Phase 0 explicitly excludes it. |
| `plus_sign.php`, predefined and daily quiz generation | Excluded prototype | Backend methods are absent and client/backend fields drift; not approved scope ([Phase 0 archaeology](../../phase-0/0B-workflow-archaeology.md#predefined-and-daily-quiz-generation)). |
| `aerodataCRUD.php` | Excluded orphan duplicate | Earlier question authoring with no approved unique workflow. |
| older `questionCRUD.php` UI | Excluded as a target UI | Historical source evidence remains useful, but task behavior is the approved synthesis. |
| older `testModeling.php` and embedded authoring in `testCRUD.php` | Excluded as target authoring UIs | Both source template shapes are migration evidence; exact competing UIs are not requirements. |
| FAQ, mail, offline analysis, demos | Excluded | Phase 0 owner decision; require signed scope change to add. |

Generated-test history is **not excluded**: its dashboard markup is dormant but
Phase 0 explicitly requires the report. Printable exams and audited CSV exports
are likewise required capabilities even though their legacy controls or
implementations are unsafe.

## Suspected defects: negative regression boundary

| Repository behavior | Why it is not a requirement | Evidence |
| --- | --- | --- |
| Client-visible admin flag controls privileged UI; report dispatcher only checks session name | Target permissions are server-enforced and granular | [instructorArea.php](../../../../instructorArea.php#L79), [getReports.php](../../../../PHPScripts/admin/getReports.php#L30) |
| Plaintext comparison and request-interpolated login query | Target uses reset/onboarding, Argon2id, rate limiting, hardened revocable sessions | [instructorLogin.php](../../../../PHPScripts/admin/instructorLogin.php#L39) |
| Task question edit uses `.val()` on a string | Apparent JavaScript error, not intentional state | [questionCRUD_taskModeling.php](../../../../questionCRUD_taskModeling.php#L167) |
| Question endpoint accepts type-shaped fields without explicit server contract | Target rejects blank/duplicate/incompatible choices and normalizes type/casing | [newQuestion.php](../../../../PHPScripts/newQuestion.php#L5) |
| Model total may differ from configured length | Target validates composition before publication/generation | [testModeling_taskModeling.php](../../../../testModeling_taskModeling.php#L221) |
| Short/mandatory-deficient generation can continue | Target creates no exam on shortage | [Exam.php](../../../../Classes/Exam.php#L99) |
| Generated identifier selected by newest timestamp | Concurrent generations can misassociate snapshots; target is transactional | [Exam.php](../../../../Classes/Exam.php#L189) |
| Re-entry loses answers, marks, order, and position | Target full resume is explicit | [Exam.php](../../../../Classes/Exam.php#L340), [examCMS.php](../../../../examCMS.php#L257) |
| Client `doNotGrade` suppresses persistence | Target preview authority is server-derived and audited | [examCMS.php](../../../../examCMS.php#L600), [Exam.php](../../../../Classes/Exam.php#L452) |
| Grading denominator is configured length | Target uses actual valid snapshot count | [Exam.php](../../../../Classes/Exam.php#L462) |
| Correction is client-only | Target remediation is persisted and instructor-opened | [examCMS.php](../../../../examCMS.php#L180) |
| Ejection grants credit/adds score and may update broader rows | Target append-only invalidation changes denominators and preserves originals | [ReportsClass.php](../../../../Classes/ReportsClass.php#L574) |
| CSV uses shared fixed paths | Target export is scoped, audited, isolated, and short-lived | [download.php](../../../../downloadables/download.php#L13), [downloadQuarterlySPO.php](../../../../downloadables/downloadQuarterlySPO.php#L23) |

## Unavailable evidence

The legacy application and database are shut down. Therefore none of the
following is claimed: current production URL, active actor, deployed page
generation, actual browser layout, screenshot, accessibility behavior, live
validation message, HTTP status, endpoint response sample, request trace,
performance, or runtime authorization. Repository code establishes historical
implementation evidence only; owner decisions establish target intent.
