# Phase 4 Authorization Contract

## Server boundary

`src/hooks.server.ts` resolves the `ast_session` cookie through the session
service and places either a minimal `AuthenticatedPrincipal` or `null` in
`App.Locals`. It also supplies the single application `DatabaseHandle` to
server routes. Health remains a database-free liveness response; readiness
returns only `ready` or `unavailable`.

Every protected page load, action, and endpoint calls a guard from
`src/lib/server/authorization/`. Browser navigation receives a safe redirect to
`/login`. Actions and endpoints receive generic 401/403 responses. Route code
checks permission constants, never employee numbers or role names. UI
visibility is presentation only.

## Principal

The principal contains the immutable user UUID, employee number, display name,
effective role codes, effective permission set, and the one-way session-token
hash. It never contains a password/hash or raw session token. A principal is
resolved only for an active user and is rebuilt from current non-revoked grants
on each request.

## Baseline roles

- `administrator`: all baseline capabilities, with actions still audited and
  subject to domain invariants.
- `instructor`: assigned rosters, exams, attempts, and reports.
- `question_author`: draft/review/publish question capabilities; the separate
  distinct-reviewer domain rule remains mandatory.
- `curriculum_manager`: curriculum and template management.
- `report_viewer`: organization reports and audited export, excluding answer
  keys unless separately granted.

The canonical granular vocabulary is exported as `PERMISSIONS`. User
administration separates view, create, edit, lifecycle, and role-management
permissions. Answer keys, invalidation, retirement, organization export, and
configuration remain distinct capabilities.

## Seeding and effective grants

Application database initialization idempotently inserts the five stable roles,
the canonical permissions, and their baseline associations in one transaction.
It does not create users, credentials, sessions, or role grants. Effective
resolution includes every non-revoked role grant, supporting multi-role users.

The central authorization module is the only implementation that interprets
the Administrator role for the final-active-administrator invariant. Instructor
administration calls `hasEffectiveAdministratorCapability` and
`countEffectiveActiveAdministrators` inside its outer transaction.

## Cookies, redirects, and request protection

The cookie name is `ast_session`; it is always `HttpOnly`, `SameSite=Lax`, path
`/`, limited to the 12-hour absolute session lifetime, and `Secure` in
production. Invalid/revoked/expired sessions clear the cookie. Redirect targets
must be local absolute paths and protocol-relative/external targets collapse to
`/`.

SvelteKit origin checking remains enabled with no additional trusted origins.
Security headers deny framing and broad browser capabilities, prevent MIME
sniffing and referrer disclosure, and apply a restrictive same-origin content
security policy.

See [AUTHORIZATION_ROUTE_MATRIX.md](AUTHORIZATION_ROUTE_MATRIX.md) for the
route/action inventory and [INTEGRATION_CONTRACT.md](INTEGRATION_CONTRACT.md)
for shared service seams.
