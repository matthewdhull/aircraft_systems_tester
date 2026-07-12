# Phase 0 Live Access Checklist

## Closure status

**Retired as not applicable on July 12, 2026.** Matthew Hull confirmed the
application and database are completely shut down and no live system exists.
Do not attempt any production connection. The newest 2014 export is the
authoritative available migration source; use
[SOURCE_EXPORT_DISPOSITION.md](SOURCE_EXPORT_DISPOSITION.md) instead.

Sections A–F are retained only to document what would have been required if a
live system existed. Section G is deferred local/future-host validation and does
not block Phase 0. Section H is superseded by the accepted status in
[PHASE_0_SUMMARY.md](PHASE_0_SUMMARY.md).

## Purpose

This checklist defines the controlled evidence needed to close repository-only
Phase 0 gaps. It is a preparation document, not authorization to access
production. Do not connect or use credentials until the system/data owner
explicitly approves the scope, account, time window, people, and output handling.

Never place credential values, personal records, question/answer content, exam
access/override codes, or unsanitized exports in this repository, issue/PR text,
terminal transcripts, screenshots, or ordinary development storage.

Product intent is already recorded in
[OWNER_DECISIONS.md](OWNER_DECISIONS.md). Live discovery must validate and map
production facts against those decisions; it must not reopen them silently.

## A. Authorization and safety prerequisites

- [ ] Name the production system, database, hosting account, and accountable
  system/data/operations owners.
- [ ] Record written authorization for read-only discovery, approved operators,
  time window, source IP/network path, and exact evidence categories.
- [ ] Use a newly issued least-privilege read-only database account; do not reuse
  credentials found in source or history.
- [ ] Verify repository-era database, mail, hosting, and administrator secrets
  have been revoked/rotated without recording their values here.
- [ ] Confirm no query, export, lock, cache flush, backup action, or web request
  used for discovery can write to production or materially affect classroom use.
- [ ] Approve an encrypted, access-controlled evidence location outside this
  repository, with named readers and deletion date.
- [ ] Approve aggregate-only/redacted output formats and a reviewer who checks
  every artifact before it enters migration documentation.
- [ ] Confirm current backup state and escalation contacts before running a
  potentially expensive metadata/count query; if no verified backup exists,
  obtain explicit risk acceptance before proceeding.
- [ ] Schedule around exams and define immediate stop conditions for latency,
  locks, errors, unexpected sensitive output, or scope mismatch.

## B. Authoritative database structure

- [ ] Record database product/version, SQL mode, server/session timezone, default
  charset/collation, storage topology, and replication/read-replica status.
- [ ] Export schema-only DDL for every table, view, trigger, routine, event, and
  generated object. Review/redact definer names or infrastructure identifiers.
- [ ] Inventory table/column types, nullability, defaults, generated columns,
  engines, charsets/collations, primary/unique/foreign keys, indexes, and
  auto-increment behavior.
- [ ] Confirm whether `Phase`, `Task`, `Subtask`, `Element`, `blooms_taxonomy`,
  question `subtask_id`/`element_id`, and submitted-answer result fields exist.
- [ ] Resolve the live shapes and key types for `test_model`, `testModel`,
  `createdTests.testModelID`, `usedQuestions`, and `testResults`.
- [ ] Compare the schema fingerprint with the 2014 dump and current PHP
  expectations; record additions, removals, type/order changes, and repurposed
  columns without including row values.
- [ ] Identify which application revision/process writes each live table.

Expected safe artifact: a reviewed schema-only export plus a table/column/index
inventory. It must not contain credentials, DEFINER secrets, row inserts, or
record samples.

## C. Aggregate data profile and volumes

- [ ] Capture exact or owner-approved estimated row counts and storage sizes for
  every production table.
- [ ] Capture min/max identifiers and timestamps, null/empty/zero counts, maximum
  string lengths, boolean/enum/range distributions, and write/change rates as
  aggregates only.
- [ ] Profile question-type codes/counts and invalid type-shape counts without
  outputting prompts, answers, or choices.
- [ ] Profile curriculum node counts, depth, parent mismatches, duplicate natural
  keys, ordering/numbering anomalies, and legacy/task-hierarchy mapping coverage.
- [ ] Profile models by type/lineage, configured length versus component sum,
  mandatory-element count, insufficient-question inventory, and generated
  snapshot count mismatch.
- [ ] Profile generated headers, snapshots, logins, attempt summaries, and
  per-question results by date range and relationship completeness.
- [ ] Count orphan/duplicate header-snapshot-result-attempt relationships,
  duplicate submissions, invalid score/outcome combinations, corrections/
  ejections, and missing source questions as aggregates.
- [ ] Profile identifier uniqueness, width, leading-zero presence, and cross-table
  mapping success without emitting identifiers or names.
- [ ] Validate encodings/invalid-byte counts and conversion risk using approved
  technical checks; do not extract readable content.

Expected safe artifact: aggregate tables with query definitions/version hashes,
execution timestamps, database snapshot position if available, and suppression
of small cells where re-identification is possible.

## D. Production workflow and route evidence

- [ ] Identify deployed application revision(s), document root, base URL(s), and
  effective route configuration.
- [ ] Produce a sanitized URL/access-log inventory showing route and aggregate
  frequency only; strip query strings, bodies, cookies, IPs, identifiers, and
  access codes.
- [ ] Conduct an owner-led walkthrough of instructor login/dashboard,
  administration, curriculum, question authoring, test-model authoring,
  generation, student access/re-entry, delivery, grading, correction, reporting,
  printing, and export.
- [ ] Determine which older, `_taskModeling`, embedded, WIP, prototype, dormant,
  and auxiliary pages are active, externally linked, or obsolete.
- [ ] Assign a named owner and disposition to every observed production route and
  workflow, including routes not present in Git.
- [ ] Record validation/failure states and role boundaries without capturing
  personal data, answers, test codes, or reusable sessions.
- [ ] Confirm whether generated-test history, daily/predefined tests, instructor
  preview, forced correction, ejection, FAQ, mail, and offline reports are used.

Expected safe artifact: route/workflow/disposition matrix and owner notes. Phase
1 screenshots or request/response captures are out of scope until data-handling
controls and sanitized fixtures are approved.

## E. Hosting, concurrency, and security configuration

- [ ] Record current/target provider, region, runtime/PHP/MySQL versions, process
  count, deployment overlap behavior, load balancer/proxy, TLS termination,
  network allowlists/VPN, persistent storage, filesystem type, and scaling rules.
- [ ] Record peak/typical concurrent students, instructors, exam starts,
  generations, submissions, grading writes, report reads, administrative writes,
  and scheduled jobs using aggregate telemetry.
- [ ] Inventory effective session cookie flags, idle/absolute timeout, session
  store, ID rotation, logout invalidation, worker sharing, and cleanup behavior.
- [ ] Inventory server/proxy authorization controls, exposed PHP paths, CORS,
  CSRF protections, rate limits, WAF/basic-auth/VPN controls, and privileged
  access paths.
- [ ] Inventory logs/metrics/alerts, sensitive-field redaction, retention,
  incident contacts, and auditability for security- and assessment-sensitive
  actions.
- [ ] Confirm export directories' direct web accessibility, permissions,
  persistence, cleanup, concurrency behavior, and caching without downloading
  an existing production export.
- [ ] Identify all active service accounts/API integrations and confirm secret
  storage/rotation status without recording values.

## F. Backup, recovery exception, and retention evidence

- [ ] Document current database/export backup method and consistency guarantees,
  especially whether MyISAM writes are quiesced for a coherent snapshot.
- [ ] Record schedule, most recent success, monitoring, responsible owner,
  encryption/key ownership, access list, immutable/off-site copy, failure domain,
  retention, and secure destruction.
- [ ] Provide the date/result/duration of the most recent restore test in an
  isolated environment; do not restore production data into ordinary developer
  storage.
- [ ] Record formal operations acceptance or rejection of the owner-selected
  manual-snapshot-only stage, including its operator-dependent recovery point,
  snapshot procedure/owner, maintenance-window expectations, corruption
  response, and restore escalation.
- [ ] Validate the approved retention baseline—seven-year assessment detail,
  one-year security events, 24-hour exports, deletion of personal detail at
  expiry, anonymous aggregates retained—against legal holds and operational
  enforcement.

## G. SQLite target feasibility

- [ ] Prove the target host supplies durable local/block storage across deploys,
  restarts, replacement, rollback, and operator error.
- [ ] Prove exactly one writable Node instance is enforced during normal service,
  rolling deployment, health replacement, scaling, and rollback.
- [ ] Confirm the filesystem/driver supports SQLite locking, WAL, busy timeout,
  consistent operator-triggered snapshots, integrity checks, and the chosen
  durability setting.
- [ ] Confirm measured workload fits short single-writer transactions and define
  contention/load-test thresholds.
- [ ] Document how a manual snapshot is made consistent with WAL and where it is
  stored; assign alerts for lock contention, I/O errors, disk full, corruption,
  and failed snapshot. Scheduled automation remains deferred until after
  migration unless operations rejects the exception.
- [ ] If any condition fails, record SQLite as blocked and choose a different
  hosting topology or database before target-schema approval.

## H. Evidence review and Phase 0 closure

- [ ] Security/data reviewer confirms all collected artifacts are aggregate,
  redacted, access-controlled, and scheduled for destruction as approved.
- [ ] Database owner signs the authoritative schema/table/count inventory.
- [ ] Application owner signs the active route/workflow/disposition inventory.
- [ ] Record the formal product-owner name and sign-off date for the decisions in
  [OWNER_DECISIONS.md](OWNER_DECISIONS.md) and
  [DECISION_REGISTER.md](DECISION_REGISTER.md).
- [ ] Data/security/operations owners approve classification, retention,
  credential remediation, manual-snapshot exception, hosting, concurrency, and
  SQLite fit.
- [ ] Coordinator updates [PHASE_0_SUMMARY.md](PHASE_0_SUMMARY.md) with links to
  protected evidence locations but no sensitive values.
- [ ] Re-run the Phase 0 acceptance gate: every production table/workflow has a
  named owner/disposition, schema drift is understood, and no open question can
  materially change the target schema.
- [ ] Obtain explicit Phase 0 scope sign-off before any Phase 1 work begins.
