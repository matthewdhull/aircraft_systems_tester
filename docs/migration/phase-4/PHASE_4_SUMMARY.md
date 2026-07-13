# Phase 4 Summary — Authentication and Instructor Administration

## Status

**Phase 4 passes its acceptance gate on branch `auth_inst_admin`.** After owner
authorization, the reviewed work was split into small functionality-based
commits. No push, merge, branch switch, or Phase 5 work has occurred.

## Tranche results

| Tranche                        | Status   | Result                                                                                                                                                                                                                                                                  |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4A — Authentication core       | **Pass** | Native Node 24 Argon2id, enumeration-resistant login, bounded login limiting, digest-only revocable sessions, password initialization/reset, safe bootstrap CLIs, login/logout UI, migration `0006`, and 30 focused tests.                                              |
| 4B — Authorization             | **Pass** | Hook session resolution, minimal principals, 28 granular permissions, five baseline roles, idempotent seeding, effective-grant resolution, guards, cookie policy, security headers, canonical origin validation, navigation presentation, and complete route inventory. |
| 4C — Instructor administration | **Pass** | Permission-guarded list/detail/create/edit/lifecycle/identifier/role workflows, transactional audit and revocation, final-administrator protection, responsive accessible UI, and 25 focused tests.                                                                     |
| 4D — Security and audit        | **Pass** | Bounded rate limiter, allow-listed audit writer, security vocabulary, real hook/cookie/action matrix, CSRF runtime verification, persistence scans, and 53 focused tests.                                                                                               |

## Schema and migration

Phase 4 adds the ordered migration
`drizzle/0006_phase4_authentication.sql`; migrations `0000`–`0005` are
unchanged. It adds one table, `password_action_tokens`, for digest-only,
expiring, single-use initialization/reset actions. The existing `sessions`
table gains revocation-reason and rotation-lineage hash columns with a
revocation consistency check.

The canonical schema now contains 65 application tables: the Phase 3 baseline
of 64 plus the one approved Phase 4 table. A clean database applies seven
migrations and reports zero foreign-key violations, `integrity_check=ok`, and
`quick_check=ok`.

## Dependencies and configuration

No dependency was added or replaced, and `package-lock.json` is unchanged.
Argon2id uses the maintained native implementation in the required Node 24
runtime. `package.json` adds only operator scripts for bootstrap and password
actions.

Production now requires a canonical HTTPS `ORIGIN`; adapter-node uses it for
same-origin mutation enforcement. `APP_ENV=production` also enables the Secure
session-cookie flag. The example environment and `DEVELOPMENT.md` document the
origin, bootstrap/reset commands, session limits, rate-limit operating
constraint, revocation, and prohibited credential/token handling.

## Authentication and sessions

Passwords use Argon2id version 19 with 19,456 KiB memory, two passes,
parallelism two, 16-byte random salts, and 32-byte tags. Successful login
rehashes parameters that differ. All credential/account failures are generic;
unknown, wrong-password, missing-hash, pending, suspended, and retired cases
execute a common external policy. Every submitted login attempt, including
blank input, consumes account and network limits.

Sessions use 32 random bytes and persist only a SHA-256 token digest. They have
a 30-minute idle boundary and 12-hour absolute boundary; activity updates only
last-seen time. Concurrent sessions are allowed. Login rotates a presented
session, logout revokes, lifecycle/password changes revoke all applicable
sessions, and inactive users cannot resolve otherwise valid sessions.

The `ast_session` cookie is path `/`, HttpOnly, SameSite=Lax, capped by the
absolute lifetime, and Secure in production. Raw cookies and action tokens stay
at their one-time request/operator boundary and never enter audit metadata or
logs.

## Roles and permissions

Baseline roles are Administrator, Instructor, Question Author, Curriculum
Manager, and Report Viewer. The canonical vocabulary contains 28 lowercase
dotted permissions. User administration separately enforces `users.view`,
`users.create`, `users.edit`, `users.lifecycle`, and `users.roles.manage`.
Organization reports/exports, answer keys, invalidation, retirement,
configuration, curriculum, questions, templates, assigned records, and exam
operations remain distinct permissions.

Route files check shared permissions rather than role names. The central
authorization module alone interprets the Administrator role for the
final-effective-active-administrator invariant.

## Route and mutation coverage

The shared inventory and verification matrix contain 8 concrete route patterns
and 9 mutations. The two public authentication mutations use generic failures
and SvelteKit origin protection. Logout and all six administrator mutations
have direct handler coverage. Both administrator page loads are guarded. The
real hook/cookie/session matrix covers anonymous, insufficient-permission,
Instructor, Administrator, multi-role, revoked-grant, and inactive-session
principals.

Adapter-node runtime verification returned `403` for cross-origin posts to
login, password initialization/reset, logout, and instructor creation.
Equivalent same-origin requests reached application enforcement.

## Bootstrap and password actions

There is no default account, password, hidden identity, force flag, or legacy
credential import. The interactive bootstrap CLI disables echo, refuses
non-TTY secret input and secret arguments, requires an empty identity/grant
store, creates one UUID administrator, and records its audit event in the same
transaction.

An effective active administrator may issue a one-hour initialization or reset
token. Only its digest is stored; a later token supersedes the prior token of
the same purpose. Consumption is single-use, updates the Argon2id hash,
activates a pending account, revokes sessions, and audits atomically. No email
delivery is invented. Exact procedures and the evidence-preserving recovery
boundary are in
[BOOTSTRAP_AND_PASSWORD_RESET.md](BOOTSTRAP_AND_PASSWORD_RESET.md).

## Verification totals

- Repository: **158/158 tests across 32 files**.
- Authentication: **30/30 across 9 files**.
- Authorization route/hook/coordinator set: **37/37 across 6 files**.
- Instructor administration/UI: **25/25 across 3 files**.
- Security/audit: **53/53 across 10 files**.
- Bootstrap/password smoke subset: **9/9 across 3 files**.

All clean install, formatting, lint, strict Svelte/type, Drizzle, build,
migration, integrity, focused-test, link, whitespace, diff, and ownership
checks pass. Exact commands and results are in
[PHASE_4_VERIFICATION_MATRIX.md](PHASE_4_VERIFICATION_MATRIX.md).

## Phase 3 preservation

The synthetic importer still accepts 17 and quarantines 5 of 22 source rows,
records all 15 source dispositions, and leaves future hierarchy and prohibited
operational identity/session/password-action rows at zero. The importer fixture
and all Phase 3 schema/reconciliation/harness tests remain in the 158-test
suite. No authoritative migration output is tracked.

## Files by tranche

### 4A

- Created `src/lib/server/auth/**`, `src/routes/login/**`,
  `src/routes/logout/**`, `scripts/auth/**`, `tests/auth/**`,
  `AUTHENTICATION_CONTRACT.md`, and `BOOTSTRAP_AND_PASSWORD_RESET.md`.
- Created `drizzle/0006_phase4_authentication.sql` and
  `drizzle/meta/0006_snapshot.json`.
- Modified `src/lib/server/db/schema/core.ts` and
  `drizzle/meta/_journal.json`.

### 4B

- Created `src/lib/server/authorization/**`,
  `src/lib/server/config/application.ts`, `src/hooks.server.ts`,
  `src/routes/+layout.server.ts`, `tests/authorization/**`,
  `INTEGRATION_CONTRACT.md`, `AUTHORIZATION_CONTRACT.md`, this summary, and the
  final verification matrix.
- Modified `.env.example`, `DEVELOPMENT.md`, `package.json`, `src/app.d.ts`,
  `src/lib/navigation/navigation.ts`, `src/lib/server/config/index.ts`,
  `src/lib/server/config/readiness.ts`, `src/routes/+layout.svelte`,
  `svelte.config.js`, `vitest.config.ts`,
  `tests/foundation/config/config.test.ts`.
- `package-lock.json` was reviewed and remains unchanged.

### 4C

- Created `src/lib/server/instructors/**`,
  `src/routes/admin/instructors/**`, `tests/instructors/**`,
  `tests/ui/instructor-admin/**`, and `INSTRUCTOR_ADMIN_CONTRACT.md`.

### 4D

- Created `src/lib/server/security/**`, `src/lib/server/audit/**`,
  `tests/security/**`, `tests/audit/**`, `SECURITY_VERIFICATION.md`, and
  `AUTHORIZATION_ROUTE_MATRIX.md`.

## Remaining non-blocking work

- A future multi-process deployment must replace or supplement the documented
  process-local limiter with equivalent shared ingress/store enforcement.
- Retention execution, backup automation/restoration, and broader operational
  hardening remain Phase 10 responsibilities under the existing owner-approved
  manual-snapshot exception.
- If no effective administrator and no approved backup remain, Phase 4 stops
  for an authorized incident procedure rather than providing a recovery
  backdoor.

These do not block the Phase 4 gate and do not begin Phase 5.
