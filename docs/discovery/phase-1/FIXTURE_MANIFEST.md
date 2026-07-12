# Phase 1 Fixture Manifest

## Purpose and evidence boundary

The Phase 1 fixtures are synthetic preservation inputs for future importer and
domain tests. They are not a target schema, importer, test runner, or copy of
production data. Their source authority is the table/disposition contract in
[SOURCE_EXPORT_DISPOSITION.md](../phase-0/SOURCE_EXPORT_DISPOSITION.md) and the
target policy in [OWNER_DECISIONS.md](../phase-0/OWNER_DECISIONS.md).

The protected export is referenced only by its recorded path, byte size, and
SHA-256 in the Phase 0 disposition. No row from it is reproduced here.

## Legacy-source fixture

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| [`schema.sql`](../../../fixtures/phase-1/legacy-source/schema.sql) | Canonical loadable shape for all 15 MySQL source tables | `4404026293b24b2bac5388a1d7bc97bdd12877d533888144f79a977fa946d03e` |
| [`data.sql`](../../../fixtures/phase-1/legacy-source/data.sql) | 22 synthetic curriculum/question/variant/template rows | `a8e02025608f7ca1cbd3020fed7863dba9128938b303a97643a59e746b169eec` |
| [`expected-profile.json`](../../../fixtures/phase-1/legacy-source/expected-profile.json) | Expected counts, relationships, anomalies, hierarchy absence, and dispositions | `9835ae24bbb29fdad331e99e84a39deb029b2b8f8f4bee46b64945b566e773ec` |
| [`README.md`](../../../fixtures/phase-1/legacy-source/README.md) | Load order, fixture boundary, and intended cases | Documentation; not a machine-input checksum boundary |

### All-table disposition coverage

| Source table | Approved disposition represented | Fixture rows | Expected fixture handling |
| --- | --- | ---: | --- |
| `TPO` | Migrate fully | 1 | Accept 1 historical-label root |
| `SPO` | Migrate fully; quarantine invalid parents | 3 | Accept 2; quarantine 1 orphan |
| `EO` | Migrate fully; quarantine invalid parents | 4 | Accept 3; quarantine 1 orphan |
| `variant` | Migrate fully for controlled-vocabulary review | 2 | Stage/accept 2 |
| `questions` | Migrate fully with five-type validation | 8 | Accept 5; quarantine 3 anomaly/duplicate candidates |
| `test_model` | Legacy wide-template source | 1 | Stage 1; infer no lineage |
| `testModel` | Legacy row-template source | 3 | Stage 3 rows for one logical model; infer no lineage |
| `createdTests` | Aggregate only | 0 | Schema/disposition metadata only; no generated history |
| `usedQuestions` | Aggregate or restricted content quarantine only | 0 | Schema/disposition metadata only; no snapshots |
| `studentTestRecords` | Aggregate only | 0 | No identifiable attempts/results |
| `testResults` | Aggregate only | 0 | No individual result rows |
| `instructors` | Exclude | 0 | Schema/disposition metadata only |
| `logins` | Exclude | 0 | Schema/disposition metadata only |
| `stamp` | Exclude | 0 | Schema/disposition metadata only |
| `test_info` | Exclude | 0 | Schema/disposition metadata only |

The source shape has 15 MyISAM/`latin1` tables, 12 primary keys, and no declared
foreign keys. Expected characterization includes all five source question type
codes; optional alternate wording; null answer slots; one zero sentinel; one
EO/SPO parent mismatch; one duplicate candidate; two orphan relationships; one
explicit synthetic latin1 byte; and both template formats. The row-oriented
template has two category rows totaling five and one mandatory-element row. The
wide template declares five, with four category items plus one mandatory item.

No Phase, Task, Subtask, Element, or Bloom table or row exists in the fixture.
Those approved target structures begin empty.

## Golden behavior fixtures

| Artifact | Cases | Legacy observed | Target approved | Negative regressions | SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| [`questions.json`](../../../fixtures/phase-1/golden-behavior/questions.json) | 17 | 5 | 12 | 2 | `67783533c388822cc5f2acf6e6fba85f0d3fc2fbcdc01a20fb6410d363a46fd8` |
| [`test-generation.json`](../../../fixtures/phase-1/golden-behavior/test-generation.json) | 17 | 4 | 13 | 2 | `5a895098f1da9f34e930ae024eb6399050957723c2838042242a515cd0deb26a` |
| [`grading.json`](../../../fixtures/phase-1/golden-behavior/grading.json) | 20 | 3 | 17 | 3 | `beb9fc694e0a2dadcd7771c29437d4a0dc06fce554c9cb3a0112c96f98a4f585` |
| [`reports.json`](../../../fixtures/phase-1/golden-behavior/reports.json) | 13 | 1 | 12 | 0 | `c7d8aee17e8c618ae25c4a0963371a5bdd81b14c209af88778bc4c26ef7bc7cb` |
| [`manifest.json`](../../../fixtures/phase-1/golden-behavior/manifest.json) | Maps all 67 case IDs | — | — | Maps all 7 | `d7bccbc40230ecafa410bcf4b8722bcc913c3f2c0298675b5fe8a80cab6fe771` |

The cases cover five question contracts and prompt variants; validation and
content lifecycle; exact and mandatory generation; atomic shortages; seeded
randomization invariants; immutable/shared snapshots and per-attempt order;
access, recovery, resume, extension, preview, and timing; equal-weight actual-
item grading; threshold/rounding; unanswered and timeout submission; duplicate
submission rejection; invalidation and remediation; retake/retraining; and all
approved reports/exports.

Report fixtures use at least five synthetic members wherever an aggregate is
published. The small-cell case begins with six members, suppresses groups of
four and two, and publishes only the six-member roll-up.

## Validation contract

A future consumer should:

1. load `schema.sql`, then `data.sql`, into a disposable MySQL-compatible
   database or parse them with an equivalent structural validator;
2. reconcile every count and relationship in `expected-profile.json`;
3. treat quarantine expectations as reason-coded rejects, never inferred
   repairs;
4. execute golden cases by their manifest-designated future test layer;
5. assert randomized invariants/permitted outcomes rather than one arbitrary
   order; and
6. keep `legacy_observed` results separate from `target_approved` behavior,
   especially all seven negative regressions.

Checksums in this manifest identify the reviewed Phase 1 baseline. Any fixture
change requires renewed JSON/SQL, relationship, aggregate, sensitive-overlap,
and manifest-coverage review.

The repository's existing `.gitignore` rule for `*.sql` hides `schema.sql` and
`data.sql` from ordinary `git status`. They remain required fixture artifacts.
A future commit must force-add these two reviewed paths or use a separately
approved narrow ignore exception; do not broaden SQL admission generally.
