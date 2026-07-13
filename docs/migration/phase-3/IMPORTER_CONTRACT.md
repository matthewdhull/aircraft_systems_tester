# Phase 3 Importer Contract — Version 1

## Boundary

The importer consumes only the two approved source identities below. A source is
accepted only when its path selection, byte size, and SHA-256 all match the
compiled command registry.

| Selection       | Purpose                        |       Size | SHA-256                                                            |
| --------------- | ------------------------------ | ---------: | ------------------------------------------------------------------ |
| `fixture`       | Synthetic Phase 1 data fixture |      3,610 | `a8e02025608f7ca1cbd3020fed7863dba9128938b303a97643a59e746b169eec` |
| `authoritative` | Owner-approved 2014 export     | 15,472,302 | `ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70` |

The importer never accepts an arbitrary path/checksum pair through its CLI. The
authoritative export remains read-only. Target databases and restricted
quarantine are local protected artifacts and must remain ignored.

## Parsing contract

The parser is an incremental state machine with a 64 KiB input window, a 64 KiB
header limit, and one source tuple in memory. It does not buffer a complete dump
or multi-row INSERT statement. It handles:

- positional and explicit-column multi-row `INSERT` statements;
- quoted commas and parentheses, doubled quotes, MySQL backslash escapes, `NULL`,
  numeric lexemes, and `_latin1 0x...` literals;
- line comments, block comments, and MySQL conditional directives; and
- deliberate MySQL `latin1`/Windows-1252 decoding into JavaScript Unicode, which
  SQLite persists as UTF-8.

Numeric lexemes remain strings until a specific transformation validates and
converts them. Source identifiers therefore retain their decoded source
representation without numeric coercion. A structural scan verifies the 15
declared tables when declarations are present. Any inserted table outside the
approved inventory fails the import.

## Transaction and identity contract

One `BEGIN IMMEDIATE` transaction covers the import-run record, all accepted
transformations, quarantine, aggregates, inventory, mappings, and completion.
Any parser, validation, or persistence failure rolls it all back. Errors exposed
to callers are generic and contain no source value or filesystem path.

Imported identities use the namespace and name formula in
[SCHEMA_CONTRACT.md](SCHEMA_CONTRACT.md). Imported timestamps use the stable
migration instant `2014-01-01T00:00:00.000Z`; they are not claims about source
event time. A completed checksum/importer-version pair is returned on rerun
without writing duplicates. Independent fresh imports therefore produce the
same canonical and mapping identities.

## Executable dispositions

| Source                                        | Behavior                                                                                                                                              | Mapping targets                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `TPO`                                         | Validate and migrate; invalid rows are rejected to quarantine.                                                                                        | `legacy_tpos`                                             |
| `SPO`                                         | Migrate only with an accepted TPO parent.                                                                                                             | `legacy_spos`                                             |
| `EO`                                          | Migrate only with an accepted SPO parent.                                                                                                             | `legacy_eos`                                              |
| `variant`                                     | Migrate nonzero, nonblank values in review state.                                                                                                     | `aircraft_variants`                                       |
| `questions`                                   | Validate variant, faithful SPO/EO/TPO chain, duplicate status, and one of five shapes; accepted versions remain review/blocked.                       | `questions`, `question_versions`                          |
| `test_model`                                  | Preserve each wide definition and its nonzero opaque legacy rules.                                                                                    | `legacy_template_sources`                                 |
| `testModel`                                   | Preserve each logical row-form source separately from the wide source; preserve each row as a rule.                                                   | `legacy_template_sources`, `legacy_template_source_rules` |
| `createdTests`                                | Discard identifiers, instructor, access values, and exact times; aggregate only reliable year/template/course/length dimensions.                      | aggregate only                                            |
| `usedQuestions`                               | Count already migrated content; place unique recoverable content only in restricted quarantine with all generated/source linkage removed.             | no operational mapping                                    |
| `studentTestRecords`                          | Discard person, instructor, generated-test, and exact-date linkage; aggregate only safe dimensions. Distinct group membership is counted transiently. | aggregate only                                            |
| `testResults`                                 | Aggregate only when a direct accepted question mapping makes the join reliable; discard person and generated-test linkage.                            | aggregate only                                            |
| `instructors`, `logins`, `stamp`, `test_info` | Exclude every row and retain counts only.                                                                                                             | none                                                      |

All 15 inventory rows are written even for empty source tables. `accepted_count`
counts accepted source rows, including each accepted row-form template rule.
`aggregated_count` counts source rows incorporated into a safe aggregate.
`excluded_count`, `quarantined_count`, and `suppressed_count` are disjoint safe
outcomes.

No import path writes users, sessions, current rosters, future hierarchy,
future curriculum mappings, active template versions, exams, attempts, answers,
or reports. TPO/SPO/EO identities are never reused as Phase/Task/Subtask/Element
identities.

## Question normalization

| Source type | Canonical type         | Required shape                                       |
| ----------- | ---------------------- | ---------------------------------------------------- |
| `tf`        | `true_false`           | One true/false key; canonical True and False options |
| `mc`        | `single_choice`        | Exactly one correct and three incorrect options      |
| `c2`        | `two_correct_compound` | Exactly two correct and one incorrect option         |
| `ac`        | `all_correct`          | Exactly three correct and no incorrect option        |
| `nc`        | `none_correct`         | No correct and exactly three incorrect options       |

Every accepted question requires a primary prompt, distinct option text, an
accepted aircraft variant, and a proven TPO → SPO → EO chain. Alternate prompts
are version-owned prompt rows. Duplicate fingerprints are deterministic but the
content is never emitted.

## Privacy-safe aggregation and quarantine

Published aggregate cells require at least five distinct members or
observations, as applicable. Smaller cells remain `suppressed` and receive the
stable `aggregate_group_suppression` reason. An unreliable join is excluded with
`unreliable_historical_join`; it is never repaired by inference.

Snapshot-only restricted payloads contain only the recoverable question shape.
Their quarantine metadata always uses `source_table = usedQuestions` and a null
`source_id`; generated-test IDs, legacy snapshot row IDs, people, dates, and
access linkage are not retained. Quarantine has no operational foreign key and
cannot affect active content, generation, or reporting.

## Command interface

The coordinator may expose package aliases for these owned commands. The direct
entry points are:

```sh
npx --no-install tsx scripts/migration/import-legacy.ts --source fixture --profile
npx --no-install tsx scripts/migration/import-legacy.ts --source fixture --dry-run
npx --no-install tsx scripts/migration/import-legacy.ts --source fixture --target <ignored-sqlite-path>
npx --no-install tsx scripts/migration/import-legacy.ts --source authoritative --target <ignored-sqlite-path>
```

`--profile` emits only checksum, table names, and row counts. `--dry-run` imports
into an in-memory SQLite database. Normal execution emits safe outcome counts,
the deterministic run identifier, checksum, and status. It never emits source
rows, question content, answer material, identity/access data, or target paths.
