# Phase 3 Authoritative Import Summary

## Evidence boundary

This report contains safe structural counts, checksum, timings, suppression/anomaly totals, and
integrity results only. It contains no source rows, identities, generated-test identifiers, exact
personal dates, access values, question or answer content, quarantine payloads, or sensitive
filesystem paths.

## Source and run result

- Source SHA-256: `ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70`
- Source byte size: 15,472,302
- Recognized source tables: 15
- Parsed source rows: 216,979
- Accepted: 1,167
- Quarantined source outcomes: 5,987
- Excluded by policy: 29,658
- Aggregated: 180,167
- Suppressed: 76
- Final import duration: approximately 3.5 seconds
- Measured total peak RSS: approximately 304 MiB, about 96 MiB above loaded runtime baseline
- Same-target rerun: completed without duplication
- Independent fresh imports: equivalent across 18 logical comparison tables with zero differences

## Source-table disposition counts

| Source table         | Disposition                     |  Source | Accepted | Quarantined | Excluded | Aggregated | Suppressed |
| -------------------- | ------------------------------- | ------: | -------: | ----------: | -------: | ---------: | ---------: |
| `TPO`                | Migrate                         |       1 |        1 |           0 |        0 |          0 |          0 |
| `SPO`                | Migrate                         |      19 |       19 |           0 |        0 |          0 |          0 |
| `EO`                 | Migrate                         |     213 |      213 |           0 |        0 |          0 |          0 |
| `variant`            | Migrate                         |       2 |        2 |           0 |        0 |          0 |          0 |
| `questions`          | Migrate/validate                |     657 |      612 |          45 |        0 |          0 |          0 |
| `test_model`         | Separate template source        |       7 |        4 |           3 |        0 |          0 |          0 |
| `testModel`          | Separate template source        |     316 |      316 |           0 |        0 |          0 |          0 |
| `createdTests`       | Aggregate only                  |     473 |        0 |           0 |        0 |        473 |         17 |
| `usedQuestions`      | Aggregate/restricted quarantine |  41,593 |        0 |       5,939 |        0 |     35,654 |          0 |
| `studentTestRecords` | Aggregate only                  |   2,148 |        0 |           0 |        0 |      2,148 |         15 |
| `testResults`        | Aggregate only                  | 169,062 |        0 |           0 |   27,170 |    141,892 |         44 |
| `instructors`        | Exclude                         |      17 |        0 |           0 |       17 |          0 |          0 |
| `logins`             | Exclude                         |   2,471 |        0 |           0 |    2,471 |          0 |          0 |
| `stamp`              | Exclude                         |       0 |        0 |           0 |        0 |          0 |          0 |
| `test_info`          | Exclude                         |       0 |        0 |           0 |        0 |          0 |          0 |

## Safe reconciliation results

- Reconciliation checks: all pass
- Foreign-key violations: 0
- Integrity check: `ok`
- Quick check: `ok`
- Future Phase/Task/Subtask/Element/Bloom rows: 0
- Prohibited operational identity/session/exam/attempt/answer rows: 0
- Aggregate publication-floor violations: 0
- Published/suppressed generation groups: 19/17
- Published/suppressed assessment groups: 23/15
- Published/suppressed question-performance groups: 345/44
- Restricted snapshot-only quarantine records retain no source/generated linkage.
- Both legacy template formats remain distinguishable; no lineage was inferred.

The staging database and generated reports remain local, owner-only, ignored, and reproducible.
