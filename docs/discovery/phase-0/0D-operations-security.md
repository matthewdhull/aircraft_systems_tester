# Phase 0D — Operations and Security Discovery

## Scope, evidence, and handling

This repository-only review covers deployment, dependencies, credentials,
sessions, authentication, authorization, backups, sensitive artifacts, logging,
exports, and the target SQLite hosting constraints. It did not connect to a
deployed application, production database, hosting provider, mail provider, or
backup system. Credential values, personal records, question/answer content,
and exam access codes are intentionally omitted.

Evidence labels used below:

- **Confirmed (repository):** directly supported by the current branch.
- **Inferred risk:** a security or operational consequence of repository
  behavior; live configuration could affect severity.
- **External dependency:** requires owner, hosting, or live-system evidence.

The working tree was clean at the start of Phase 0, and this report is the only
file owned by tranche 0D.

## Executive findings

1. **Confirmed (repository): critical secrets-management exposure.** Database
   connection settings and an external-service API credential are embedded in
   tracked PHP source. Values are not repeated here. Historical dumps also
   contain credential-like, identity, answer-key, and exam-access fields. Treat
   all repository-era credentials as compromised until rotation is verified.
2. **Confirmed (repository): authentication is legacy and unsafe.** Instructor
   passwords are selected from the database and compared directly with request
   text. The login identifier is concatenated into SQL. No password hashing,
   session-ID rotation, rate limiting, or explicit secure-cookie setup appears
   in repository code.
3. **Confirmed (repository): server-side authorization is incomplete.** Most
   `PHPScripts/` endpoints do not reference sessions, while browser pages use a
   login response mainly to show or hide UI. The reporting dispatcher requires
   only a logged-in name for operations that include instructor administration
   and question ejection; it does not enforce the session's administrator flag.
4. **Confirmed (repository): sensitive exports use shared predictable files.**
   CSV reports containing student/test information are written to fixed paths
   under the web application before download. This creates confidentiality,
   stale-file, and concurrent-request hazards.
5. **Confirmed (repository): deployment and recovery are not reproducible from
   this branch.** A one-line legacy Apache/Heroku-style process declaration is
   present, but runtime version, build pipeline, environment configuration,
   health checks, monitoring, backup automation, and restore procedures are
   absent. The application entry point instead redirects to a separately hosted
   HTTPS URL, so the active hosting topology is unresolved.
6. **External dependency:** current hosting, concurrency, database topology,
   backup/restore evidence, access-control practices, retention, incident
   response, and active credential status cannot be established without
   operational access or owner confirmation.

## Deployment and dependency inventory

| Area | Repository evidence | Finding / disposition |
| --- | --- | --- |
| Process declaration | [`Procfile:1`](../../../Procfile#L1) invokes a legacy PHP/Apache launcher. | **Confirmed.** It does not pin PHP, Apache, or operating-system versions. Whether it describes the active deployment is an **external dependency**. |
| Entry point | [`index.php:2`](../../../index.php#L2) redirects to an external HTTPS instructor page. | **Confirmed.** The redirect host and the `Procfile` suggest competing or historical hosting evidence. DNS, TLS, redirect routing, and the actual production document root require live operational confirmation. |
| Root dependency manifest | [`composer.json`](../../../composer.json) is empty. | **Confirmed.** A clean root install is not defined by this manifest. |
| Nested dependency manifest | [`Classes/composer.json:2`](../../../Classes/composer.json#L2) requires an old Mailgun SDK range; [`Classes/composer.lock:9`](../../../Classes/composer.lock#L9) locks a 2013-era HTTP client dependency. | **Confirmed.** Supported PHP versions, vulnerability status, and whether this mail path is active require controlled dependency and runtime review. No network audit was performed in Phase 0. |
| Vendored tooling | Tracked Composer PHAR files exist at the repository root and under `Classes/`. | **Confirmed.** Their provenance/signatures and actual deployment use are not documented. |
| CI/release definition | No workflow, container, runtime-version, web-server configuration, or release script was found. | **Confirmed for this branch.** Current build/deploy steps and rollback ownership are **external dependencies**. |
| Health and observability | No health/readiness endpoint, metrics integration, or structured logging configuration was found. | **Confirmed for this branch.** Provider-level monitoring may exist and must be inventoried externally. |

The code depends extensively on the removed PHP `mysql_*` interface, for
example [`PHPScripts/admin/instructorLogin.php:32`](../../../PHPScripts/admin/instructorLogin.php#L32).
That constrains the legacy runtime to an obsolete compatibility environment or
an undocumented shim. The exact production PHP/MySQL versions are unknown.

## Credential handling and sensitive repository contents

### Confirmed credential-handling findings

- [`Classes/XJTestDBConnect.php:4`](../../../Classes/XJTestDBConnect.php#L4)
  stores active-looking database connection variables in source and includes a
  second commented connection block at
  [`Classes/XJTestDBConnect.php:12`](../../../Classes/XJTestDBConnect.php#L12).
  No values are reproduced here.
- [`Classes/mailer.php:9`](../../../Classes/mailer.php#L9) instantiates an
  external mail client with an inline API credential. The same file contains
  hard-coded messaging identities. No values are reproduced here.
- [`.gitignore:15`](../../../.gitignore#L15) ignores `.env`, but the runtime code
  does not retrieve the observed database/mail settings from environment
  variables.
- [`PHPScripts/admin/instructorLogin.php:39`](../../../PHPScripts/admin/instructorLogin.php#L39)
  selects the stored instructor password, and lines 57–59 compare it directly
  with submitted text. This is evidence of reversible/plaintext-equivalent
  handling in the legacy path, not evidence of a secure password verifier.

### Confirmed sensitive artifact classes

The tracked repository contains 26 SQL dumps (approximately 78 MB in this
checkout), CSV exports, spreadsheets, Word documents, PDFs, and database-schema
documents. Without reproducing records, repository structure and schema show
that these artifacts can include:

- instructor and student identifiers and names;
- instructor authentication fields;
- curriculum and question-bank content, including answer material;
- generated-exam access and override data;
- login-attempt, grading, score, outcome, and retraining history; and
- operational database metadata.

Examples of tracked artifact locations include [`backups/`](../../../backups/),
[`downloadables/`](../../../downloadables/), and the root-level workbook and
document files. [`.gitignore:8-15`](../../../.gitignore#L8) now ignores several
of these extensions, but already tracked files remain in the repository and
history.

**Inferred risk:** access to this repository may grant access to secrets,
personal data, assessment content, or reusable access material even if the
live application is unavailable. Repository access review, credential rotation,
data-owner notification, and a history-remediation decision should precede
broad migration-team access. Destructive history rewriting is not performed or
recommended without a separately approved coordination plan.

## Sessions and authentication

### Confirmed behavior

- Instructor sessions are started in the login endpoint and selected pages;
  identity, employee identifier, instructor identifier, and an `admin` boolean
  are stored in PHP session variables
  ([`PHPScripts/admin/instructorLogin.php:3-18`](../../../PHPScripts/admin/instructorLogin.php#L3),
  [`PHPScripts/admin/instructorLogin.php:60-69`](../../../PHPScripts/admin/instructorLogin.php#L60)).
- Login uses a request-supplied employee identifier in concatenated SQL
  ([`PHPScripts/admin/instructorLogin.php:7-8`](../../../PHPScripts/admin/instructorLogin.php#L7),
  [`PHPScripts/admin/instructorLogin.php:39`](../../../PHPScripts/admin/instructorLogin.php#L39)).
  SQL injection and database-error disclosure are therefore direct code-level
  risks.
- Login failures distinguish a missing instructor from an incorrect password
  ([`PHPScripts/admin/instructorLogin.php:46-49`](../../../PHPScripts/admin/instructorLogin.php#L46),
  [`PHPScripts/admin/instructorLogin.php:78-81`](../../../PHPScripts/admin/instructorLogin.php#L78)),
  enabling account enumeration.
- Logout only unsets selected variables
  ([`PHPScripts/admin/instructorLogout.php:6-12`](../../../PHPScripts/admin/instructorLogout.php#L6));
  repository code does not destroy the session or expire its cookie.
- No repository PHP code was found calling `session_regenerate_id`,
  `session_destroy`, `session_set_cookie_params`, or explicitly setting
  `Secure`, `HttpOnly`, or `SameSite` cookie attributes. No CSRF-token mechanism
  was found.

### External session facts

The PHP/hosting configuration may impose cookie attributes, timeouts, storage,
garbage collection, or TLS controls outside the repository. Obtain the live
session configuration before treating those controls as absent. Required facts
include idle/absolute timeout, fixation protection, cookie domain/path,
`Secure`/`HttpOnly`/`SameSite`, server-side session store, logout invalidation,
and session behavior across multiple web workers.

## Authorization and endpoint exposure

### Confirmed behavior

- Of 38 PHP files under `PHPScripts/`, only the three files under
  `PHPScripts/admin/` reference a session. The remaining 35 include read and
  mutating endpoints for curriculum, questions, test models, exam generation,
  retrieval, and grading. A route-by-route disposition belongs in the 0B
  inventory, but the absence of server-side session checks is confirmed.
- Question/test/admin pages call the login endpoint and alter browser visibility,
  for example
  [`questionCRUD_taskModeling.php:42-51`](../../../questionCRUD_taskModeling.php#L42)
  and [`testModeling_taskModeling.php:82-95`](../../../testModeling_taskModeling.php#L82).
  Client-side visibility is not an authorization boundary.
- The reports dispatcher checks only `isset($_SESSION['name'])`
  ([`PHPScripts/admin/getReports.php:30`](../../../PHPScripts/admin/getReports.php#L30)).
  Within that block it exposes instructor listing/edit/delete and question
  ejection operations
  ([`PHPScripts/admin/getReports.php:49-68`](../../../PHPScripts/admin/getReports.php#L49)).
  It does not check `$_SESSION['admin']`.
- A request-supplied `admin` value is passed into student-report logic
  ([`PHPScripts/admin/getReports.php:18`](../../../PHPScripts/admin/getReports.php#L18),
  [`PHPScripts/admin/getReports.php:41-43`](../../../PHPScripts/admin/getReports.php#L41)).
  Server trust in this client value is a suspected privilege-bypass defect, not
  an intended rule.
- SQL construction throughout the reviewed login/report/data paths concatenates
  request values. Error paths frequently return SQL statements and database
  errors to the HTTP client, for example
  [`PHPScripts/admin/instructorLogin.php:39-43`](../../../PHPScripts/admin/instructorLogin.php#L39).

### Controls requiring external confirmation

Reverse-proxy rules, network allowlists, HTTP basic authentication, VPN access,
web-server path restrictions, and provider access controls could reduce
exposure. None is evidenced in this branch. Obtain the effective production
route map and access logs rather than assuming every repository PHP file is
internet-accessible.

## Backups, recovery, retention, and auditability

### Confirmed repository evidence

- [`backups/`](../../../backups/) holds 26 dated SQL dumps spanning file names
  from 2011 through 2014. They demonstrate historical manual exports, not a
  current backup system.
- No scheduled backup job, encryption configuration, off-host replication,
  retention policy, integrity-check job, restore script, recovery runbook, or
  restore-test evidence was found.
- The repository contains no application audit-event model. Database failures
  are commonly emitted with `die`/`echo`; a single query path uses PHP
  `error_log` at [`Classes/eo_analysis.php:66`](../../../Classes/eo_analysis.php#L66).
  No consistent redaction, correlation identifier, severity, actor, event, or
  retention scheme is evident.

### External dependencies

Obtain the current database backup schedule, responsible owner, storage
location, encryption and key ownership, access list, immutable/off-site copy,
retention/deletion schedule, most recent successful job, most recent verified
restore, recovery point objective (RPO), recovery time objective (RTO), and
incident/restore escalation process. Historical files must not be accepted as
proof of recoverability.

Retention requirements are unresolved for source dumps, generated exams,
student attempts, scores, authentication records, logs, CSV exports, and
repository history. The data owner must define legal/organizational retention,
correction, deletion, and litigation-hold obligations.

## Logging and exports

### Logging

- Many failures return raw query text and MySQL errors to the caller; examples
  include the login path above and exam retrieval at
  [`Classes/Exam.php:290-322`](../../../Classes/Exam.php#L290). Query text can
  contain submitted identifiers, exam credentials, or other sensitive fields.
- Browser code contains active and commented `console.log` statements. Some
  adjacent code handles generated passwords and results, so browser-console
  logging must be reviewed before any preservation capture.
- No audit record is evident for instructor login/logout, role changes,
  instructor administration, question/model changes, exam generation,
  overrides, grading, corrections, exports, or destructive actions.

### Exports

- Cumulative score export requires a named session but does not require the
  session administrator flag. It writes all rows to a fixed
  `downloadables/testStatistics.csv` and then serves that file
  ([`downloadables/download.php:6-23`](../../../downloadables/download.php#L6)).
- Quarterly analysis is a two-request make/download flow using a shared fixed
  `downloadables/quarterlySPO.csv`
  ([`downloadables/downloadQuarterlySPO.php:15-34`](../../../downloadables/downloadQuarterlySPO.php#L15)).
- **Inferred risk:** simultaneous users can overwrite or receive another
  request's export, and generated files can persist in the web tree. File-system
  permissions, direct static-file accessibility, cleanup, and proxy caching are
  **external dependencies**.

Target behavior should stream per-request exports from authorized server code,
apply formula-injection defenses for spreadsheet consumers, set no-store and
safe content-disposition headers, audit export scope, and avoid persistent
shared filenames.

## SQLite hosting constraints and operational fit

There is no SQLite implementation or deployment configuration outside the
migration plan in this branch. The target is therefore conditional, not yet
operationally approved.

The plan requires one writable Node application instance with local persistent
storage ([`MIGRATION_PLAN.md:254-258`](../../../MIGRATION_PLAN.md#L254)), verified
foreign keys, WAL, a busy timeout, and a reviewed synchronous mode
([`MIGRATION_PLAN.md:260-266`](../../../MIGRATION_PLAN.md#L260)). It prohibits a
general network filesystem and multiple independent writable hosts, and
requires online backups, encrypted off-host copies, integrity checks, and
restore tests ([`MIGRATION_PLAN.md:267-276`](../../../MIGRATION_PLAN.md#L267)).

Before SQLite is approved, operations must confirm:

1. the hosting product supplies durable local/block storage that survives
   deploys, restarts, host replacement, and scaling events;
2. exactly one writable application instance is enforced, including during
   deploy overlap, health replacement, rollback, and operator intervention;
3. expected peak concurrent exams, autosaves, grading submissions, report
   reads, question editing, and scheduled jobs fit the single-writer model;
4. the driver/runtime and filesystem support WAL locking and online backup;
5. backup snapshots are coordinated correctly with WAL and copied encrypted to
   a distinct failure domain;
6. disk-full, I/O error, corruption, lock contention, and failed-backup alerts
   have owners and tested responses;
7. RPO/RTO and maintenance windows are compatible with restore and integrity
   check durations; and
8. staging reproduces the production storage semantics closely enough for
   contention and restore rehearsal.

If the host is ephemeral-only, forces multi-instance writes, or uses an
unsupported network filesystem, the proposed SQLite operating model is blocked
and the deployment architecture or database choice must change before Phase 3
schema approval.

## Prioritized operational/security decisions

| Priority | Decision / evidence needed | Why it blocks later work |
| --- | --- | --- |
| P0 | Confirm all exposed repository-era database, mail, hosting, and administrator credentials have been revoked/rotated; identify the incident owner. | Safe repository use and any controlled live discovery depend on it. |
| P0 | Identify the actual production host, runtime versions, document root, database host/topology, TLS termination, network restrictions, and deployment owner. | Determines the safe access method, active-route exposure, and whether the legacy system can be preserved. |
| P0 | Provide current backup job evidence and conduct/produce evidence of a restore test without sharing production data into ordinary development. | Live discovery and migration cannot safely proceed without recoverability. |
| P0 | Approve data classification and handling for PII, authentication data, assessment content, answers, exam codes, scores, exports, and dumps. | Controls live export, fixture sanitization, access, storage, and Phase 1 capture. |
| P0 | Decide whether SQLite's single-writable-instance/local-durable-storage constraints match the production hosting model. | Materially changes the target deployment and possibly the target schema/import plan. |
| P1 | Define instructor roles and server-side permission matrix for every active route/action/export. | Required for target authorization boundaries and route disposition. |
| P1 | Define retention, correction, deletion, audit, and legal-hold requirements by data class. | Affects schema, importer scope, logging, backups, and retirement. |
| P1 | Define session lifetime, concurrent-session, lockout/rate-limit, reset, forced password migration, and emergency-access policies. | Required for Phase 4 authentication design. |
| P1 | Establish expected peak concurrency and representative workload measurements. | Required to validate SQLite and size hosting/load tests. |
| P2 | Decide repository/history remediation, access restrictions, and destruction of obsolete local/export copies. | Reduces ongoing exposure but requires coordinated ownership. |

## Initial 0D status before owner attestation

### Complete from repository evidence

- Deployment and dependency artifacts present in the branch are inventoried.
- Repository credential-handling patterns are documented without values.
- Session, authentication, authorization, export, error-reporting, and logging
  behavior is documented at code level.
- Sensitive repository artifact classes and historical backup files are
  identified without inspecting or reproducing personal/assessment records.
- SQLite's required hosting and backup constraints are enumerated.

### Blocked on external evidence or owner decisions

- Current production hosting/runtime/network/TLS topology and active route map.
- Actual user concurrency and workload profile.
- Provider and operator access controls, privileged accounts, and credential
  rotation status.
- Current backup automation, encryption, retention, restore proof, RPO, and RTO.
- Logging/monitoring outside the repository and incident-response ownership.
- Data classification, retention, correction/deletion, and repository-history
  remediation decisions.
- Confirmation that production hosting satisfies the proposed SQLite operating
  model.

Because these facts remain unresolved, tranche 0D repository discovery is
complete, but Phase 0's hosting/concurrency, data-classification/retention, and
signed-off-scope deliverables are not yet accepted.

## Owner decision addendum — July 12, 2026

The product/security baseline in [OWNER_DECISIONS.md](OWNER_DECISIONS.md)
resolves several policy questions but not operational facts:

- Do not import legacy staff passwords. Require Argon2id reset, 30-minute idle
  and 12-hour absolute sessions, secure cookies, session rotation, rate limiting,
  audited revocation, and security audit events.
- Use granular server-enforced roles and explicitly permission/audit broad
  reports, exports, answer keys, corrections, instructor administration, and
  destructive operations.
- Verify rotation/revocation of repository-era credentials, restrict access,
  preserve only any required protected archive, then coordinate history purge
  and destruction of obsolete copies.
- Target exactly one writable Node instance on durable local/block storage for
  SQLite. Live storage, WAL/locking, deployment overlap, and workload feasibility
  remain unverified.
- Retain assessment records seven years, security events one year, and exports
  no more than 24 hours, subject to legal holds and validated enforcement.
- The owner deferred scheduled backup automation until after migration and
  selected operator-triggered manual snapshots only for this stage. This accepts
  an operator-dependent, potentially unbounded recovery point. It is an explicit
  exception to the stronger migration-plan backup/restore posture and requires
  formal operational risk acceptance.

Matthew Hull subsequently confirmed that the legacy application/database are
fully offline, all legacy credentials are revoked, and he holds the sole known
repository copy. Initial replacement use is local-only; expected future load is
an estimated 16–18 students every one to two weeks. He explicitly accepts the
manual-snapshot recovery exception. Production hosting, local load validation,
and a repeatable snapshot procedure are deferred implementation/operations work,
so no current operational fact remains a Phase 0 blocker.
