# Development and Delivery Guide

## Prerequisites

- Node.js 24 LTS (the package contract permits current Node releases through 26)
- npm 11, pinned to `11.16.0` by `package.json`
- Local persistent storage for any non-test SQLite database

Use synthetic data only. Do not copy the protected source export, real questions, answers,
credentials, access codes, or personal records into the Phase 2 application database.

## Local setup

```sh
cp .env.example .env
npm ci
npm run dev
```

SvelteKit reads `.env` during development. `DATABASE_PATH` is required by readiness and defaults
in the example to `.runtime/aircraft-systems-tester.sqlite`. The database initializer creates
the local parent directory, applies infrastructure-only migrations, enables foreign keys, and
uses WAL plus a 5,000 ms busy timeout for persistent files.

Test databases are temporary or in-memory, independently initialized, and contain no production
data. They are removed or closed by the test harness.

## Configuration behavior

| Mode        | Behavior                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Development | Loads local `.env`; use `.runtime/` and synthetic data.                                                                             |
| Test/CI     | Tests inject temporary or in-memory database paths; CI uses an ignored local path.                                                  |
| Preview     | `npm run preview` serves a Vite preview for inspection, not the production artifact.                                                |
| Production  | `npm start` runs the adapter-node artifact. `DATABASE_PATH` must identify persistent local/block storage and may not be `:memory:`. |

`APP_ENV` accepts `development`, `test`, or `production`; `LOG_LEVEL` accepts `debug`, `info`,
`warn`, or `error`. Adapter-node also consumes `HOST`, `PORT`, `ORIGIN`, and `SHUTDOWN_TIMEOUT`.
`ORIGIN` must be the canonical externally visible origin, including scheme and non-default port;
production uses its HTTPS origin. This value lets SvelteKit distinguish same-origin mutations from
CSRF attempts. Environment files contain names and safe placeholders only; deployment secrets
belong in the operator's secret store.

## Verification and build

```sh
npm run format:check
npm run lint
npm run check
npm test
npm run build
npm start
```

## Phase 3 migration commands

Migration commands write only to ignored local storage. Use `.runtime/` for targets and reports.
The authoritative command verifies the fixed approved checksum before parsing and must run only in
the authorized offline environment. Its output is safe counts only.

```sh
# Create and verify an empty migrated target.
npm run migration:migrate -- .runtime/empty.sqlite

# Inspect or import the synthetic Phase 1 fixture.
npm run migration:profile:fixture
npm run migration:import:fixture -- --target .runtime/fixture.sqlite

# Import the protected authoritative source without printing content.
npm run migration:import:authoritative -- --target .runtime/authoritative.sqlite

# Produce safe reconciliation output and verify the migrated database.
npm run migration:reconcile -- --database .runtime/fixture.sqlite \
  --json .runtime/reconciliation.json --markdown .runtime/reconciliation.md
npm run migration:verify -- .runtime/fixture.sqlite

# Compare two independently imported targets.
npm run migration:reconcile -- --database .runtime/first.sqlite \
  --compare .runtime/second.sqlite --json .runtime/comparison.json
```

Do not commit SQLite databases, reconciliation output from the authoritative source, restricted
quarantine artifacts, or temporary MySQL data. CI uses the synthetic fixture only.

After `npm run build`, `npm start` runs `node build`. With the example environment loaded:

- `GET /health` proves the Node process responds.
- `GET /ready` verifies configuration and database initialization/pragma availability.

Both endpoints return generic status only. They never return environment values or filesystem
paths. Adapter-node handles `SIGTERM`/`SIGINT` and dispatches its shutdown event; the readiness
database handle closes during that event.

## Phase 4 authentication and account operations

Phase 4 adds no default account, password, token, or authentication secret to environment files.
The application seeds only the fixed role/permission vocabulary. Create the first administrator
from an interactive terminal using the exact procedure in
[`docs/migration/phase-4/BOOTSTRAP_AND_PASSWORD_RESET.md`](docs/migration/phase-4/BOOTSTRAP_AND_PASSWORD_RESET.md):

```sh
npm run auth:bootstrap -- --database /absolute/path/to/application.sqlite \
  --employee-number 00000 --first-name Synthetic --last-name Operator
```

The command prompts with terminal echo disabled and refuses non-interactive secret input. It has
no password argument and refuses any non-empty identity/bootstrap state. An effective active
administrator issues a one-hour initialization or reset token with `npm run auth:password-action`;
the raw token is shown once, only its digest is stored, and the recipient consumes it at
`/login/password`. No email or other delivery infrastructure is implied.

Passwords use Argon2id with reviewed explicit parameters. Sessions store only SHA-256 token
digests, allow concurrent devices, expire after 30 minutes idle or 12 hours absolute, rotate at
login when an existing cookie is presented, and support explicit/all-account revocation. The
`ast_session` cookie is `HttpOnly`, `SameSite=Lax`, path `/`, and becomes `Secure` when
`APP_ENV=production`. Deactivation/suspension, retirement, and password changes revoke active
sessions transactionally.

Login attempts are limited per normalized account and network over a 15-minute window (five per
account, twenty per network). The bounded 10,000-digest limiter is process-local and matches this
project's required single writable Node process. Any future multi-process ingress must provide
equivalent shared enforcement. Monitor saturation without recording network keys, employee
numbers, credentials, or request bodies.

Never place passwords, raw session/reset/initialization tokens, cookies, password hashes, or
sensitive request bodies in source, fixtures, command arguments, environment variables, logs,
audit metadata, snapshots, tickets, or reports. Tests generate ephemeral credential values at
runtime. Account lifecycle/role/identifier changes and security-sensitive session actions are
audited with allow-listed metadata only.

## SQLite deployment contract

Run exactly one writable Node application instance against the database file. Store it on durable
local or block storage with WAL-compatible locking, never on a general network filesystem. Keep
write transactions short. A container deployment must mount persistent storage at `/data`; the
provided image defaults to `/data/aircraft-systems-tester.sqlite` and runs as the non-root `node`
user.

Phase 2 does not provide production backup automation. The owner-approved current exception is
manual operator snapshots; document and rehearse the snapshot procedure before irreplaceable new
data exists. Backup/restore hardening remains later work.

## Troubleshooting

- **Readiness returns 503:** check that `DATABASE_PATH` is present, its parent is writable, and the
  process has exclusive access needed to initialize the database. Logs use only a generic error
  code and intentionally omit paths.
- **SQLite busy/locked:** verify only one writable Node instance uses the file and the storage
  supports WAL locking. Do not reduce the busy timeout as an ad hoc fix.
- **Native driver installation fails:** use supported Node 24 on a platform supported by
  `better-sqlite3`; do not introduce a second SQLite driver.
- **Production start fails:** run `npm run build` first and verify the documented environment.
- **Clean install differs:** use `npm ci`, not an unpinned install command.
