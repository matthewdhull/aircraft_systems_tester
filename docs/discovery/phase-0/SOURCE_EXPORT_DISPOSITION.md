# Authoritative Source Export and Table Disposition

## Owner attestation — July 12, 2026

Matthew Hull, the original developer and product decision authority, confirmed:

- the application and database are completely shut down;
- no workflows are active today and no live production database exists;
- the newest checked-in production export,
  [`backups/xjtest_production_backup.11.22.14.sql`](../../../backups/xjtest_production_backup.11.22.14.sql),
  is the authoritative available migration source;
- all legacy database, mail, hosting, and administrator credentials have been
  revoked;
- he holds the only known copy of the original application repository;
- initial replacement work will run locally; a production hosting plan is
  deferred;
- the estimated future classroom load is 16–18 concurrent students, with an
  exam roughly every one to two weeks; this is an owner estimate, not telemetry;
  and
- manual operator snapshots and their recovery risk are accepted for this stage.

No credential values, identities, answers, or access codes were used to record
this attestation.

The source export is readable, is 15,472,302 bytes, and has SHA-256 checksum
`ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70`.
This checksum identifies the approved source artifact; it is not a data value
from inside the export.

## Migration priority and retention decision

Curriculum, question-bank content, aircraft variants, and reusable test-template
definitions are the authoritative legacy assets. Historical student/instructor
test records are not important enough to retain as identifiable records and are
already older than the approved seven-year retention period.

Therefore:

- fully migrate recoverable curriculum, question, variant, and template data;
- do not migrate legacy people, credentials, access codes, logins, identifiable
  attempts, per-student results, or generated-exam histories;
- derive only privacy-safe aggregate assessment statistics where useful;
- recover unique question content found only in generated snapshots into
  restricted content quarantine for review, without student, instructor,
  generated-test, date, or access-code linkage; and
- keep the original export only in the restricted source archive under the
  approved repository-remediation process.

## Table-level disposition

| Source table | Disposition | Required handling |
| --- | --- | --- |
| `TPO` | **Migrate fully** | Preserve source ID/number/name and map to historical curriculum labels; do not guess task-hierarchy mapping. |
| `SPO` | **Migrate fully** | Preserve parent/source IDs and labels; quarantine invalid parent relationships. |
| `EO` | **Migrate fully** | Preserve parent/source IDs and labels; quarantine invalid parent relationships. |
| `variant` | **Migrate fully** | Import as a versioned/effective-dated controlled vocabulary after owner review. |
| `questions` | **Migrate fully, validate** | Preserve question/answer content and source IDs; validate all five type contracts; quarantine malformed, unmapped, or duplicate candidates. |
| `test_model` | **Migrate as legacy template source** | Preserve wide model definitions in staging, then map reviewed definitions into versioned target templates; quarantine ambiguous rows. |
| `testModel` | **Migrate as legacy template source** | Preserve row-oriented counts/mandatory elements in staging; reconcile with `test_model` without inferred lineage. |
| `createdTests` | **Aggregate only** | Derive generation counts by calendar year, non-personal course/template dimension, and configured length where mappings are reliable; never migrate instructor IDs or access/override values. |
| `usedQuestions` | **Do not migrate generated history** | Use aggregate question-use counts where safe. Extract only unique recoverable question/answer content absent from `questions` into restricted content quarantine, stripped of generated-test/date/person/access linkage. |
| `studentTestRecords` | **Aggregate only** | Derive privacy-safe attempt/outcome/score summaries; never migrate employee IDs, names, instructor IDs, exact class dates, or record IDs. |
| `testResults` | **Aggregate only** | Derive question-level asked/correct counts linked only to migrated question source IDs; never migrate employee IDs, generated-test IDs, or individual rows. |
| `instructors` | **Exclude** | Do not import identities, password fields, roles, or account records. Create new staff accounts through the approved reset/onboarding process. |
| `logins` | **Exclude** | Do not import student identifiers, passwords, overrides, generated-test linkage, or access events. |
| `stamp` | **Exclude** | Obsolete/staging utility with no retained rows or active requirement. |
| `test_info` | **Exclude** | Obsolete empty link table with no active requirement. |

### Task-hierarchy recovery gap

The authoritative export contains no `Phase`, `Task`, `Subtask`, `Element`, or
Bloom taxonomy tables and no question `subtask_id`/`element_id` columns. Those
records cannot be migrated from this source. Do not reinterpret legacy
`spo_id`/`eo_id` values as task identifiers.

Create the target task-hierarchy structures empty. Import legacy TPO/SPO/EO and
question links faithfully, then require reviewed curriculum authoring or a
separately supplied approved source to create task nodes and explicit mappings.
Legacy questions remain preserved but are not eligible for new task-based exam
generation until their required target mapping/content review is complete.

## Privacy-safe aggregate contract

The importer may produce only these historical aggregate datasets:

1. **Generation summary:** calendar year, reviewed legacy template/source key or
   course type, configured length, and generated count.
2. **Assessment summary:** calendar year plus reviewed non-personal syllabus,
   qualification, retraining, and outcome dimensions; attempt count and average
   score.
3. **Question performance:** migrated question source key, asked count, and
   correct count, optionally by calendar year when reliably joined.

Rules:

- remove names, employee/instructor IDs, login/access values, record/generated
  test IDs, exact dates/times, and free text that can identify a person;
- publish no aggregate group smaller than five records; roll it into a coarser
  group or suppress it;
- never use unreliable joins or inferred model/curriculum mappings to populate a
  dimension—omit the dimension and record an anomaly instead;
- record source-export checksum, aggregation version, source row counts, excluded
  row counts, suppressed group counts, and anomaly counts;
- keep aggregate tables read-only historical facts; they do not participate in
  current student, attempt, grading, or authorization workflows; and
- keep quarantined question content restricted as assessment material until a
  reviewer publishes or rejects it.

## Acceptance effect

Because the live system no longer exists, a live-schema export, traffic log, or
current-host profile cannot be obtained and is no longer a Phase 0 dependency.
The 2014 export inventory is the authoritative source inventory by owner
attestation. Active production workflow count is zero.

The unrecoverable task-hierarchy population is a documented source limitation,
not an unresolved schema decision: the target structures are approved, but their
content must be authored or supplied later.

Remaining post-Phase-0 work is limited to:

- reproducing the source schema/count inventory as an importer reconciliation
  test;
- validating local SQLite storage/locking with the estimated workload during the
  appropriate foundation/hardening phase; and
- documenting a repeatable manual snapshot procedure before irreplaceable new
  data is entered.
