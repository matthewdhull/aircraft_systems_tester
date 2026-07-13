# Phase 3B — Extraction and Transformation Importer

## Result

Phase 3B provides a bounded-memory MySQL dump reader, checksum-gated command
surface, deterministic SQLite transformations, safe historical aggregation,
restricted snapshot-only quarantine, and atomic/idempotent import behavior.
The normative interface is [IMPORTER_CONTRACT.md](IMPORTER_CONTRACT.md).

No second SQL driver, parser dependency, or ORM was added. Node streaming and
cryptographic APIs provide decoding, SHA-256, fingerprints, and UUIDv5. The
coordinator added `tsx` as a development-only command runner because the
server-only TypeScript graph requires TypeScript and SvelteKit path resolution.

## Synthetic verification

The Phase 1 data fixture profiles as 22 rows across the complete 15-table
inventory. Its dry run produces these safe outcomes:

| Outcome                 | Count |
| ----------------------- | ----: |
| Accepted source rows    |    17 |
| Quarantined source rows |     5 |
| Excluded source rows    |     0 |
| Aggregated source rows  |     0 |
| Suppressed groups       |     0 |

The accepted count comprises one TPO, two SPOs, three EOs, two variants, five
questions, one wide-template row, and three row-template rows. The five
quarantines are the two orphan curriculum rows and the expected sentinel,
parent-mismatch, and duplicate question cases. All five normalized question
types are represented. Future hierarchy tables remain empty.

Focused tests cover multi-row and positional parsing, delimiters and escapes,
`NULL`, numbers, latin1 hex decoding, truncation, checksum rejection, fixture
transformation, foreign-key and integrity checks, same-target idempotence,
fresh-target mapping equivalence, and controlled-failure rollback. Test errors
and command results contain only synthetic counts and structural state.

## Operational notes

The importer makes multiple bounded streaming passes so parent-independent
source dump ordering cannot cause guessed or premature relationships. This is a
deliberate time-for-memory tradeoff suitable for the recorded 15.5 MB export.
Row callbacks reuse a small per-connection prepared-statement cache instead of
allocating one native SQLite statement per source row. Distinct-member counting
uses transient 128-bit keys in a temporary SQLite table; source member values
and those keys are not persisted in the completed target.

An authoritative-import regression measurement after this optimization
processed 216,979 rows in 3.69 seconds with a 318,881,792-byte maximum RSS. The
same environment previously measured approximately 476 MiB maximum RSS and 6.2
seconds. Safe import counts and deterministic output were unchanged. The
measurement database was removed immediately after the run.

The authoritative run must use protected local storage and an ignored target,
and its output must be admitted only as safe counts under the Phase 1 data
handling controls.
