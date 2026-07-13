# Instructor Administration Contract

## Scope

Phase 4 administration manages new application users only. It does not import or infer any
legacy staff identity, login, password, access code, or session. A created user has an immutable
UUID, a string employee number, `pending` status, and no password hash. Password initialization
is owned by the authentication contract.

The server service is implemented in `src/lib/server/instructors/`. The administrative pages are
`/admin/instructors` and `/admin/instructors/[id]`.

## Authorization

Every page load and action enforces a granular permission through the shared server authorization
guards. Role names are not checked in route code, and hiding navigation is not authorization.

| Operation                             | Permission           |
| ------------------------------------- | -------------------- |
| List and view users                   | `users.view`         |
| Create a pending user                 | `users.create`       |
| Edit names or correct employee number | `users.edit`         |
| Activate, suspend, or retire          | `users.lifecycle`    |
| Grant or revoke roles                 | `users.roles.manage` |

Browser page loads redirect an anonymous caller according to the shared guard contract. Actions
use endpoint mode and return non-leaking 401 or 403 responses. SvelteKit origin checking applies
to every form mutation.

## Data and lifecycle

- User IDs are generated with `crypto.randomUUID()` and never change.
- Employee numbers remain strings. Trimming surrounding whitespace does not remove leading
  zeroes. Values are unique under the database constraint and service conflict check.
- Names and employee numbers have bounded, server-validated lengths.
- New accounts are `pending` and contain no password.
- A pending, active, or suspended account may become active, suspended, or retired. Suspension is
  the reversible deactivated state in the Phase 3 schema.
- `retired` is terminal. No service operation physically deletes a user.
- Suspending or retiring a user revokes every active session in the same transaction.
- Retired timestamps are set by the injected UTC clock.

Employee-number correction requires a different valid number and a bounded non-empty reason. The
service updates the current number and appends an `employee_identifier_history` row containing the
old value, replacement, actor UUID, time, and reason. History is never updated or deleted by this
service.

Multiple active role grants are supported. Grants append a `user_roles` row; revocation timestamps
the active grant rather than deleting it. Repeating a grant or revocation is idempotent.

## Final active administrator invariant

The service delegates effective-administrator evaluation to the shared authorization module.
Before an active administrator is suspended, retired, or loses the Administrator role, the
service counts effective active administrators inside the caller-owned transaction. It rejects a
change that would remove the last one with `final_active_administrator`. Revoking an unrelated
role is not blocked. A second effective active administrator must exist before the protected
change can proceed.

## Transactions and audit

Each mutation owns one synchronous `DatabaseHandle.transaction`. Repository reads, writes,
session revocation, final-administrator checks, and audit insertion all receive that transaction;
none starts a nested transaction. An exception from storage, audit writing, or session revocation
rolls back all changes and produces the safe `unavailable` result.

The service emits canonical security events:

- `user.created`
- `user.updated`
- `user.status.changed`
- `user.employee_number.changed`
- `user.role.granted`
- `user.role.revoked`

Audit metadata is allow-listed to names, employee number, status, role codes, and correction
reason. It never includes passwords, hashes, raw tokens, cookies, sensitive request bodies, or
other credentials. Events identify the actor, entity UUID, action, and injected occurrence time.

## Results and validation

Successful mutations return `{ ok: true, value }`. Failures use the shared vocabulary:

- `invalid_input` with field-safe errors
- `conflict` for an employee-number collision
- `final_active_administrator` for the protected invariant
- `not_found` for a missing user or role
- `unavailable` for an atomic storage/integration failure

Routes translate these results to 400, 404, 409, or 503 responses without returning exception or
database details. Submitted create values are returned only for ordinary identity fields; no
credential fields exist in these forms.

## Accessibility and responsive behavior

Forms have explicit labels, required indicators, descriptions, field-linked errors, an error
summary, and status announcements. Tables use column and row headers and live in a labelled
horizontal overflow region. The account list changes from a two-column administration layout to a
single column at narrow widths. The detail page uses wrapping panels without fixed viewport
dimensions. Lifecycle consequences and terminal retirement are stated next to the control.

## Verification

Focused service tests run against SQLite initialized through every ordered migration. They cover
list/view, leading-zero creation, duplicate rejection, validation, profile edit, append-only
identifier history, lifecycle transitions, real session revocation, canonical audit integration,
role grant/revocation, final-administrator protection, idempotence, and rollback on audit or
session failure. UI tests cover labelled controls, field-linked error summaries, lifecycle and
role controls, responsive account presentation, and visible history/status feedback.
