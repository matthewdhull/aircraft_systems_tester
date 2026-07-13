# Phase 3 Schema Decisions

## Decision summary

| Decision              | Selected design                                                                                                                | Rejected alternative and reason                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Internal identity     | Text RFC 4122 UUIDs; UUIDv5 for imports using the fixed schema-contract namespace                                              | Reusing numeric source IDs would conflate independent identity systems; random import UUIDs would break repeatability. |
| Source identity       | Explicit source IDs plus `source_target_mappings`                                                                              | Encoding source IDs only inside target IDs would make reconciliation opaque.                                           |
| Time                  | Canonical UTC RFC 3339 instants and ISO calendar dates; half-open effective ranges                                             | Locale text and mixed Unix/SQL timestamps make ordering and retention ambiguous.                                       |
| Curriculum            | Separate historical TPO/SPO/EO and empty versioned future hierarchy                                                            | Guessing TPO/SPO/EO as Phase/Task/Subtask/Element contradicts the owner decision and source evidence.                  |
| Content history       | Stable identities plus immutable numbered question/template/curriculum versions                                                | Updating a content row in place would rewrite historical exam meaning.                                                 |
| Imported question use | Default generation state `blocked`; published is necessary but reviewed future mapping is additionally required by the service | Treating faithfully imported legacy links as future task mappings would authorize unsupported generation.              |
| Template archaeology  | Distinct `test_model` and `testModel` source records and rules                                                                 | Inferring lineage between incompatible formats is prohibited.                                                          |
| Snapshots             | Immutable exam prompt/option/key snapshots with restrictive source references                                                  | Resolving content live would change a published exam after edits.                                                      |
| Attempts/corrections  | Original score facts plus append-only invalidation/correction/remediation structures                                           | Overwriting score or treating remediation as regrading destroys auditability.                                          |
| Historical output     | Three isolated non-identifying aggregate families with a database-enforced publication floor of five                           | Importing expired individual attempts/results violates approved policy.                                                |
| Quarantine            | Restricted reason-coded records with no operational foreign keys                                                               | A shared staging table joined by normal services could leak or activate unreviewed content.                            |
| Migration workflow    | Reviewed TypeScript, generated ordered SQL, Drizzle snapshots, and journal; never `push`                                       | Direct schema push is not reviewable or reproducible from a clean checkout.                                            |

## Constraint boundary

SQLite enforces foreign keys, uniqueness, lifecycle values, positive versions,
positions/counts, effective-range ordering, reviewer separation, score ranges,
aggregate publication size, import mapping uniqueness, and the quarantine reason
set. Cross-row rules such as exact option cardinality, one coherent legacy
curriculum chain in a question, template rule totals, an option belonging to the
same snapshot question, and publication eligibility after approved mapping need
transactional importer/domain validation. They are named invariants rather than
unsafe triggers hidden outside the Drizzle schema.

## Migration sequence

1. `0000_foundation_probe` retains the accepted Phase 2 infrastructure marker.
2. `0001_canonical_schema` creates the complete normalized schema and indexes.
3. `0002_generation_eligibility` adds the explicit imported-content generation
   boundary. The reviewed copy step assigns existing rows `blocked`; this is a
   data-copy correction to generated SQLite SQL and does not change the Drizzle
   snapshot shape.
4. `0003_retention_links` adds the attempt retake self-reference and quarantine
   reviewer attribution foreign key.
5. `0004_quarantine_privacy_boundary` requires snapshot-only recovery to use a
   null source ID under `usedQuestions`, preventing generated-test linkage from
   entering restricted quarantine metadata.
6. `0005_join_indexes` adds child-side indexes for the expected vocabulary,
   applicability, template, roster, snapshot, attempt, and correction foreign-
   key joins.

The migrations apply successfully to an empty database and preserve alignment
with `drizzle/meta/` and the TypeScript schema. The small follow-up migrations
remain ordered evidence of review rather than being silently rewritten.

## Index rationale

Indexes cover lifecycle/effective-state filters, every high-volume parent join,
question/template applicability, source lookup and mapping coverage,
quarantine reason/state, import-run status, retention/expiry sweeps, roster and
attempt status, snapshot source traceability, and the three future historical
report paths. Unique indexes simultaneously enforce identity/version,
parent-position, source mapping, and idempotence invariants.
