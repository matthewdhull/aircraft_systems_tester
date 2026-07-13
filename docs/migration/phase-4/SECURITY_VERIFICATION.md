# Phase 4 Security Verification

## Security controls

Phase 4 treats authentication and authorization as server concerns. Passwords
are handled only by the authentication service, raw session values exist only
at the request/cookie boundary, and administrative services write audit events
inside their caller-owned database transaction. UI visibility is supplemental
and never grants access.

The shared audit writer accepts only explicitly reviewed scalar fields. It
rejects unknown fields, nested objects, and keys associated with credentials,
tokens, cookies, hashes, sessions, secrets, authorization headers, or request
bodies before performing an insert. Administrative before/after data is
limited to names, employee number, lifecycle status, role codes, and a reviewed
change reason. Audit records are append-only by application contract.

The login limiter applies independent account and network limits. It stores
only SHA-256 digests of normalized keys, uses a 15-minute window by default,
and is bounded to 10,000 tracked digests. It fails closed for previously unseen
keys while full rather than evicting active protection. Tests inject a clock;
there are no timing sleeps.

### Rate-limit deployment constraint

The provided limiter is process-local. A production deployment may use it
directly only when login traffic is pinned to one application process. Multiple
application processes must add equivalent shared enforcement at the ingress or
a shared rate-limit store. Limits must be at least as strict as the application
defaults, and responses must retain the generic authentication failure policy.
Operators should monitor limiter saturation without logging network keys,
employee numbers, request bodies, or credentials.

## Security event vocabulary

Canonical actions are exported from `src/lib/server/security/events.ts`. They
cover login success/failure/rate limiting, logout, session creation/rotation/
revocation, password initialization/reset, first-administrator bootstrap, user
lifecycle changes, employee-number correction, and role grants/revocations.
Session revocations use explicit reason codes rather than free-form sensitive
details.

## Automated coverage

The owned deterministic tests cover:

- independent account and network throttling, retry timing, expiry, key
  normalization, invalid clocks/configuration, bounded storage, and fail-closed
  capacity behavior;
- stable security-event and session-revocation vocabulary;
- one-way session-token persistence, concurrent sessions, exact idle and
  absolute expiry boundaries, last-seen behavior, rotation, explicit
  revocation, and inactive-account rejection against the real session service;
- generic authentication failures for incorrect, unknown, pending, suspended,
  and retired accounts; successful digest-only session creation; and real
  login rate-limit integration;
- digest-only password-action storage, exact expiry, single use, password-hash
  replacement, pending-account activation, session revocation, and safe
  first-administrator bootstrap refusal after initial use;
- audit identity/action/entity/time persistence;
- allow-listed before/after serialization;
- rejection of credential, token, cookie, hash, session, request-body, nested,
  and unknown audit fields before insertion.
- full SQLite-value scanning after password, session, and password-action
  operations to prove their ephemeral raw values were not persisted.

Cross-tranche tests additionally cover production/non-production cookie flags,
open-redirect rejection, real hook resolution from seeded roles and cookies,
all administrator route guards/actions, administrative audit and revocation
rollback, and final-active-administrator protection.

## Authorization convergence evidence

`tests/security/authorization-route-matrix.test.ts` calls both protected page
loads, all six administrator actions, and the logout endpoint through their
real exported SvelteKit handlers. It covers anonymous, authenticated without
permission, instructor, administrator, multi-role, revoked-grant, and inactive
principal states. `tests/security/hook-authorization-integration.test.ts` then
creates real users and seeded grants, creates real sessions, resolves their raw
cookie values through `hooks.server.ts`, and passes the resulting locals to the
protected list load and create action. The revoked-grant case is resolved after
an actual persisted grant revocation; the inactive-session case clears its
cookie and resolves unauthenticated.

The shared route inventory contains 8 route patterns and 9 mutations. The two
public mutations use SvelteKit origin enforcement and generic failures; the 7
protected operations have direct real-handler coverage. Permission mappings
for the 6 administrator actions are asserted against the shared route policy.
Real public-action tests also prove that malformed blank login submissions are
counted by the limiter and that password-action input failures remain generic.

## Runtime CSRF/origin evidence

The adapter-node build was started locally with an explicit canonical origin
and an isolated migrated SQLite database. Empty form bodies were used, so no
credential or token entered command arguments, output, or files. Cross-origin
`POST` requests to `/login`, `/login/password`, `/logout`, and
`/admin/instructors?/create` each returned `403` with SvelteKit's cross-site
form rejection. Matching same-origin requests reached the application:
`/login` and `/login/password` returned rendered action responses (`200`),
while anonymous `/logout` and instructor creation returned the expected `401`.

Representative command (empty request body):

```sh
curl -sS -o /tmp/phase4-cross-origin.txt -w '%{http_code}' \
  -X POST -H 'Origin: https://cross-origin.invalid' \
  -H 'Content-Type: application/x-www-form-urlencoded' --data '' \
  http://127.0.0.1:4199/login
```

Observed result: `403`. The server was stopped cleanly after the matrix.

## Verification commands

Run the focused security and audit suite with:

```sh
npx vitest run tests/security tests/audit
```

The Phase 4 acceptance run additionally executes the repository-wide format,
lint, strict type, test, Drizzle, build, migration, SQLite integrity, link,
whitespace, and sensitive-value checks listed in the Phase 4 verification
matrix. Test inputs are synthetic and contain no reusable credential or token.

## Verification status

Final focused security/audit result: **53 tests across 10 files passed**. The
broader authentication, authorization, instructor, instructor-UI, security,
and audit convergence command passed **108 tests across 22 files**. Scoped
ESLint and Prettier checks, strict Svelte/type checking, `git diff --check`, and
the adapter-node build also passed. The final repository-wide `npm test` run
passed **158 tests across 32 files**. Remaining repository-wide gate commands
and database integrity results are recorded in the Phase 4 verification matrix.

Administrative integration tests prove that session revocation and audit
insertion commit with lifecycle changes and that failures in either dependency
roll the mutation back. Role-grant audit failure also rolls back. The
first-active-administrator invariant is covered for role revocation and account
suspension. Bootstrap is accepted only for an empty identity store and refused
after the first administrator; password actions are digest-only, expiring,
single-use, and revoke sessions on completion.

The dynamic SQLite scan found no ephemeral password, raw session value, or raw
password-action value after real operations. A source scan found no literal
password or raw-token assignment in application, test, script, or Phase 4
documentation paths. No legacy identity/login/session import path was added.
