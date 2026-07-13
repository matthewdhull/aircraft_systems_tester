# Phase 3 Reconciliation Contract — Version 1

## Inputs and trust boundary

Reconciliation consumes a migrated SQLite database conforming to
[SCHEMA_CONTRACT.md](SCHEMA_CONTRACT.md). It is read-only and never repairs,
approves, publishes, or deletes records. If no import-run ID is supplied, exactly
one run must exist. This prevents accidental combination of unrelated evidence.

The source checksum is reportable migration evidence. Source rows, source IDs,
internal target IDs, timestamps, paths, and protected values are not reportable.

## Stable outcomes

The reconciliation vocabulary distinguishes these outcomes:

| Outcome       | Meaning                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `accepted`    | Valid content entered an approved migration target in blocked or review state. |
| `rejected`    | A malformed record was rejected from canonical content.                        |
| `quarantined` | A restricted record awaits explicit future review.                             |
| `excluded`    | Policy prohibited importing the source record.                                 |
| `aggregated`  | Only an approved non-identifying aggregate was retained.                       |
| `suppressed`  | A group below five was not published.                                          |

The database state `approved_for_future_reconciliation` is still quarantined. It
is neither accepted nor published and cannot become operational without a newly
authorized canonical transaction in a future phase.

## Reason-code taxonomy

The report always returns every schema-owned reason code in stable schema order,
including zero counts:

- `missing_parent`
- `curriculum_parent_mismatch`
- `missing_or_invalid_variant`
- `malformed_question_shape`
- `duplicate_candidate`
- `zero_or_sentinel_relationship`
- `ambiguous_template_source`
- `unreliable_historical_join`
- `restricted_snapshot_only_content`
- `aggregate_group_suppression`
- `encoding_error`
- `unknown_question_type`

Meanings are defined by the schema contract. Reconciliation may not rename or
broaden them. Additions require a schema-contract change.

## JSON report

`schemaVersion` is `1`. Object fields and ordered arrays are stable:

- `source`: checksum, importer version, and completion status;
- `summary`: safe source/outcome totals;
- `sourceTables`: all 15 tables in schema contract order, their executable
  disposition, and safe outcome counts;
- `curriculum`: accepted TPO/SPO/EO counts and parent-chain violations;
- `variants`: accepted count;
- `questions`: accepted versions, all five normalized type buckets, lifecycle and
  generation-state counts, validation-reason counts, and parent-chain violations;
- `templates`: counts by the distinct `test_model`/`testModel` source and
  reconciliation state, plus extracted-rule count;
- `mappings`: counts by source, target, and kind, plus coverage violations;
- `quarantine`: total and counts by stable reason/disposition;
- `aggregates`: published/suppressed group counts and publication-floor
  violations;
- `futureHierarchy`: zero-row proof for Bloom and Phase/Task/Subtask/Element
  structures and reviewed future links;
- `checks`: deterministic named results and violation counts;
- `passed`: true only for a completed run with every check passing.

The Markdown report is a human-readable projection of the same safe information.
Neither representation includes database content or identifiers.

## Required checks

Reconciliation fails if it observes:

- a source checksum outside the two identities approved by the importer contract;
- a missing, unexpected, or incorrectly disposed source inventory;
- a broken TPO → SPO → EO or question curriculum chain;
- imported future hierarchy or inferred legacy-to-future mappings;
- imported identity, roster, exam, attempt, answer, or access history;
- published aggregate groups below five;
- snapshot-only quarantine linkage or a missing restricted payload;
- missing mappings for accepted legacy curriculum/template source rows;
- foreign-key, integrity, or quick-check violations.

Question results always contain the five approved type keys. Unknown and malformed
types are represented through reason counts, never through content.

## Independent import comparison

`compareLogicalImports` compares an allowlist of Phase 3 logical target tables.
Import-run IDs and start/completion timestamps are excluded. Canonically ordered
rows are hashed in memory; neither hashes nor row values leave the process.

The result contains only:

- schema version;
- equivalent/different result;
- number of tables compared;
- differing approved table names and their row counts.

This supports two-fresh-target equivalence without turning hashes or protected
values into durable artifacts.
