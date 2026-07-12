# Phase 0A — Database discovery

## Scope, safety, and evidence status

This is a repository-only discovery report prepared on the `system_discovery`
branch. It does **not** claim to describe the current production database. No
database connection was made and no credentials were used. Record values were
not reproduced: in particular, this report contains no credential values,
personal data, question or answer content, or exam-access codes.

Evidence labels used below:

- **Confirmed — repository:** directly observable in checked-in SQL or PHP.
- **Derived — repository:** a count or anomaly calculated from checked-in dump
  structure/data without reproducing values. These findings describe that dump
  only and should be independently reconciled.
- **Inferred:** a likely relationship or intent expressed by code but not
  enforced by the checked-in schema.
- **External dependency:** requires protected live access or an owner decision.

Phase 0 asks 0A to acquire and profile the live schema; the acceptance gate
requires understood drift and no target-schema-changing open questions
([`MIGRATION_PLAN.md`](../../../MIGRATION_PLAN.md#L636)). Repository evidence can
establish risk and prepare the live queries, but cannot satisfy those live-data
requirements.

## Sources and method

- Twenty-six SQL dumps under [`backups/`](../../../backups/) span May 2011 to
  November 2014. They are historical exports, not current snapshots. Six
  representative production/development milestones were compared structurally.
- The newest checked-in export is
  [`backups/xjtest_production_backup.11.22.14.sql`](../../../backups/xjtest_production_backup.11.22.14.sql#L1),
  generated 2014-11-23 from MariaDB 5.3.12. Its dump header selects
  `NO_AUTO_VALUE_ON_ZERO`, UTC, and `SET NAMES utf8`, while every declared table
  is MyISAM with `latin1` default charset.
- The two copies of the one-page schema PDF are byte-identical. The SQL is more
  detailed and was treated as the schema evidence.
- Approximate volumes below count row tuples in the exports. Relationship checks
  compare numeric identifiers without printing row contents. They are diagnostic
  results, not an authoritative migration reconciliation.
- PHP query and data-access usage was compared with the dump DDL. Current code
  depends on column-order `INSERT ... VALUES (...)` in many places, so the
  physical column order is behaviorally significant until replaced.

## Historical schema inventory (newest checked-in production dump)

The November 2014 snapshot defines 15 tables. Only 12 have a primary key;
`stamp`, `testModel`, and `usedQuestions` have none. No foreign keys, unique
constraints, or secondary indexes are declared. The DDL adds only primary keys
and auto-increment properties
([DDL starts](../../../backups/xjtest_production_backup.11.22.14.sql#L29),
[`ALTER TABLE` section](../../../backups/xjtest_production_backup.11.22.14.sql#L217637)).

| Table | Fields in dump order (type summary) | Key / repository-observed rows | Repository-supported role |
|---|---|---:|---|
| `createdTests` | `genTestID` uint, `testModelID` uint, `genDate` timestamp, `course_type` char(10), `length` uint, `instructorID` char(10), `testPassword` char(25), `overridePassword` varchar(25) | PK `genTestID`; ~473 | Generated-exam header and access data. Contains secrets and an instructor identifier; must be protected. |
| `EO` | `eo_id` uint, `spo_id` uint, `eo_no` uint, `element_name` char(250) | PK `eo_id`; ~213 | Legacy curriculum element under an SPO. |
| `instructors` | `instructorID` uint, `employeeNo` char(10), `firstName` char(50), `lastName` char(50), `password` char(255), `admin` boolean-like tinyint | PK `instructorID`; ~17 | Instructor/admin account and identity data. Contains credentials and personal data. |
| `logins` | `loginID` uint, `password` varchar(25), `override` varchar(25), `genTestID` int, `attemptCount` int, `studentEmpNo` char(7) | PK `loginID`; ~2,471 | Exam-access/re-entry record. Contains access secrets and personal identifiers. |
| `questions` | `questionID` uint, `category` char(25), `subcategory` char(25), `spo_id` uint, `eo_id` uint, `variant_id` tinyuint, `type` char(10), three nullable correct-answer fields, three nullable alternate/wrong-answer fields, `question_a` text, nullable `question_b` text | PK `questionID`; ~657 | Source question bank. Contains protected question and answer material. |
| `SPO` | `spo_id` uint, `tpo_id` uint, `spo_number` uint, `spo_name` char(250) | PK `spo_id`; ~19 | Legacy curriculum objective under a TPO. |
| `stamp` | `genDate` date, `stampin` timestamp | No key; 0 dumped rows | Apparent timestamp/staging utility; no PHP query reference was found. Disposition requires confirmation. |
| `studentTestRecords` | `recordID` uint, employee identifier and names, class/test dates, instructor identifier, syllabus, qualification code, `genTestID`, retraining flag, result, score | PK `recordID`; ~2,148 | Attempt/result summary. Contains personal and training record data. |
| `testModel` | `test_model_id` varchar(10), `variant_id` tinyuint, `spo_id` tinyuint, nullable `count`, nullable `eo_id`, course type, test length, name | No key; ~316 component rows | Newer row-oriented test model, one model represented by multiple category/mandatory-element rows. |
| `testResults` | `resultID` uint, employee identifier, `genTestID`, `questionID`, correctness flag | PK `resultID`; ~169,062 | Per-question grading result. Contains personal-linked assessment results. |
| `test_info` | `testID` uint, `modelID` uint, date | PK `testID`; 0 dumped rows | Apparently obsolete legacy link table; no active PHP query reference was found. |
| `test_model` | `testID` uint, course type, length, then 25 fixed category-count columns including `mandatory` | PK `testID`; ~7 | Older wide test-template implementation. Coexists with `testModel`. |
| `TPO` | `tpo_id` uint, `tpo_number` uint, `tpo_name` char(250) | PK `tpo_id`; ~1 | Legacy curriculum root. |
| `usedQuestions` | `genTestID`, `questionID`, type, `spo_id`, subcategory, snapshotted question text, four option fields, answer key | No key; ~41,593 | Generated-exam question snapshot. Contains protected question/answer material. |
| `variant` | `variant_id` tinyuint, `variant_name` varchar(10) | PK `variant_id`; ~2 | Aircraft/product variant lookup. |

The observed question-type counts in this historical snapshot are `mc` 512,
`tf` 77, `c2` 33, `ac` 30, and `nc` 5. This is **derived repository evidence**,
not proof of the types or semantics accepted by production today. PHP recognizes
those five codes ([`Classes/testClass.php`](../../../Classes/testClass.php#L91)).

## Logical relationships and enforcement gaps

The following graph is inferred from names and joins; none of its edges is a
declared foreign key:

```text
TPO -> SPO -> EO -> questions <- variant
                    |              |
                    |              +-> usedQuestions <- createdTests -> logins
                    |                        |               |
                    +-> testModel            +-> testResults  +-> studentTestRecords
                            ^                         ^
                            +------ createdTests? ----+
```

Relationship details:

- `SPO.tpo_id -> TPO.tpo_id`, `EO.spo_id -> SPO.spo_id`, and historical
  `questions.(spo_id, eo_id) -> (SPO, EO)` are confirmed as code/dump intent.
- `questions.variant_id -> variant.variant_id` and `testModel.variant_id ->
  variant.variant_id` are inferred from the lookup and model code
  ([`Classes/testClass.php`](../../../Classes/testClass.php#L107),
  [`Classes/test_model.php`](../../../Classes/test_model.php#L61)).
- `createdTests.genTestID` is the logical parent for `usedQuestions`, `logins`,
  `studentTestRecords`, and `testResults`. `questions.questionID` is the source
  reference in `usedQuestions` and `testResults`; the copied fields in
  `usedQuestions` preserve generated content independently
  ([`Classes/Exam.php`](../../../Classes/Exam.php#L173)).
- Instructor references use the employee identifier (`char`) in generated tests
  and student records rather than the numeric `instructors.instructorID` PK.
  No uniqueness constraint exists on `instructors.employeeNo`.
- `createdTests.testModelID` is unsigned integer, but newer `testModel.test_model_id`
  is a generated six-character string. The field can naturally refer to the old
  integer `test_model.testID`, not the newer model identifier. Current PHP writes
  the newer string into this integer field
  ([`Classes/test_model.php`](../../../Classes/test_model.php#L103),
  [`Classes/Exam.php`](../../../Classes/Exam.php#L173)). This is a material type
  contradiction requiring live-schema and deployed-code confirmation.
- `testModel` and `usedQuestions` lack even candidate uniqueness enforcement.
  `testResults` has only a surrogate PK, so the schema permits multiple result
  rows for the same student/generated-test/question combination.

### Derived relationship anomalies in the November 2014 snapshot

These checks are safe aggregate diagnostics against one historical file. They
must not be generalized to live production:

- 35 questions use zero for both legacy `spo_id` and `eo_id` even though both
  columns are declared `NOT NULL`; zero has no matching curriculum row.
- 8 additional questions have an EO whose recorded SPO parent differs from the
  question's own SPO.
- All nonzero SPO-to-TPO and EO-to-SPO references, and all question variant
  references, resolved within this snapshot.
- `usedQuestions` has ~4,492 rows across 137 generated-test IDs absent from
  `createdTests`, and ~1,175 rows across 27 source-question IDs absent from
  `questions`. Deleted source questions can be compatible with immutable
  snapshots, but missing generated-test headers require a disposition decision.
- `testResults` has ~346 rows across 25 absent generated-test IDs and ~5,414 rows
  across 21 absent source-question IDs.
- `studentTestRecords` has 3 rows whose generated-test IDs are absent; `logins`
  has ~71 rows across 68 absent generated-test IDs.

Possible explanations include deletion, partial exports, application defects,
or intentional retention differences. No explanation is promoted to a
requirement without live evidence and owner confirmation.

## Schema drift timeline

| Snapshot | Tables / material shape | Approximate volume markers |
|---|---|---|
| 2011-05 production | 9 tables; no curriculum tables or login table; 12-column question shape; no override field on generated tests | 262 questions, 44 generated tests, 76 result summaries, 5,686 per-question results |
| 2011-11 production | Adds `TPO`, `SPO`, and `logins`; questions gain a free-form `spo` field; generated tests gain override access | 265 questions, 64 generated tests, 449 summaries |
| 2012-06 production | Same 12-table family; historical use grows | 265 questions, 148 generated tests, 986 summaries |
| 2013-07-08 production | 12 tables; `questions.spo` remains free-form; no `EO`; `SPO/TPO` numbers are nullable character fields | 270 questions, 245 generated tests, 1,220 summaries |
| 2013-07-12 development | Adds `EO`; replaces `questions.spo` with numeric `spo_id` and `eo_id`; curriculum numbers change to required unsigned integers | 271 questions, 213 EOs, 1,239 summaries |
| 2014-11 production | 15 tables; adopts the 2013 numeric TPO/SPO/EO question links, adds `variant`, adds `questions.variant_id`, adds `usedQuestions.spo_id`, and adds row-oriented `testModel` beside wide `test_model` | 657 questions, 473 generated tests, 2,148 summaries, 169,062 per-question results |

Evidence for the endpoints of this timeline is in the 2011 question DDL
([`5.18.11`](../../../backups/xjtest_production_backup.5.18.11.sql#L123)), the
2013 production question DDL
([`7.8.13`](../../../backups/xjtest_production7.8.13.sql#L1674)), the 2013
development question DDL
([`7.12.13`](../../../backups/xjtest_development7.12.13.sql#L1901)), and the 2014
production question and model DDL
([`11.22.14`](../../../backups/xjtest_production_backup.11.22.14.sql#L3289),
[`testModel`](../../../backups/xjtest_production_backup.11.22.14.sql#L6208)).

## Current task-modeling code versus every checked-in dump

Current PHP expresses a third schema generation that no checked-in dump fully
defines:

| Code expectation | Implied fields / relationship | Dump comparison |
|---|---|---|
| `Phase` | `Id`, `Number`, `Name`, `bloomId` | Absent from all dumps. Query joins Bloom by ID ([`Classes/phase.php`](../../../Classes/phase.php#L45)). |
| `Task` | `Id`, `PhaseId`, `Number`, `Name`, `Description`, `bloomId` | Absent from all dumps ([`Classes/task.php`](../../../Classes/task.php#L35)). |
| `Subtask` | `Id`, `TaskId`, `Number`, `Name`, `Description`, `bloomId` | Absent from all dumps ([`Classes/subtask.php`](../../../Classes/subtask.php#L27)). |
| `Element` | `Id`, `SubtaskId`, `Number`, `Name`, `Description` | Absent from all dumps ([`Classes/element.php`](../../../Classes/element.php#L28)). |
| `blooms_taxonomy` | `Id`, `ordinality`, `level`, `key_verb` | Absent from all dumps ([`Classes/blooms.php`](../../../Classes/blooms.php#L39)). |
| Extended `questions` | New `subtask_id` and `element_id`, apparently appended after the 15 historical fields | Current inserts supply 17 positional values, but the newest DDL has 15 columns. Reads join the new hierarchy ([`Classes/testClass.php`](../../../Classes/testClass.php#L177), [`insert`](../../../Classes/testClass.php#L397), [`hierarchy view`](../../../Classes/testClass.php#L594)). |
| Task-based `testModel` | Existing `spo_id`/`eo_id` columns are repurposed as Subtask/Element IDs | The dump names and types remain legacy; code joins `testModel.spo_id` to `Subtask.Id` and Bloom ([`Classes/test_model.php`](../../../Classes/test_model.php#L198)). |
| Task-based generation | Selects `questions.subtask_id` and mandatory `element_id` | Those columns are absent from the newest dump ([`Classes/Exam.php`](../../../Classes/Exam.php#L97)). |
| Per-answer result storage | Current grading inserts six positional values, including the submitted answer | The dump's `testResults` has only five columns and no submitted-answer field ([`Classes/Exam.php`](../../../Classes/Exam.php#L433), [`dump DDL`](../../../backups/xjtest_production_backup.11.22.14.sql#L6547)). |

The code also mixes old and new paths in the same classes: `test_model.php`
contains both SPO-based and Subtask-based quantity queries
([legacy](../../../Classes/test_model.php#L300),
[task-based](../../../Classes/test_model.php#L339)); question edit reads legacy
`spo_id`/`eo_id` while list/fetch paths join `subtask_id`/`element_id`
([`Classes/testClass.php`](../../../Classes/testClass.php#L659)). Therefore, the
repository cannot answer whether TPO/SPO/EO, Phase/Task/Subtask/Element, or both
are authoritative, nor whether identifiers were mapped, copied, or repurposed.

## Encoding and type risks

- **Confirmed — repository:** dumps declare table charset `latin1` but establish
  a UTF-8 client connection. The newest files contain only ASCII bytes, so they
  do not exercise conversion of extended characters. Live column/table
  collations and byte-level samples must be checked before import.
- **Confirmed — repository:** most textual columns are fixed `CHAR`, including
  question snapshot text/options limited to 255 characters. Current source uses
  `TEXT` for prompts but `CHAR(255)` for answer fields; truncation history is
  unknown.
- **Confirmed — repository:** identifier widths/types conflict across generations
  (numeric vs character curriculum numbers; numeric generated-test model ID vs
  string newer model ID; `char(7)` vs `char(10)` employee identifiers).
- **Confirmed — repository:** flags and scores have no check constraints;
  `test_length` is text in `testModel` but numeric in generated exams and the old
  model table.
- **External dependency:** production SQL mode, server version, engines,
  charsets/collations, zero-date behavior, truncation warnings, and invalid-byte
  frequency are unknown.

## Required live discovery (protected, read-only)

These are external dependencies, not guessed facts. Access should use an
approved read-only account and an approved output/sanitization location.

1. Export authoritative `SHOW CREATE TABLE` output for every table and capture
   database/table/column charset and collation, engine, indexes, triggers,
   routines, views, events, SQL mode, time zone, and exact server/version data.
2. Capture exact row counts (or approved estimates for large tables), storage
   sizes, min/max identifiers and timestamps, and write/change rate. No record
   values belong in ordinary discovery documentation.
3. Run aggregate-only integrity checks for every candidate relationship above,
   duplicate natural keys, duplicate exam-question/result rows, null/zero
   sentinels, model total mismatches, generated exam length vs snapshot count,
   and curriculum parent disagreement.
4. Inventory actual question type codes, string lengths, null/empty patterns,
   boolean/score ranges, and encoding validity as aggregates. Question text,
   answers, access codes, passwords, and identities must remain protected.
5. Determine whether the live schema contains `Phase`, `Task`, `Subtask`,
   `Element`, `blooms_taxonomy`, `subtask_id`, `element_id`, or a submitted-answer
   column in `testResults`; obtain their exact DDL and counts if present.
6. Identify the deployed application revision and trace which model and hierarchy
   each active route actually writes. A live schema alone cannot resolve
   competing-code intent.
7. Confirm backup/export consistency: transaction/snapshot method, whether MyISAM
   writes are quiesced, export completeness, retention, encryption, access
   logging, and secure destruction expectations.

## Owner decisions that block the target schema

Priority is based on likely impact to Phase 1 fixtures and Phase 3 canonical
schema/importer work.

1. **P0 — authoritative hierarchy:** Decide TPO/SPO/EO versus
   Phase/Task/Subtask/Element, and provide a reviewed mapping if both carry
   history. Do not infer a one-to-one mapping from repurposed column names.
2. **P0 — model lineage:** Decide the disposition and relationship of wide
   `test_model`, row-oriented `testModel`, and `createdTests.testModelID`, including
   preservation of generated tests whose template no longer exists.
3. **P0 — historical orphan policy:** Classify snapshot/result/header orphans as
   retained history, partial-export artifacts, deletions, or defects; define what
   the importer preserves, quarantines, or rejects.
4. **P0 — generated snapshot authority:** Confirm whether `usedQuestions` is the
   authoritative record of what was shown/graded when it conflicts with current
   `questions` or has no source row.
5. **P0 — identity keys:** Confirm the stable instructor/student identifier,
   uniqueness rules, identifier width/leading-zero semantics, and mapping of
   instructor numeric PKs to employee identifiers.
6. **P1 blocker — sensitive fixture policy:** Approve classification,
   sanitization, storage, access, and destruction controls before any live export
   becomes a development fixture.
7. **Before canonical import:** Decide the disposition of `stamp`, `test_info`,
   legacy access/login history, and duplicate/obsolete tables; confirm retention
   periods for attempt, answer, score, and access records.

## Initial 0A status before owner attestation

| Criterion / deliverable | Status | Reason |
|---|---|---|
| Historical table/field inventory | **Complete for repository snapshots** | All 15 tables in the newest dump inventoried; representative earlier schemas compared. |
| Historical approximate volumes | **Complete for selected snapshots** | Aggregate tuple counts recorded without record contents. |
| Historical relationship/anomaly scan | **Complete as preliminary evidence** | Candidate edges and aggregate orphan/mismatch counts identified; no FKs exist. |
| Compare dumps with current task-modeling code | **Complete for repository evidence** | Missing tables/columns, mixed hierarchy paths, and model/result type contradictions documented. |
| Authoritative production schema export | **Blocked — live access** | No production connection was authorized; newest dump is from 2014. |
| Current production row counts, encoding, and anomalies | **Blocked — live access** | Historical aggregates cannot establish current state. |
| Every production table has owner/disposition | **Blocked — live access and owner confirmation** | Production inventory is unknown and competing historical/current models lack approved dispositions. |
| Schema drift fully understood | **Blocked — live access and hierarchy/model decisions** | Repository proves drift exists but cannot identify deployed truth or intended mapping. |
| No unresolved question that materially changes target schema | **Not met** | Hierarchy, model lineage, identity keys, retention, orphan treatment, and snapshot authority remain material decisions. |

At the repository-only checkpoint, 0A was a useful discovery baseline but did
not pass the database gate. The owner addendum below supersedes that checkpoint
status.

## Owner decision addendum — July 12, 2026

The product decisions in [OWNER_DECISIONS.md](OWNER_DECISIONS.md) resolve the
policy portions of the earlier owner-question list without changing the
repository evidence:

- Phase → Task → Subtask → Element is authoritative for future data. Preserve
  historical TPO/SPO/EO labels and only reviewed mappings.
- Version and retire templates/content. Generated snapshots are immutable and
  authoritative even when a source question or template is absent.
- Use immutable UUIDs for people and unique string employee identifiers with
  audited correction history and leading-zero preservation.
- Import valid history; put orphaned, duplicated, inconsistent, or incomplete
  records in restricted reason-coded quarantine. Never guess repairs.
- Retain identity-linked assessment history for seven years, then delete
  personal detail when no hold applies and retain only anonymous aggregates.

Matthew Hull subsequently confirmed that no live system exists and designated
the newest 2014 production export as the authoritative available migration
source. [SOURCE_EXPORT_DISPOSITION.md](SOURCE_EXPORT_DISPOSITION.md) assigns all
15 source tables a migrate/aggregate/quarantine/exclude disposition. The source
profile in this report therefore satisfies 0A for the available system; importer
reconciliation must reproduce it, but no unavailable live-schema evidence
remains a Phase 0 blocker.
