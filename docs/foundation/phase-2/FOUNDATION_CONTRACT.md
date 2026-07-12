# Phase 2 Foundation Contract

## Purpose and boundary

This contract is the stable handoff from Phase 2 to later implementation phases. It defines the
runtime, repository, database, UI, and delivery infrastructure only. Phase 3 exclusively owns the
canonical application schema and importer. Later feature phases own authentication, curriculum,
questions, test generation, exam delivery, grading, and reporting.

No later phase may use the protected export, real assessment content, credentials, access codes,
or personal records in ordinary development, tests, logs, health responses, or build artifacts.

## Runtime and package contract

- Node 24 LTS is the production baseline; `package.json` permits supported Node versions
  `>=24 <27`.
- npm 11.16.0 is pinned through `packageManager`; `package-lock.json` is lockfile version 3.
- `npm ci` is the only clean-checkout install command.
- SvelteKit uses strict TypeScript and `@sveltejs/adapter-node`; `npm run build` creates `build/`
  and `npm start` runs `node build`.
- Stable Drizzle 0.45.2 uses exactly one production SQLite driver, `better-sqlite3` 12.11.1.
- Package manifest, lockfile, and shared framework configuration remain centrally owned; feature
  work must not add dependencies casually or introduce another production SQLite driver.

## Source and ownership boundaries

| Boundary         | Contract                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser-safe UI  | Components, styles, and navigation live under `src/lib/components`, `src/lib/styles`, and `src/lib/navigation`.                                |
| Server-only code | Database, configuration, and logging live under `src/lib/server`; SvelteKit prevents these modules from entering client bundles.               |
| Routes           | Foundation routes are the landing page, application shell/error page, `/health`, and `/ready`. Future destination links are placeholders only. |
| Migrations       | Ordered SQL and Drizzle metadata live under `drizzle/`; the deployment working directory must include this directory.                          |
| Tests            | Foundation integration tests live under `tests/foundation`; server tests use Node and component tests use jsdom/browser resolution.            |
| Delivery         | CI, environment example, container definition, and developer guidance remain infrastructure concerns.                                          |

Legacy application files, discovery evidence, Phase 1 fixtures, and the authoritative export are
read-only inputs outside this contract.

## Database contract

`openDatabase` accepts a validated path, optional migration directory, optional bounded busy
timeout, and an explicit parent-directory policy. It returns a server-only handle with the
Drizzle database, native connection, verification, synchronous transaction, and idempotent close
operations.

Initialization must:

1. validate inputs without exposing paths in failures;
2. create an approved persistent parent directory when requested;
3. enable and verify `foreign_keys = ON`;
4. enable and verify WAL for persistent files;
5. apply and verify the 5,000 ms default busy timeout;
6. apply committed migrations;
7. run availability and quick-integrity checks; and
8. close and fail clearly if initialization or verification is unsuccessful.

Transactions use `BEGIN IMMEDIATE`, commit on synchronous return, and roll back on throw. Async
work is forbidden inside the transaction callback. Tests use isolated in-memory, anonymous
temporary, or unique temporary-file databases.

The only Phase 2 application-defined table is `_foundation_metadata`, an empty infrastructural
migration probe. Drizzle's migration ledger is also present. Neither is a domain schema.

## Configuration, logging, and probe contract

`DATABASE_PATH` is required. `APP_ENV` and `LOG_LEVEL` are validated enums, and production rejects
`:memory:`. Adapter-node consumes `HOST`, `PORT`, and `SHUTDOWN_TIMEOUT`. Production storage must
be persistent local/block storage with WAL-compatible locking.

Structured logging emits JSON with a fixed allowlist of operational fields. It accepts no request
bodies, headers, cookies, credentials, query strings, exception text, assessment content, access
codes, or personal data.

- `/health` proves the Node process responds and returns only `{ "status": "ok" }`.
- `/ready` validates configuration and database initialization/verification, returning only a
  generic ready or unavailable status.
- Both endpoints disable caching and expose no environment values or filesystem paths.
- The cached readiness handle closes on adapter-node's shutdown event.

## UI and authorization contract

The application shell supplies accessible landmarks, skip navigation, visible focus, responsive
navigation, reduced-motion behavior, safe application errors, and reusable form/status/data
primitives. Navigation configuration may consume a future server-provided visibility decision,
but it never grants access. Every future page, server action, endpoint, query, export, and record
lookup must enforce authorization independently on the server.

## Deployment contract

Run exactly one writable Node instance against one SQLite file. Do not use a general network
filesystem or multiple writable hosts. Keep transactions short and mount persistent storage for
the database, WAL, and shared-memory files.

The container definition uses matching Node 24 Debian build/runtime stages, includes only the
SvelteKit inputs and committed migrations in its build context, runs as a non-root user, and
mounts `/data`. The direct adapter-node artifact remains the acceptance baseline whether or not a
container runtime is available.

The approved current backup exception is manual operator snapshots. A repeatable snapshot and
restore procedure must be documented and rehearsed before irreplaceable new records exist.

## Required clean-checkout commands

```sh
npm ci
npm run format:check
npm run lint
npm run check
npm test
npx --no-install drizzle-kit check
npm run build
npm start
```
