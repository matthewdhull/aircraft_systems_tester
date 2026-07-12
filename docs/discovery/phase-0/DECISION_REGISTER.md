# Phase 0 Decision Register

## Purpose and status vocabulary

This register consolidates schema-, scope-, behavior-, security-, and
operations-affecting decisions from the four Phase 0 reports. It contains no
production values or personal/assessment records.

- **Approved — owner:** product intent was approved in the July 12 interview and
  is recorded in [OWNER_DECISIONS.md](OWNER_DECISIONS.md).
- **Approved policy; later validation:** intent is settled, with implementation
  or characterization checks assigned to a later phase.

Priority `P0` materially blocks target schema or Phase 1 preservation scope;
`P1` blocks domain characterization/design; `P2` is required before later
implementation or retirement.

## Decision status

| ID | Priority | Domain | Approved decision or remaining question | Status / evidence needed | Accountable owner | Blocks |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | P0 | Production source | The newest checked-in 2014 production export is the authoritative available migration source; no live system exists. | **Approved — owner; artifact checksum verified.** | Matthew Hull | Importer reconciliation |
| D-002 | P0 | Curriculum | Phase → Task → Subtask → Element is authoritative for future data; fully migrate legacy TPO/SPO/EO labels and only reviewed mappings. | **Approved — owner.** | Matthew Hull | Importer mapping rules defined |
| D-003 | P0 | Workflow scope | No workflows are active today. Include approved primary/task-modeling replacement scope; exclude orphan/WIP/prototype/auxiliary features unless scope changes. | **Approved — owner.** | Matthew Hull | None for Phase 0 |
| D-004 | P0 | Model lineage | Fully stage both legacy template tables, version/retire reconciled templates, and quarantine ambiguous lineage without guessing. | **Approved — owner.** | Matthew Hull | Importer reconciliation |
| D-005 | P0 | Question contract | Fully migrate questions; support all five types with validation; quarantine malformed/unknown records; remove accidental MC all/none distractors. | **Approved — owner.** | Matthew Hull | Importer validation |
| D-006 | P0 | Historical snapshots | Do not migrate identifiable generated histories; recover only unique orphan question content into restricted quarantine. New generated exams are immutable snapshots. | **Approved — owner.** | Matthew Hull | Importer/content review |
| D-007 | P0 | Attempt identity | Do not import legacy attempts individually; retain privacy-safe aggregates only. New attempts follow the approved start/resume/retake model. | **Approved — owner.** | Matthew Hull | Aggregate importer + future tests |
| D-008 | P0 | Scoring/outcome | Equal weight, actual valid snapshot count denominator, stored counts/percentage, satisfactory at ≥80.00%; deadline submits unanswered as incorrect. | **Approved — owner.** | Matthew Hull | Characterization cases |
| D-009 | P0 | Corrections/ejection | Append audited invalidation; remove item from affected denominators, recompute, and preserve original/corrected values. | **Approved — owner.** | Matthew Hull | Correction schema/tests |
| D-010 | P0 | Data governance | Legacy personal assessment/access/account data is expired and excluded; import only aggregates with groups ≥5. New data follows seven-year/one-year/24-hour retention. | **Approved — owner.** | Matthew Hull | Aggregate importer |
| D-011 | P0 | Identity | Do not import legacy people/accounts. New people use UUIDs and unique audited string employee identifiers. | **Approved — owner.** | Matthew Hull | New-account onboarding |
| D-012 | P0 | Historical anomalies | Import valid curriculum/question/template data; quarantine content anomalies; suppress/omit unreliable aggregate dimensions; never guess repairs. | **Approved — owner.** | Matthew Hull | Import reconciliation |
| D-013 | P0 | SQLite feasibility | Initial system runs locally as one writable Node instance on local persistent storage; production hosting is deferred. | **Approved — owner; performance validation deferred to hardening.** | Matthew Hull | Later load validation |
| D-014 | P0 | Hosting/concurrency | Current hosting/workload is none. Future estimate is 16–18 concurrent students, with exams every one to two weeks. | **Approved planning estimate, not telemetry.** | Matthew Hull | Later load-test sizing |
| D-015 | P0 | Backups/recovery | Use manual operator snapshots for this stage; scheduled automation is post-migration. The recovery risk is explicitly accepted. | **Approved exception — owner.** | Matthew Hull | Snapshot procedure before new irreplaceable data |
| D-016 | P0 | Credentials/repository | All legacy credentials are attested revoked; restrict the sole known repository copy and execute the approved archive/history-remediation policy. | **Approved/attested — owner.** | Matthew Hull | Later repository remediation |
| D-017 | P1 | Access/override/resume | Roster + class code; one-hour start window; template-defined duration; autosaved full resume; single-use audited recovery; audited extensions. | **Approved — owner; future characterization required.** | Matthew Hull | Phase 1 golden cases |
| D-018 | P1 | Generation | Fail atomically on exact-count/mandatory shortages; secure seeded recorded randomness; shared content with per-attempt order. | **Approved — owner; source inventory informs future tests.** | Matthew Hull | Generator contract/tests |
| D-019 | P1 | Authorization | Multi-role Administrator/Instructor/Question Author/Curriculum Manager/Report Viewer model; owned instructor scope and explicitly permissioned/audited privileged actions. | **Approved — owner.** | Matthew Hull | Future route permission tests |
| D-020 | P1 | Reports/exports | Require student/class/curriculum/history/organization reports, printable exams, and audited CSV; instructors see assigned scope. Legacy history is aggregate-only. | **Approved — owner.** | Matthew Hull | Future golden reports |
| D-021 | P1 | Retraining/curriculum metadata | Retraining is instructor-assigned and linked; vocabularies are effective-dated admin lists with allowed combinations. | **Approved — owner; source values require import review.** | Matthew Hull | Import/value reconciliation |
| D-022 | P1 | Authentication/session | Force password reset to Argon2id; 30-minute idle/12-hour absolute sessions, secure cookies, rotation, rate limiting, revocation, and audit. | **Approved — owner; no legacy accounts imported.** | Matthew Hull | Future auth tests |
| D-023 | P1 | Correction to proficiency | Required persisted review in an instructor-opened remediation session; original score/outcome unchanged; waiver audited. | **Approved — owner.** | Matthew Hull | Exam workflow/tests |
| D-024 | P2 | Auxiliary scope | Exclude FAQ, mail, offline analysis, schema/demo/WIP/prototype artifacts unless a signed scope change adds them. | **Approved — owner.** | Matthew Hull | None for current scope |
| D-025 | P1 | Rosters/content governance | Staff entry + validated CSV rosters; question draft/review/publish with distinct reviewer. | **Approved — owner.** | Matthew Hull | Workflow characterization/tests |

## Resolution requirements

A decision is formally closed only when it records:

1. the named accountable owner (not only a team);
2. the evidence reviewed and its protected location;
3. the chosen rule/disposition and rejected alternatives;
4. effective date and treatment of historical records;
5. affected schema/workflow/report/security contracts;
6. required Phase 1 characterization or fixture cases; and
7. explicit sign-off date.

The July 12 decisions are approved by Matthew Hull, original developer and
product decision authority. Phase 0 rows are closed; later-phase validation
items are stated in their respective rows.
Apparent bugs, repository filename recency, or historical dump behavior are not
sufficient closure evidence.
