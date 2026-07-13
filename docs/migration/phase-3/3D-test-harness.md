# Phase 3D — Migration Test Harness

## Scope

The coordinator harness binds the canonical schema, importer, and reconciliation contracts into
one repeatable command surface. It uses the Phase 1 synthetic fixture in tests and CI. The
authoritative export runs only in the approved local offline environment and produces safe counts
under ignored storage.

## Command surface

| Command                                                       | Purpose                                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run migration:migrate -- <target>`                       | Create and verify a freshly migrated empty SQLite database.                           |
| `npm run migration:profile:fixture`                           | Emit only the approved synthetic checksum and per-table counts.                       |
| `npm run migration:import:fixture -- --target <target>`       | Import the synthetic fixture transactionally.                                         |
| `npm run migration:import:authoritative -- --target <target>` | Checksum-gate and import the protected source locally.                                |
| `npm run migration:reconcile -- --database <target> ...`      | Produce safe JSON/Markdown reconciliation or compare two targets.                     |
| `npm run migration:verify -- <target>`                        | Verify migrations, integrity, zero future hierarchy, and prohibited operational rows. |

Targets and reports belong under `.runtime/` or an OS temporary directory. Commands never print a
target/source path or protected row value.

## Automated coverage

The harness verifies the 15-table synthetic source shape, `expected-profile.json`, all 67 golden
manifest references, clean migration, controlled rollback, same-target idempotence, two-target
logical equivalence, source mappings, reconciliation, zero future hierarchy, prohibited historical
operational absence, foreign keys, integrity/quick checks, and ignore rules.

The deferred actual MySQL-compatible test loaded `schema.sql` followed by `data.sql` into a
disposable MariaDB 11.4 container. It completed successfully with 15 tables; the container was
then removed. No protected source entered the container.

## Privacy boundary

CI uses synthetic inputs only. Authoritative imports, databases, reports, performance captures,
and restricted quarantine artifacts remain ignored and local. Verification records only safe
counts, checksums, timings, suppression/anomaly totals, and integrity results.

The final authoritative import processed 216,979 rows in approximately 3.5 seconds. A focused
resource measurement reported about 304 MiB total peak RSS, roughly 96 MiB above the loaded
TypeScript/schema baseline. The parser keeps a 64 KiB chunk and one tuple in memory; reusable SQL
statements are cached and high-cardinality distinct-member state is SQLite-managed temporary data.
