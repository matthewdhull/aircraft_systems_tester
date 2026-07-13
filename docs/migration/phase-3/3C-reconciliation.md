# Tranche 3C — Anomaly and Reconciliation Foundation

## Outcome

Tranche 3C provides deterministic, privacy-safe reconciliation over a migrated
SQLite database. It verifies all 15 approved source-table dispositions, imported
curriculum relationships, safe question dimensions, legacy template-source
separation, source-to-target mapping coverage, empty future hierarchy tables,
aggregate publication floors, quarantine isolation, and SQLite integrity.

The implementation deliberately does not read or render prompts, options,
answers, quarantine payloads, people, credentials, access values, generated-test
identifiers, individual dates, or database paths. Reports contain only approved
checksums, vocabulary names, table names, reason/status codes, counts, and pass or
fail results.

## Components

- `contracts.ts` defines the versioned report, comparison, reason-code, status,
  and source-disposition contracts.
- `reconcile.ts` reads safe counts and performs relationship, privacy, aggregate,
  foreign-key, integrity, and quick checks.
- `render.ts` creates stable JSON and Markdown representations.
- `scripts/migration/reconcile.ts` is a fail-closed CLI for one-database
  reconciliation or two-database logical comparison.

No additional runtime dependency is needed. The CLI uses `better-sqlite3`, the
single driver selected in Phase 2, and the repository TypeScript runner selected
by the coordinator.

The low-level command accepts explicit protected output locations. Those outputs
must remain ignored and local:

```sh
node --import tsx scripts/migration/reconcile.ts \
  --database <temporary-target.sqlite> \
  --json <protected-report.json> \
  --markdown <protected-report.md>

node --import tsx scripts/migration/reconcile.ts \
  --database <first-target.sqlite> \
  --compare <second-target.sqlite> \
  --json <protected-comparison.json> \
  --markdown <protected-comparison.md>
```

The tranche 3D command surface wraps these options for the synthetic and
authoritative workflows.

## Safety behavior

- A database with zero or multiple import runs must be addressed explicitly; an
  ambiguous run is never guessed.
- Missing inventory entries or disposition mismatches fail reconciliation.
- Any imported Phase, Task, Subtask, Element, Bloom, identity, exam, attempt, or
  answer row fails the relevant boundary check.
- A published historical group below five fails reconciliation.
- Snapshot-only quarantine content must use `usedQuestions`, omit `source_id`,
  retain a restricted payload, and remain disconnected from operational tables.
- Logical comparison hashes canonical rows only in memory. Hashes and protected
  row values are never returned or written to reports; differences expose only
  approved table names and row counts.
- The CLI emits only a generic success or failure message to the terminal.

## Verification

Focused tests cover complete and incomplete source inventories, all five safe
question-type buckets, deterministic JSON and Markdown, protected-value absence,
and equivalent/different independent imports without content disclosure.

```sh
npm test -- --run tests/migration/reconciliation/reconciliation.test.ts
npm run check
npm run lint
```

End-to-end importer and authoritative-export reconciliation are owned by tranche
3D and use the same library contract.
