# Phase 4 Integration Contract

This contract fixes the seams shared by tranches 4A–4D. Implementations may add
fields internally, but callers depend only on the shapes and behavior below.

## Principal and clock

```ts
export interface AuthenticatedPrincipal {
	userId: string;
	employeeNumber: string;
	displayName: string;
	roles: readonly string[];
	permissions: ReadonlySet<string>;
	sessionIdHash: string;
}

export interface Clock {
	now(): Date;
}
```

`App.Locals.principal` is `AuthenticatedPrincipal | null`. UUID user IDs are
the authorization identity; employee numbers are display/business identifiers,
never authorization keys. Production uses a UTC system clock. Tests inject a
clock and never sleep.

## Session service

Tranche 4A exports a session service with these operations:

- `create(userId, context)` returns a raw random token exactly once plus safe
  expiry metadata; only a SHA-256 token hash is persisted.
- `resolve(rawToken)` returns an active session/user reference or the shared
  unauthenticated result. It enforces a 30-minute idle and 12-hour absolute
  lifetime, checks active user status, and updates last-seen without extending
  the absolute deadline.
- `rotate(rawToken)` revokes the old session and returns a new raw token exactly
  once in one transaction.
- `revoke(rawToken, reason)` and `revokeAllForUser(userId, reason, tx)` are
  idempotent and audited where security-sensitive.

The cookie owner is the coordinator hook/routes integration. Its fixed name is
`ast_session`; path is `/`, `HttpOnly` and `SameSite=Lax` are always set,
`Secure` is set in production, and `Max-Age` never exceeds 12 hours. Only the
raw cookie crosses the request boundary. It must never enter logs, errors,
audit JSON, fixtures, snapshots, or reports.

## Authorization

The coordinator exports the canonical permission constants, baseline role
definitions, idempotent seeding, effective grant resolution, and:

```ts
requireAuthenticated(locals, mode?): AuthenticatedPrincipal
requirePermission(locals, permission, mode?): AuthenticatedPrincipal
requireInstructorCapability(locals, mode?): AuthenticatedPrincipal
requireAdministratorCapability(locals, mode?): AuthenticatedPrincipal
```

Browser page loads use safe local redirects to `/login`; actions/endpoints use
non-enumerating 401/403 responses. Route code checks permissions, never role
names. Navigation visibility is supplemental only.

Baseline role codes are `administrator`, `instructor`, `question_author`,
`curriculum_manager`, and `report_viewer`. Permission codes are stable,
lowercase dotted strings. Instructor administration uses explicit
`users.view`, `users.create`, `users.edit`, `users.lifecycle`, and
`users.roles.manage` permissions. Organization/destructive capabilities remain
separate explicit permissions.

## Audit events

Tranche 4D exports an append-only audit writer accepting an existing database
transaction:

```ts
recordAuditEvent(tx, {
	actorUserId, action, entityType, entityId, occurredAt, before, after
}): void
```

`before` and `after` contain allow-listed safe fields only. The writer rejects
credential, token, cookie, hash, and sensitive-body keys recursively. Events
identify actor, action, entity, and time. Administrative services own the
business transaction and call the audit writer inside it.

## Results and errors

Domain results use `ok: true` with a value or `ok: false` with one of:

- `invalid_input` — field-safe validation details
- `unauthenticated` — missing, invalid, expired, revoked, or inactive session
- `forbidden` — authenticated principal lacks permission/scope
- `authentication_failed` — all login credential/account failures
- `rate_limited` — generic login failure with retry metadata
- `conflict` — duplicate employee number or stale state
- `final_active_administrator` — protected administrator invariant
- `not_found` — safe resource absence outside authentication
- `unavailable` — transaction/audit/storage failure without sensitive detail

Authentication responses never distinguish unknown employee number, incorrect
password, missing hash, or pending/suspended/retired status.

## Transaction ownership

The outer domain service owns each synchronous `DatabaseHandle.transaction`.
Repositories, session revocation, authorization reads, and audit writes accept
the supplied transaction and never start nested transactions. User lifecycle,
employee-number correction, role grant/revocation, final-administrator checks,
session revocation, and audit insertion commit or roll back together. Login
session creation/rotation and bootstrap also use one outer transaction.

## Route classification

- Public: `/`, `/health`, `/ready`, `/login` and login actions.
- Authenticated: `/logout` mutation and future staff landing routes.
- Instructor-capable: future assigned-work routes; no current placeholder route
  receives authorization by implication.
- Administrator-only by explicit permission: `/admin/instructors` and every
  nested page/action/endpoint.

`/health` returns only liveness. `/ready` returns only ready/unavailable and no
configuration or database details. Every route and mutation must appear in the
Phase 4 route matrix. SvelteKit's origin checking remains enabled for mutations;
tests verify rejected cross-origin requests.
