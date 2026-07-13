# Phase 4 Authentication Contract

## Identity and credentials

Application identities are new UUID-based `users` records. Employee numbers are unique strings and are never authorization keys. Authentication never reads or imports legacy instructor, login, password, access-code, or session data.

Passwords are encoded as Argon2id PHC strings using Node 24's native implementation with version 19, 19,456 KiB memory, two passes, parallelism two, a 16-byte random salt, and a 32-byte tag. These reviewed parameters are constants in `src/lib/server/auth/password.ts`. A successful login replaces a valid hash whose parameters differ. Passwords must contain 14–256 characters. No password is returned, audited, or logged.

All credential/account failures return `authentication_failed`; unknown employee number, wrong password, missing hash, and pending, suspended, or retired status are indistinguishable. A precomputed synthetic dummy hash ensures unknown accounts still execute Argon2id verification. The shared bounded login limiter consumes both a network key and normalized account key before every lookup.

## Sessions

`SessionService` is constructed with a `DatabaseHandle`, the shared `recordAuditEvent` function, and an optional injected `Clock`.

- `create(userId)` owns a synchronous transaction and returns a 32-byte base64url token exactly once with safe timestamps. SQLite stores only its lowercase SHA-256 hash.
- `resolve(rawToken)` owns a transaction, joins the active user, rejects missing/revoked/inactive/expired sessions, and updates `last_seen_at`. Idle expiry is exactly 30 minutes and absolute expiry exactly 12 hours; last-seen updates never change `expires_at`.
- `rotate(rawToken)` revokes the old session and creates a new token in one transaction.
- `revoke(rawToken, reason)` is idempotent.
- `createInTransaction` and `revokeAllForUser(userId, reason, tx)` let an outer business transaction own atomic user lifecycle/password changes.

Concurrent sessions are allowed. Deactivation uses `revokeAllForUser` in the caller's user mutation transaction. Login revokes an existing browser session as `rotation` before creating the newly authenticated session in the same transaction.

The cookie owner is the authorization integration: `ast_session`, path `/`, HttpOnly, SameSite=Lax, production Secure, and maximum age capped at the remaining 12-hour absolute lifetime. Raw tokens never enter errors, audit records, fixtures, or snapshots.

## Password initialization and reset

`PasswordActionService.issue` invalidates prior outstanding tokens of the same purpose and returns a new 32-byte random token once. Only SHA-256 hashes are stored. Tokens expire after one hour, are single-use, and are marked both used and revoked on consumption. A successful change stores a fresh Argon2id hash and revokes all sessions in the same transaction. The public `/login/password` action accepts a token and matching new password fields, returns only a generic failure, and never echoes submitted secrets.

All services use caller-injected clocks in deterministic tests. Database operations retain the shared Phase 2/3 connection, pragma, and immediate synchronous transaction behavior.
