# ADR: SQLite driver for the Node deployment

- **Status:** Accepted
- **Date:** 2026-07-12
- **Scope:** Phase 2 database foundation

## Context

The application deploys through `@sveltejs/adapter-node` as one writable Node
instance with a database on persistent local storage. The Phase 2 runtime baseline
is Node 24 LTS. Drizzle's current SQLite documentation supports `node:sqlite`,
`better-sqlite3`, and libSQL. The decision must keep one production driver and must
support explicit synchronous transactions, WAL, busy timeout, verification,
backup, and clean close behavior.

Primary references consulted on 2026-07-12:

- [Drizzle native SQLite driver guide](https://orm.drizzle.team/docs/sqlite/get-started-sqlite)
- [Node release status](https://nodejs.org/en/about/previous-releases)
- [Node `sqlite` API](https://nodejs.org/api/sqlite.html)
- [`better-sqlite3` project and installation support](https://github.com/WiseLibs/better-sqlite3)
- [`better-sqlite3` API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [`better-sqlite3` 12.11.1 release](https://github.com/WiseLibs/better-sqlite3/releases/tag/v12.11.1)
- [SQLite WAL documentation](https://www.sqlite.org/wal.html)
- [SQLite PRAGMA documentation](https://www.sqlite.org/pragma.html)

## Options considered

| Driver                     | Support and runtime fit                                                                              | Transaction and operations fit                                                                             | Portability implications                                                                                                           | Decision         |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `better-sqlite3` 12.11.1   | Directly supported by Drizzle; maintained; supports current Node releases and supplies LTS prebuilds | Mature synchronous transaction wrapper, PRAGMA access, online backup, integrity checks, and explicit close | Native addon requires a compatible prebuild or build toolchain; deployment image must install dependencies for its target platform | Selected         |
| Node 24 `node:sqlite`      | Directly supported by Drizzle and removes a third-party native dependency                            | Synchronous local API and busy timeout are suitable                                                        | In the official API it remains release-candidate rather than stable; changing to it later is possible behind this module boundary  | Rejected for now |
| `@libsql/client`           | Directly supported by Drizzle and actively maintained                                                | Adds remote and fork-specific capabilities that are outside the local SQLite requirement                   | Adds client layers and a SQLite fork without a current need; increases deployment and operational surface                          | Rejected         |
| `sqlite3` / `node-sqlite3` | Not one of the native drivers in Drizzle's current SQLite guide                                      | Callback-oriented API is a poorer fit for short, explicit serialized transactions                          | Native build burden without a compensating requirement                                                                             | Rejected         |

## Decision

Use exactly one production driver: `better-sqlite3` 12.11.1 with
`drizzle-orm` 0.45.2. The installed `@types/better-sqlite3` package supplies its
TypeScript declarations. This confirms the provisional dependency choice; no
additional data-foundation dependency is required.

The synchronous API is intentional. SQLite serializes writes, and the application
contract forbids an `await` inside a transaction. The wrapper begins write work
with `BEGIN IMMEDIATE`, commits on return, and rolls back on throw. Phase 3 should
keep transaction callbacks short and free of network or filesystem waits.

Persistent databases enable and verify WAL. SQLite documents that WAL permits
readers alongside a writer but still allows only one writer and requires all
participants to be on the same host; the deployment therefore remains one writable
Node instance on local persistent storage. A 5000 ms busy timeout absorbs brief
write contention and fails boundedly rather than waiting indefinitely.

## Consequences

- Production artifacts must install the native addon for the deployment platform;
  a `node_modules` directory copied from another OS/architecture is invalid.
- The database file, WAL, and shared-memory files belong on persistent local
  storage, not a network filesystem.
- `Database#backup()` is available for a later backup policy, but Phase 2 does not
  create or retain backups.
- Driver upgrades require review of both the driver release notes and bundled
  SQLite release history.
- The driver stays behind `src/lib/server/db/`, allowing a later ADR to replace it
  without exposing native handles to browser code.
