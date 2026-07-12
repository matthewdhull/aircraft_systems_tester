# Phase 0 Owner Decisions — July 12, 2026

## Authority and evidence boundary

Matthew Hull, the original developer and product decision authority, approved
application, curriculum, assessment, reporting, identity, and retention intent
for this discovery round. The decision record date is July 12, 2026.

These decisions settle product intent. The application/database are fully shut
down and no live system exists. The newest checked-in 2014 production export is
the authoritative available migration source; see
[SOURCE_EXPORT_DISPOSITION.md](SOURCE_EXPORT_DISPOSITION.md).

## Approved product decisions

### Curriculum, content, and scope

- Phase → Task → Subtask → Element is the authoritative future curriculum.
  Historical records retain their original TPO/SPO/EO labels and any reviewed
  mapping; no mapping may be guessed.
- Migration scope includes the primary dashboard, exam, reporting, and
  task-modeling curriculum/question/template behavior. Orphan, WIP, prototype,
  FAQ, mail, demo, and offline-analysis features are excluded unless a later
  signed scope change supplies an owner and requirement.
- Questions, curriculum nodes, and test templates are versioned. Referenced
  versions may be retired but not hard-deleted.
- Question authoring follows draft → review → publish. A distinct authorized
  reviewer publishes or retires content, and generation uses only effective
  published versions.
- Qualification, syllabus, aircraft variant, and course type use effective-dated
  administrative lists with approved combinations. Live distinct values are
  imported for review rather than copied into fixed constants.

### Questions, models, and generation

- Support all five repository question types: true/false, single-answer multiple
  choice, two-correct compound, all-correct, and none-correct. Enforce explicit
  type-specific server validation and remove the accidental randomized all/none
  distractor behavior from ordinary multiple choice.
- The validation contract is: true/false stores one semantic boolean;
  single-answer multiple choice has one correct and three distinct incorrect
  choices; two-correct compound has two correct and one incorrect A–C choice
  with the compound D choice as the key; all-correct has three correct A–C
  choices with “all” as D/key; none-correct has three incorrect A–C choices with
  “none” as D/key. Normalize stored type codes/casing and reject blank or
  duplicate displayed choices.
- A published exam is an immutable snapshot of selected question versions,
  wording, answer choices, and keys. It remains authoritative even if source
  content later changes or disappears.
- Generation is atomic. If exact category counts or every mandatory element
  cannot be fulfilled, create no exam and return actionable shortages; do not
  silently shorten or substitute.
- Use secure seeded randomization. Record the seed and algorithm version for
  authorized replay without exposing them to students.
- Students using one published exam share selected content and answer layout,
  while each attempt receives and persists a distinct derived question order.
- Authorized instructors may preview an immutable published exam without
  creating a student attempt, login event, score, or reportable result. Preview
  access is server-derived and audited; no client `doNotGrade` flag is trusted.

### Exam access, attempts, and remediation

- Staff create class rosters manually or through validated CSV import. External
  HR/training roster integration is outside initial scope.
- An expiring published-exam code plus roster-validated student identity permits
  access. New starts are allowed for one hour after publication.
- Create one attempt at first authorized start. The test template defines the
  generated exam's allotted duration; the attempt records start/deadline.
  Authorized staff may grant an audited per-attempt extension.
- Full resume restores the same attempt's saved answers, marks, order, position,
  and timing. Recovery authorization is single-use and audited.
- Deadline expiry auto-submits the latest saved state, marks the submission as
  time-expired, and treats unanswered items as incorrect.
- Retakes are separate instructor-authorized attempts linked to the prior
  attempt. Retraining is instructor-assigned and linked to the originating
  attempt or training event. Neither overwrites history.
- Students see numeric score, satisfactory/unsatisfactory outcome, and missed
  items after submission.
- Correction-to-proficiency is required and persisted but occurs in a separate
  instructor-opened remediation session. Completion does not change the
  original score/outcome; an authorized waiver must be audited.

### Scoring and corrections

- Questions are equally weighted. The denominator is the actual count of valid
  items in the immutable published snapshot, not configured model length.
- Store correct count, denominator, and calculated percentage. A score of
  80.00% or higher is satisfactory. Determine pass/fail from exact counts before
  display rounding; display the percentage to two decimal places.
- Invalidating a question creates an append-only, attributable, reason-coded
  correction event. Exclude the item from every affected denominator, recompute
  scores/outcomes, and preserve original and corrected values. Do not copy the
  legacy ejection defects.

### Identity, authorization, and reports

- People use immutable internal UUIDs. Employee identifiers are unique business
  identifiers stored as strings, preserve leading zeros, and may be corrected
  only with audited history.
- Users may hold multiple granular roles: Administrator, Instructor, Question
  Author, Curriculum Manager, and Report Viewer. All permissions are enforced
  server-side.
- Instructors see assigned classes and attempts. Organization-wide reports,
  answer keys, exports, corrections, instructor administration, and destructive
  actions require explicit permission and audit events.
- Required outputs are student, class, curriculum-performance,
  generated-test-history, and organization-wide score reports; printable exam
  views; and audited CSV exports.

Baseline role boundaries:

| Role | Baseline permissions |
| --- | --- |
| Administrator | Manage users, roles, configuration, and all scoped records; administrative actions remain audited and do not bypass the distinct-reviewer rule. |
| Instructor | Manage assigned rosters; publish/start exams from approved templates; authorize recovery, extension, retake, retraining, and remediation; view assigned attempts/reports. |
| Question Author | Create/version drafts, submit for review, and review/publish another author's question when assigned as reviewer; never publish their own authored version. |
| Curriculum Manager | Version/publish/retire curriculum, controlled vocabularies, and test templates; review generation shortages. |
| Report Viewer | View organization-wide approved reports and run audited exports; answer-key access is a separate explicit permission. |

Question-key viewing, correction/invalidation, instructor administration,
organization-wide export, and destructive/retirement actions are explicit
permissions granted to appropriate roles rather than implied by UI visibility.

### Retention, anomalies, authentication, and repository handling

- Retain identity-linked attempts, responses, snapshots, and corrections for
  seven years from attempt completion; retain access/security events for one
  year from occurrence; retain generated exports for no more than 24 hours.
- When seven years expires and no hold applies, delete identity-linked attempts,
  responses, access events, and snapshots. Retain only non-identifying aggregate
  statistics. Referenced curriculum/question versions remain while any retained
  record requires them.
- Import valid history normally. Put orphaned, duplicated, inconsistent, or
  incomplete records in restricted reason-coded quarantine. Never infer repairs;
  approved reconciliation is required before quarantined data affects reports.
- Do not import legacy staff passwords. Require reset into Argon2id. Use
  30-minute idle and 12-hour absolute session limits, secure cookies, session-ID
  rotation, rate limiting, audited revocation, and security audit events.
- Verify rotation/revocation of repository-era credentials, restrict repository
  access, preserve a protected archive only if required, then coordinate history
  rewriting/removal and destruction of obsolete working copies.

## Approved target operating assumptions and explicit exception

- Target SQLite assumes exactly one writable Node instance on durable
  local/block storage with WAL-compatible locking. Initial execution is
  local-only; workload fit will be validated during foundation/hardening and a
  production hosting plan is deferred.
- For this stage, backup automation is deferred until after migration and only
  operator-triggered manual snapshots are required. This accepts an
  operator-dependent, potentially unbounded recovery point and is an explicit
  exception to the stronger backup/restore controls in the migration plan.

Matthew Hull explicitly accepts the manual-snapshot recovery risk for this
stage. Initial execution is local-only; production hosting remains deferred.
The estimated future load is 16–18 concurrent students with an exam every one
to two weeks, and must be treated as an estimate rather than observed telemetry.

All legacy database, mail, hosting, and administrator credentials are attested
revoked. Matthew Hull holds the only known copy of the original repository.

## Deferred implementation verification

- Reproduce the authoritative export's schema/count/anomaly profile as importer
  reconciliation; its readability and checksum are recorded in
  [SOURCE_EXPORT_DISPOSITION.md](SOURCE_EXPORT_DISPOSITION.md).
- Validate local SQLite locking/storage against the estimated classroom workload
  during foundation/hardening; production hosting remains a later decision.
- Document the manual snapshot procedure before irreplaceable new records exist.
- Retain the credential-revocation statement as owner attestation; no unavailable
  live-system proof can be collected after shutdown.

## Required future characterization cases

These are acceptance inputs for Phase 1 after the Phase 0 gate passes; listing
them here does not begin Phase 1:

- Valid and invalid payloads for every question type, including blank/duplicate
  choices, casing normalization, alternate wording, and retired versions.
- Exact-count generation, every mandatory element, shortage rollback, secure
  seed replay, shared snapshot content, and distinct persisted attempt order.
- First start, roster rejection, one-hour start-window boundary, autosave, full
  recovery resume, single-use recovery, extension, deadline auto-submit, and
  duplicate-submit rejection.
- Score cases immediately below/at/above 80%, display rounding that must not
  change pass/fail, unanswered items, and actual snapshot count differing from
  configured length.
- Question invalidation before/after submission, denominator recomputation,
  original/corrected values, idempotency, audit attribution, and report totals.
- Instructor-authorized retake/retraining links, student result visibility,
  instructor-opened remediation, completion, and audited waiver.
- UUID/employee-ID correction and leading zeros; valid import, quarantine,
  reconciliation approval, retention expiry, hold, and anonymous aggregation.
- Role denial/allow cases for assigned versus organization scope, self-publish
  prohibition, answer keys, corrections, administration, printable exams, and
  CSV exports.
