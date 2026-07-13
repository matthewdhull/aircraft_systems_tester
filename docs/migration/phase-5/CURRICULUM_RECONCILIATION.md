# Phase 5 Curriculum Mapping Reconciliation

## Scope

Curriculum mapping reconciliation is read-only and deterministic for a fixed database state and injected clock. It reports counts and named safety checks without exposing source IDs, UUIDs, names, paths, people, question/answer material, or quarantine data.

The report includes:

- total and unmapped counts for TPO, SPO, and EO;
- proposed, approved, rejected, and retired counts, including zero-valued statuses;
- lifecycle counts by source type and target type;
- invalid target references;
- conflicting approved mappings;
- broken source parent chains;
- broken published/effective target chains;
- importer provenance pointing at future hierarchy or Bloom tables; and
- future question links or eligible question versions that would violate the Phase 5 no-side-effect boundary.

An entity is unmapped unless it has an approved mapping. Proposed, rejected, and retired records are not usable mappings. Broken target-chain checks apply to approved mappings because proposals may legitimately point at a draft target while awaiting publication and review.

`importer_created_future_nodes` inspects Phase 3 `source_target_mappings` provenance for future hierarchy/version/Bloom targets. It does not treat legitimate manually created Phase 5 nodes as importer output. `mapping_question_eligibility_side_effects` counts both future question-curriculum links and question versions marked eligible; both must remain zero during Phase 5.

## CLI

Run against an existing migrated database:

```sh
node --import tsx scripts/curriculum/reconcile-mappings.ts --database .runtime/application.sqlite
```

Optional safe reports may be written with restrictive file permissions:

```sh
node --import tsx scripts/curriculum/reconcile-mappings.ts \
  --database .runtime/application.sqlite \
  --json .runtime/curriculum-reconciliation.json \
  --markdown .runtime/curriculum-reconciliation.md
```

The command exits nonzero when a named safety check fails. Standard output contains only the overall result and total safety-violation count. Output paths must remain in ignored runtime storage and must not be committed.

## Interpretation

A passing report confirms database state, not reviewer judgment. It proves that approved mappings have valid stored references and that prohibited Phase 5 side effects are absent. It does not infer missing mappings, approve proposals, assess semantic equivalence, or authorize question generation.

Every proposed relationship still requires an accountable human review using approved source material. Any remediation must occur through the protected mapping mutations; reconciliation never repairs data.
