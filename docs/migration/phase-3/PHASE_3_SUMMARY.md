# Phase 3 Summary — Target Schema and Data Importer

## Status

**Phase 3 is complete and its acceptance gate passes. Stop before Phase 4 and before committing.**

The canonical schema milestone completed before importer, reconciliation, and harness work began.
Schema/migration ownership remained exclusive to 3A; package writes were serialized by the
coordinator; protected and legacy inputs remained read-only.

## Tranche results

| Tranche             | Status   | Result                                                                                                                                                            |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3A canonical schema | **Pass** | 64-table schema, deterministic identifiers, six ordered migrations including foundation, constraints/indexes, contract, and nine tests.                           |
| 3B importer         | **Pass** | Bounded state-machine parser, all 15 dispositions, deterministic atomic/idempotent transforms, safe aggregation/quarantine, CLI, and nine tests.                  |
| 3C reconciliation   | **Pass** | Deterministic count-only JSON/Markdown reports, logical comparison, all safety checks/taxonomies, CLI, and five tests.                                            |
| 3D harness          | **Pass** | Shared commands, actual MariaDB fixture load, expected-profile/golden coverage, rollback/idempotence/equivalence/integrity tests, CI, and safe authoritative run. |

## Schema and migration decisions

- Imported target IDs are deterministic UUIDv5 values under the fixed schema namespace; source IDs
  remain explicit mapping attributes.
- Instants use UTC RFC 3339 milliseconds; dates use ISO calendar form; effective ranges are
  half-open.
- Historical TPO/SPO/EO remains separate from the empty Phase/Task/Subtask/Element/Bloom hierarchy.
- Imported questions and legacy templates are versioned and generation-blocked; no template
  lineage or future curriculum mapping is inferred.
- Future operational identity, exam, attempt, correction, remediation, retention, and export
  structures exist but receive no legacy operational rows.
- Historical aggregates are isolated, enforce a five-member publication floor, and cannot join
  into current attempts.
- Restricted quarantine has stable reasons, no operational foreign key, and strips snapshot-only
  generated/source linkage.
- Ordered migrations `0000`–`0005` are reviewed with synchronized Drizzle metadata.

## Source disposition and import result

All 15 source tables have executable inventory and reconciliation handling. The authoritative run
processed 216,979 rows: 1,167 accepted, 5,987 quarantined outcomes, 29,658 excluded, 180,167
aggregated, and 76 suppressed. Detailed safe counts appear in
[AUTHORITATIVE_IMPORT_SUMMARY.md](AUTHORITATIVE_IMPORT_SUMMARY.md).

The target contains zero future hierarchy rows and zero prohibited operational identity/session/
exam/attempt/answer rows. Both legacy template shapes remain distinct. Published historical groups
meet the five-member floor, and all integrity/reconciliation checks pass.

## Dependency and shared configuration changes

- Added dev-only `tsx` 4.23.0 for tsconfig-aware server migration CLIs.
- Added migration command scripts to `package.json` and the deterministic lockfile.
- CI now migrates, imports, reconciles, and verifies synthetic data only.
- `DEVELOPMENT.md` documents safe local/authoritative commands and output boundaries.
- Drizzle metadata is excluded from general Prettier rewriting and remains schema-owner generated.

No production dependency, ORM, or SQLite driver changed.

## Verification result

The final integrated suite passes 49 tests across 10 files. Empty migration,
synthetic import, rollback, rerun idempotence, two-target equivalence, authoritative import/rerun,
all 15 dispositions, mappings, suppression, quarantine privacy, FK/integrity/quick checks, and
representative index plans pass. The actual synthetic MySQL fixture loaded successfully in a
disposable MariaDB container.

The optimized authoritative import completes in approximately 3.5 seconds. Focused measurement
reports approximately 304 MiB total peak RSS, about 96 MiB above the loaded runtime baseline.

## Remaining issues and future owners

| Item                                           | Status / owner                                                                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Quarantine review/approval UI                  | Not implemented; future authorized content-governance owner. No quarantined record is operational.                     |
| Future curriculum mappings                     | Empty by design; Phase 5 content owner must create reviewed mappings.                                                  |
| Authentication and operational domain behavior | Schema only; Phase 4 and later feature owners.                                                                         |
| Backup/restore and retention enforcement       | Phase 10 operations/hardening owner under the existing manual-snapshot exception.                                      |
| Development dependency audit                   | Existing 3 low/4 moderate development-only findings remain; production dependencies are clear. Phase 10 must reassess. |

No unresolved issue materially changes the schema/importer contract.

## File inventory

Modified:

- `.github/workflows/ci.yml`, `.prettierignore`, `DEVELOPMENT.md`, `package.json`, and
  `package-lock.json`
- `src/lib/server/db/schema.ts`, `drizzle/meta/_journal.json`, and
  `tests/foundation/database/database.test.ts`

Created:

- `src/lib/server/db/schema/content.ts`, `core.ts`, `curriculum.ts`, `index.ts`, `migration.ts`,
  and `operations.ts`
- `drizzle/0001_canonical_schema.sql`, `0002_generation_eligibility.sql`,
  `0003_retention_links.sql`, `0004_quarantine_privacy_boundary.sql`, and
  `0005_join_indexes.sql`
- `drizzle/meta/0001_snapshot.json` through `0005_snapshot.json`
- `src/lib/server/migration/importer/identifiers.ts`, `importer.ts`, `index.ts`, `parser.ts`,
  `source-shape.ts`, and `types.ts`
- `src/lib/server/migration/reconciliation/contracts.ts`, `index.ts`, `reconcile.ts`, and
  `render.ts`
- `scripts/migration/import-legacy.ts`, `reconcile.ts`, and `verify-migration.ts`
- `tests/migration/schema/schema.test.ts`, `tests/migration/importer/importer.test.ts`,
  `tests/migration/importer/parser.test.ts`,
  `tests/migration/reconciliation/reconciliation.test.ts`, and
  `tests/migration/harness/migration-harness.test.ts`
- `fixtures/phase-3/README.md`
- `docs/migration/phase-3/3A-canonical-schema.md`, `3B-importer.md`,
  `3C-reconciliation.md`, `3D-test-harness.md`, `SCHEMA_CONTRACT.md`, `SCHEMA_DECISIONS.md`,
  `IMPORTER_CONTRACT.md`, `RECONCILIATION_CONTRACT.md`, `QUARANTINE_WORKFLOW.md`,
  `AUTHORITATIVE_IMPORT_SUMMARY.md`, `MIGRATION_VERIFICATION_MATRIX.md`, and this summary

## Stop boundary

No commit, push, merge, branch switch, Phase 4 authentication, or later feature implementation
occurred. Generated databases and authoritative reports remain ignored; the primary staging
database remains local and protected.
