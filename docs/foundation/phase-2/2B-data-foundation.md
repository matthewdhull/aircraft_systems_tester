# Phase 2B — Data foundation

## Scope and result

This tranche establishes only the local SQLite/Drizzle infrastructure. It does not
define the Phase 3 canonical schema, read the authoritative export, transform
MySQL, or create any identity, curriculum, question, exam, attempt, report,
quarantine, or importer table.

The selected runtime driver is `better-sqlite3` 12.11.1. The decision and rejected
alternatives are recorded in [ADR-sqlite-driver.md](ADR-sqlite-driver.md).

## Server-only contract

`src/lib/server/db/index.ts` exports:

- `openDatabase({ path, busyTimeoutMs, migrationsFolder, createParentDirectory })`
- `handle.verify()` and the equivalent `verifyDatabase(handle)`
- `handle.transaction(work)` for synchronous `BEGIN IMMEDIATE` work
- idempotent `handle.close()`
- typed, path-free `DatabaseInitializationError` and
  `DatabaseVerificationError`

The module lives under SvelteKit's `src/lib/server` boundary and must only be
imported by server modules. It does not import environment state itself: the
delivery/configuration layer supplies the validated database path. The default
migration directory is `<working directory>/drizzle` and may be overridden for a
packaged runtime or focused test.

On initialization the module:

1. validates the path and bounded busy timeout;
2. creates a missing persistent parent directory with owner-only requested mode;
3. opens one SQLite connection;
4. enables `foreign_keys`;
5. sets the busy timeout (default 5000 ms);
6. enables WAL for persistent file databases;
7. applies committed Drizzle migrations;
8. verifies the configured pragmas, `quick_check`, and a trivial query;
9. closes the connection and throws a generic path-free error if any step fails.

In-memory databases use SQLite's `memory` journal. Anonymous SQLite temporary
databases use their native `delete` journal. WAL is required and verified for every
persistent file database. Readiness responses and logs should report only the
verification outcome, never the configured path.

## Migration harness

`drizzle.config.ts` points Drizzle Kit at the server-only schema, the versioned
`drizzle/` directory, and the development fallback database under `.runtime/`.
Migration `0000_foundation_probe.sql` creates only
`_foundation_metadata`. This empty infrastructure marker is intentionally narrow:
it proves an empty database can run a real migration and gives Phase 3 a valid
schema-generation baseline. Phase 2 does not insert rows into it. Drizzle also
maintains its own `__drizzle_migrations` ledger.

Future schema changes must be generated from the TypeScript schema, reviewed, and
committed with the updated Drizzle metadata. `drizzle-kit push` is not a production
deployment mechanism.

## Test database behavior

Focused tests use either `:memory:` or unique database files beneath an
OS-generated temporary directory. Every handle is closed and every test-owned
directory is removed after the test. Tests never use an authoritative export or
production data.

Coverage includes database creation, migration application, required PRAGMAs,
commit, rollback, isolation, invalid-parent failure, and idempotent close.

## Verification

From the repository root:

```sh
npx --no-install vitest run tests/foundation/database/database.test.ts
npx --no-install svelte-check --tsconfig ./tsconfig.json
npx --no-install drizzle-kit check
git diff --check -- src/lib/server/db drizzle drizzle.config.ts tests/foundation/database docs/foundation/phase-2/2B-data-foundation.md docs/foundation/phase-2/ADR-sqlite-driver.md
```

The full repository commands remain the convergence gate because other tranches
own the shared scripts and build configuration.
