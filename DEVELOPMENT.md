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
`warn`, or `error`. Adapter-node also consumes `HOST`, `PORT`, and `SHUTDOWN_TIMEOUT`. Environment
files contain names and safe placeholders only; deployment secrets belong in the operator's
secret store.

## Verification and build

```sh
npm run format:check
npm run lint
npm run check
npm test
npm run build
npm start
```

After `npm run build`, `npm start` runs `node build`. With the example environment loaded:

- `GET /health` proves the Node process responds.
- `GET /ready` verifies configuration and database initialization/pragma availability.

Both endpoints return generic status only. They never return environment values or filesystem
paths. Adapter-node handles `SIGTERM`/`SIGINT` and dispatches its shutdown event; the readiness
database handle closes during that event.

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
