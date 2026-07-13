# Phase 3 Migration Verification Matrix

## Foundation and schema

| Verification                    | Status   | Evidence                                                                                                |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| Branch/ancestry/clean preflight | **Pass** | `schema_data_import` began clean at accepted Phase 2 commit `595918b`.                                  |
| Protected source identity       | **Pass** | Approved path exists; size and SHA-256 match; no source modification.                                   |
| Phase 1 fixtures                | **Pass** | All manifest checksums match; both SQL fixtures are tracked.                                            |
| Phase 2 clean checkout          | **Pass** | Frozen install, format, lint, check, 21 tests, Drizzle check, build/start, probes, and shutdown passed. |
| Canonical schema                | **Pass** | 64 tables with documented ownership, constraints, retention, and import keys.                           |
| Ordered migrations              | **Pass** | `0000` through `0005`, TypeScript schema, snapshots, and journal are synchronized.                      |
| Empty migration                 | **Pass** | Six migrations apply from scratch; FK/integrity/quick checks pass.                                      |
| Schema constraints/indexes      | **Pass** | Nine schema tests cover lifecycle, delete, aggregate floor, quarantine privacy, and query plans.        |

## Importer, reconciliation, and harness

| Verification                         | Status   | Evidence                                                                                                   |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| Actual MySQL-compatible fixture load | **Pass** | Phase 1 `schema.sql` then `data.sql` loaded into disposable MariaDB 11.4 with 15 tables.                   |
| Synthetic profile                    | **Pass** | 15 tables and 22 rows match `expected-profile.json`.                                                       |
| Golden manifest references           | **Pass** | All 67 case IDs are present and unique.                                                                    |
| Synthetic import                     | **Pass** | 17 accepted and 5 quarantined; zero future hierarchy rows.                                                 |
| Controlled rollback                  | **Pass** | Mid-stream parse failure leaves no import run, accepted row, or quarantine row.                            |
| Same-target idempotence              | **Pass** | Rerun returns the existing deterministic run and creates no duplicates.                                    |
| Two-target equivalence               | **Pass** | Independent fresh imports compare equivalent across 18 logical tables.                                     |
| Checksum enforcement                 | **Pass** | Mismatch fails before an import transaction; CLI accepts only fixed approved sources.                      |
| All 15 dispositions                  | **Pass** | Inventory and reconciliation contain every approved source table and executable disposition.               |
| Mapping reconciliation               | **Pass** | Deterministic UUIDv5/source mappings cover accepted imported identities.                                   |
| Aggregate suppression                | **Pass** | Published groups meet the minimum of five; smaller groups are suppressed or omitted.                       |
| Quarantine taxonomy                  | **Pass** | All 12 stable reason codes and six outcome classes are schema/contract tested.                             |
| Privacy boundary                     | **Pass** | Snapshot-only quarantine requires null source ID; reports/logs/errors contain no payload content or paths. |
| Integrity checks                     | **Pass** | `foreign_key_check`, `integrity_check`, and `quick_check` pass.                                            |
| Query plans/indexes                  | **Pass** | Representative roster/applicability plans use the reviewed child-side indexes.                             |
| Ignore checks                        | **Pass** | SQLite targets, runtime reports, and protected outputs are ignored and uncommitted.                        |
| Authoritative import                 | **Pass** | 216,979 rows processed; safe reconciliation passes with deterministic rerun.                               |
| Performance/memory                   | **Pass** | Approximately 3.5 seconds and ~304 MiB total peak RSS; parser remains bounded to one tuple/chunk.          |

## Repository quality and acceptance

| Criterion                            | Status   | Evidence                                                                                         |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------ |
| Deterministic install                | **Pass** | `npm ci` succeeds with pinned npm and lockfile.                                                  |
| Format/lint/type/tests               | **Pass** | Pre-convergence checks pass; 49 tests across 10 files.                                           |
| Production build                     | **Pass** | Adapter-node build succeeds.                                                                     |
| Relative links/trailing whitespace   | **Pass** | Tracked and untracked Phase 3 candidates pass direct scans.                                      |
| Sensitive overlap                    | **Pass** | Count-only protected-value scan reports no admitted Phase 3 overlap.                             |
| Allowed paths/diff                   | **Pass** | Changes remain within approved Phase 3/coordinator integration paths; `git diff --check` passes. |
| Reproducible normalized schema       | **Pass** | Schema and migrations recreate the same contract from empty storage.                             |
| Synthetic and authoritative importer | **Pass** | Both approved sources import and reconcile.                                                      |
| Prohibited historical data absent    | **Pass** | No legacy people/accounts/access/individual attempt/result history enters operational tables.    |
| Staging protection                   | **Pass** | Authoritative database/report remain local, owner-only, ignored, and uncommitted.                |

**Overall Phase 3 acceptance gate: Pass.** Final repository-wide commands are recorded in the
Phase 3 summary.
