# Phase 6 Imported Question Migration Contract

## Authority and scope

This contract extends the Phase 3
[importer](../phase-3/IMPORTER_CONTRACT.md) and
[reconciliation](../phase-3/RECONCILIATION_CONTRACT.md) contracts with the
Phase 6 question-bank review boundary. The Phase 3 source dispositions,
namespace, UUIDv5 name formula, importer version, approved source identities,
privacy rules, and one-transaction import behavior remain unchanged.

Phase 6 does not reimport, repair, adopt, approve, publish, link, or make legacy
questions generation-eligible. It verifies the existing transformation and
gives an authorized author a separate adoption workflow through the question
service described in [QUESTION_DOMAIN_CONTRACT.md](QUESTION_DOMAIN_CONTRACT.md).

## Canonical transformation

The source aliases map exactly as follows:

| Source alias | Canonical type         | Persisted option rows |
| ------------ | ---------------------- | --------------------: |
| `tf`         | `true_false`           |                     2 |
| `mc`         | `single_choice`        |                     4 |
| `c2`         | `two_correct_compound` |                     3 |
| `ac`         | `all_correct`          |                     3 |
| `nc`         | `none_correct`         |                     3 |

True/false persists canonical True and False rows with one semantic key.
Single-choice persists one correct and three incorrect rows. Compound,
all-correct, and none-correct persist only source statements A–C. Display D is
derived deterministically by the shared question-domain display constructor; it
is not added to imported source rows.

Every accepted source question has:

- one deterministic question UUID and one deterministic version UUID;
- version number 1 in `review` lifecycle and `blocked` generation status;
- one or more ordered, nonblank, trim-distinct prompts;
- the canonical option cardinality and correctness shape;
- exactly one accepted aircraft applicability row; and
- exactly one faithful legacy TPO → SPO → EO link.

The importer creates no future curriculum link and does not inspect Phase 5
mapping approvals when transforming a question.

## Provenance and text normalization

Imported rows preserve the approved Phase 3 transformation. Phase 6 evidence
found no blank or trim-equivalent duplicate prompt or option in either approved
source. Some authoritative source strings retain harmless outer whitespace.
Changing those already imported strings under the same importer version would
make a fresh target differ from an existing target, so Phase 6 does not rewrite
them or change `IMPORTER_VERSION`.

Reconciliation evaluates nonblank and distinct rules after trimming without
emitting the text. Adoption creates a new attributable draft version through
the ordinary Phase 6 service, where authored input is normalized. The imported
version remains unchanged and continues to provide provenance.

## Adoption boundary

An imported version has null author attribution and may not be edited,
corrected, linked, or published in place. Adoption requires an authorized actor
to create the next numbered draft version. That operation copies the selected
source content, aircraft applicability, and faithful legacy links into new
version-owned rows with new UUIDs and the actor as author.

The adopted draft then follows the ordinary lifecycle:

1. author edits and submits the new draft;
2. a distinct authorized reviewer reviews the version;
3. future curriculum applicability is proposed and separately reviewed;
4. a distinct authorized publisher publishes the reviewed version; and
5. generation eligibility remains derived from all current publication,
   aircraft, curriculum-link, ancestry, effective-date, and retirement rules.

Phase 5 mapping approval alone never adopts a question, creates a future link,
or changes generation eligibility.

## Compatibility invariants

- All 15 source-table dispositions remain those recorded by Phase 3.
- `IMPORT_NAMESPACE`, the UUIDv5 name formula, and `IMPORTER_VERSION` remain
  unchanged.
- Same-target reruns return the completed import without writing rows.
- Independent fresh targets produce identical logical rows and mappings.
- Legacy identifiers are never used as Phase/Task/Subtask/Element identifiers.
- Imported parent links remain the faithful historical TPO/SPO/EO chain.
- Imported lifecycle is `review`; imported generation status is `blocked`.
- Imported future-link count and eligible-version count are both zero.
- No imported people, credentials, sessions, attempts, access codes, or
  generated-exam history are introduced.

## Failure and privacy behavior

The Phase 3 importer remains one transaction and fails with a generic error.
Malformed, duplicate, unmapped, or unknown question rows use the existing safe
quarantine reason taxonomy. No new reason codes or source dispositions are
introduced.

Question text, choices, correctness, semantic values, keys, source identifiers,
target identifiers, file paths, and restricted payloads must not appear in
command output, reconciliation reports, logs, or audit metadata. Tests and
documentation use synthetic content only.

## Verification

Focused verification is:

```sh
npx --no-install vitest run tests/questions/migration
node --import tsx scripts/questions/reconcile-imported.ts --database <migrated-sqlite>
```

The coordinator may add a package-script alias without changing this contract.
