# Template Reconciliation

Legacy `test_model` and `testModel` rows remain distinct sources keyed by import run, source table, and source identifier. The workflow never infers lineage or equivalence between formats.

Adoption is explicit: an authorized actor reviews a source, supplies canonical aircraft/course applicability and published future-curriculum rules, and creates a new attributable version-1 draft. Adoption records actor, time, and the newly created draft UUID on the source. It does not mutate legacy shape data, publish the draft, expose legacy access values, or connect historical instructors or generated tests.

Ambiguous or incomplete rows remain reviewable legacy evidence. Re-running reconciliation is idempotent by source key and cannot adopt an already mapped source again.
