# Phase 6 Imported Question Reconciliation

## Purpose

`reconcileImportedQuestions` is a read-only, count-only proof for Phase 3
questions after the Phase 6 schema is present. It complements the general
Phase 3 reconciliation report and follows the shared
[integration contract](INTEGRATION_CONTRACT.md).

The report scopes imported content through the selected import run's
`source_target_mappings` rows for `questions → question_versions`. It does not
count ordinary Phase 5 or Phase 6 authored content. This is important on a
long-lived database where future curriculum and authored question versions may
legitimately exist after import.

## Safe report contract

The JSON and Markdown projections contain only:

- source checksum, importer version, and run status;
- the 15-table inventory count and disposition-violation count;
- question source, accepted, quarantined, unreconciled, and overlap counts;
- imported identity and version counts;
- counts for all five canonical types;
- counts by public aircraft variant code;
- lifecycle and generation-status counts;
- legacy link, linked-version, unique TPO/SPO/EO, and parent-violation counts;
- future-link counts by safe review-status vocabulary;
- counts by the stable quarantine reason vocabulary; and
- named checks with violation counts.

The report never includes prompt or option text, correctness flags, semantic
answers, derived keys, source IDs, internal UUIDs, target IDs, paths, SQL,
quarantine payloads, or per-record results. The command catches failures and
emits only a fixed error message.

## Checks

The report passes only when all of these conditions hold:

1. the selected import run is complete;
2. every one of the 15 source dispositions is present and unchanged;
3. accepted plus quarantined equals the source question count;
4. accepted and quarantined source outcomes are disjoint;
5. each accepted question has complete question and version mappings;
6. mapped identities match the unchanged Phase 3 UUIDv5 formula;
7. prompts are present, ordered, nonblank, and distinct after trimming;
8. persisted options satisfy the canonical five-type shape;
9. each imported version has one aircraft applicability row;
10. each imported version has one valid historical TPO/SPO/EO chain;
11. every imported version remains `review` and `blocked`;
12. imported future curriculum links remain zero; and
13. imported eligible versions remain zero.

Checks hold source and target identifiers only transiently in memory when
verifying identity and disjointness. They expose only aggregate violation
counts.

## Approved-source results

The Phase 6 focused suite imports and reconciles both approved sources through
all ordered migrations.

| Dimension                    | Synthetic fixture | Authoritative export |
| ---------------------------- | ----------------: | -------------------: |
| Source question rows         |                 8 |                  657 |
| Accepted versions            |                 5 |                  612 |
| Quarantined rows             |                 3 |                   45 |
| True/false                   |                 1 |                   72 |
| Single choice                |                 1 |                  474 |
| Two-correct compound         |                 1 |                   32 |
| All correct                  |                 1 |                   29 |
| None correct                 |                 1 |                    5 |
| Aircraft applicability links |                 5 |                  612 |
| Legacy curriculum links      |                 5 |                  612 |
| Future curriculum links      |                 0 |                    0 |
| Eligible versions            |                 0 |                    0 |

The authoritative accepted aircraft counts are 372 and 240 across its two
approved aircraft variants. Its accepted legacy links cover 1 TPO, 19 SPOs, and
164 EOs with zero parent violations. Quarantined outcomes are 8 curriculum
parent mismatches, 2 malformed question shapes, and 35 zero/sentinel
relationships. Accepted and quarantined totals are disjoint and reconcile
exactly.

These are migration evidence counts only. They do not approve, publish, map, or
make any question eligible.

## Command

Run the count-only JSON report against a migrated database:

```sh
node --import tsx scripts/questions/reconcile-imported.ts \
  --database <migrated-sqlite>
```

For a human-readable projection:

```sh
node --import tsx scripts/questions/reconcile-imported.ts \
  --database <migrated-sqlite> \
  --format markdown
```

Use `--run-id <uuid>` only when the database contains more than one import run.
The path and run identifier are command inputs and are not echoed in output.

## Regression coverage

[`question-reconciliation.test.ts`](../../../tests/questions/migration/question-reconciliation.test.ts)
proves fixture and authoritative totals, all five type buckets, aircraft and
legacy-chain dimensions, lifecycle/generation/future-link boundaries,
same-target idempotence, independent-import equivalence, deterministic UUIDv5
identity checks, safe rendering, and fail-closed canonical-shape detection.
