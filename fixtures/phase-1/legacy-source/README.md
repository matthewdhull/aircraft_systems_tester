# Phase 1 synthetic legacy-source fixture

This fixture preserves the authoritative export's 15-table MySQL shape without
copying any source-export values. It is an importer characterization input, not
an importer implementation and not a target schema.

Load `schema.sql` and then `data.sql` into a disposable MySQL-compatible database.
Compare staging, acceptance, and quarantine outcomes with
`expected-profile.json`. The fixture deliberately has no foreign keys because
the source declares none.

Only TPO/SPO/EO curriculum, variants, questions, and the two template formats
have rows. All people, authentication, attempt, result, generated-test, and
generated-snapshot tables remain empty. Consequently this fixture produces no
historical aggregates; the approved minimum group size of five still applies to
any future aggregate fixture.

Intentional characterization cases are:

- all five legacy question type shapes;
- optional alternate wording and nullable answer columns;
- one zero-sentinel curriculum link;
- one question whose EO belongs to a different SPO;
- one exact synthetic duplicate-question candidate with a distinct source ID;
- one orphan SPO and one orphan EO;
- one synthetic non-ASCII label encoded explicitly as a latin1 hex literal;
- row-oriented category and mandatory-element template rows; and
- one wide template with separate category and mandatory counts.

The orphan and mismatch rows must be quarantined with reason codes. They are not
permission to infer repairs. No Phase/Task/Subtask/Element/Bloom table or row is
included because the authoritative source has no such population.
