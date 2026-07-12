# Phase 1A — Sanitized representative source fixture

## Outcome

The fixture under `fixtures/phase-1/legacy-source/` is entirely synthetic and
preserves the authoritative export's MySQL table/column/key shape needed for
future importer characterization. It contains all 15 source table definitions,
but rows only for approved migratable curriculum, question, variant, and
template sources.

## Evidence and design boundary

The source inventory establishes 15 MyISAM/`latin1` tables, 12 primary keys, no
foreign keys, and no keys on `stamp`, `testModel`, or `usedQuestions`
([0A database discovery](../phase-0/0A-database-discovery.md#historical-schema-inventory-newest-checked-in-production-dump)).
Its logical relationships and intentionally unenforced edges are documented in
the same report
([relationship evidence](../phase-0/0A-database-discovery.md#logical-relationships-and-enforcement-gaps)).

The fixture applies the authoritative table dispositions exactly: seven tables
are migration/template sources, four are aggregate/generated-content-only, and
four are excluded
([source disposition](../phase-0/SOURCE_EXPORT_DISPOSITION.md#table-level-disposition)).
Identifiable history and generated-exam histories are absent. This is stricter
than merely substituting fake credentials: those rows are unnecessary for this
fixture and are therefore not admitted.

## Coverage

| Table | Fixture treatment | Expected outcome |
| --- | --- | --- |
| `TPO` | One synthetic root | Migrate as historical label |
| `SPO` | Two valid children and one orphan | Migrate two; quarantine one |
| `EO` | Three valid children and one orphan | Migrate three; quarantine one |
| `variant` | Two synthetic values | Stage for controlled-vocabulary review |
| `questions` | Eight synthetic rows covering `tf`, `mc`, `c2`, `ac`, and `nc` | Accept five; quarantine zero-sentinel, parent-mismatch, and duplicate-candidate rows |
| `test_model` | One wide model | Stage without inferred lineage |
| `testModel` | Two category rows and one mandatory row for one model | Stage/reconcile without inferred lineage |
| `createdTests` | Schema only | Aggregate-only disposition; no generated history admitted |
| `usedQuestions` | Schema only | No generated history or snapshot content admitted |
| `studentTestRecords` | Schema only | Aggregate-only disposition; no attempts admitted |
| `testResults` | Schema only | Aggregate-only disposition; no individual results admitted |
| `instructors` | Schema only | Exclude |
| `logins` | Schema only | Exclude |
| `stamp` | Schema only | Exclude |
| `test_info` | Schema only | Exclude |

`expected-profile.json` makes row counts, type counts, relationships, anomaly
counts, template totals, and all 15 dispositions machine-readable. The source's
observed zero-sentinel and EO/SPO mismatch classes are repository evidence
([0A anomaly profile](../phase-0/0A-database-discovery.md#derived-relationship-anomalies-in-the-november-2014-snapshot));
the fixture uses new synthetic IDs and text to exercise those classes.

## Question and template shapes

The five populated question shapes correspond to the repository-observed type
codes and field usage, while target acceptance remains governed by the approved
validation contract
([owner decisions](../phase-0/OWNER_DECISIONS.md#questions-models-and-generation)).
One ordinary question has alternate wording and the other rows exercise `NULL`
in inapplicable answer/wording columns. A synthetic TPO label uses an explicit
latin1 hex literal containing one non-ASCII byte, so importer decoding can be
checked without borrowing protected source text.

The row-oriented template represents category counts with non-null `count` and
null `eo_id`, and a mandatory element with null `count` and non-null `eo_id`, as
observed in repository code
([business-rule discovery](../phase-0/0C-business-rules.md#model-composition)).
The wide and row-oriented formats remain separate staging inputs; the fixture
does not assert lineage between them.

## Privacy and hierarchy controls

No Phase, Task, Subtask, Element, or Bloom tables or rows are present. Phase 0
requires target hierarchy content to begin empty and forbids interpreting legacy
SPO/EO IDs as target task IDs
([task-hierarchy recovery gap](../phase-0/SOURCE_EXPORT_DISPOSITION.md#task-hierarchy-recovery-gap)).

No historical aggregate is expected from this fixture because every
history-bearing table is empty. Any later aggregate fixture must use at least
five synthetic members, matching the approved suppression rule
([aggregate contract](../phase-0/SOURCE_EXPORT_DISPOSITION.md#privacy-safe-aggregate-contract)).

Sensitive-overlap validation compares candidate tokens through one-way digests
and returns only counts and pass/fail status. It must never emit a matched token.
The fixture intentionally uses conspicuous `Synthetic`/`SYN` namespaces so a
reviewer can identify its provenance without consulting protected evidence.

## Deferred transformation questions

None is schema-blocking. A future importer still needs reason-code names and a
review workflow for the enumerated quarantines. It must also preserve both
template sources in staging and avoid asserting that `SYN001` and wide model
`501` share lineage merely because their synthetic totals happen to agree.

## Offline limitation

This fixture characterizes the owner-designated 2014 export shape and approved
dispositions. It does not claim a live database load, live runtime observation,
or production capture; Phase 0 records that the system is offline.
