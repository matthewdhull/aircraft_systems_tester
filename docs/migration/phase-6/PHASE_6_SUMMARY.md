# Phase 6 Question Bank Summary

## Scope and status

Phase 6 implements the question bank and stops before test templates, selection,
exam generation, snapshots, access codes, or any Phase 7 behavior. The
implementation acceptance suite passes. Operational completion additionally
requires the coordinator's clean committed-tree verification and post-commit
preview smoke against the preserved `.runtime/phase4-preview.sqlite`; those
runtime facts belong in the completion handoff because the preview must remain
running after the repository is clean.

No dependency versions changed. `package.json` adds only focused question test
and reconciliation commands; `package-lock.json` is unchanged.

## Tranche delivery

- 6A: `src/lib/server/questions/**`, question schema/migration `0010`, domain and
  database tests, and the domain/type contracts.
- 6B: `src/lib/components/questions/**`, `/questions` routes, UI/accessibility
  tests, and the UI contract.
- 6C: `src/lib/server/question-migration/**`, the count-only reconciliation CLI,
  migration tests, and migration/reconciliation contracts. No Phase 3 importer
  change was required.
- 6D: the shared integration contract, characterization, safe-read permission,
  route inventory, audit allow-list, navigation, golden/security/integration/E2E
  coverage, prior-phase regression updates, operator documentation, and final
  integration. Curriculum retirement now treats active question links as a
  blocking dependency, requiring audited link retirement first.

## Canonical representation

The server accepts exactly five canonical types and five case/whitespace-normalized
aliases:

| Alias | Canonical type         |        Persisted source rows | Display key                            |
| ----- | ---------------------- | ---------------------------: | -------------------------------------- |
| `tf`  | `true_false`           |     canonical True and False | one semantic Boolean key               |
| `mc`  | `single_choice`        |        four distinct choices | exactly one source choice              |
| `c2`  | `two_correct_compound` |         three A–C statements | derived D naming the two keyed letters |
| `ac`  | `all_correct`          |   three keyed A–C statements | derived canonical D                    |
| `nc`  | `none_correct`         | three unkeyed A–C statements | derived canonical D                    |

Compound D is never stored as a source option. One shared deterministic builder
is used by validation, privileged preview, imported-shape verification, and
future consumers. Safe displays omit `keyLetter` and correctness fields.

## Identity, lifecycle, and adoption

Question identities and content-version identities are immutable UUIDs; version
numbers increase within an identity. Drafts alone are editable. Review can
approve or return to draft. Publication requires a prior distinct reviewer and
an actor other than the author. Published/referenced history is immutable and
retired; only an attributable, unreferenced draft can be hard-deleted after a
fresh dependency revision.

Imported Phase 3 versions remain provenance-preserving `review` / `blocked`
rows and cannot be fixed, approved, or published in place. Adoption creates the
next attributable draft, copies the canonical source representation, aircraft,
and faithful legacy TPO/SPO/EO ancestry, and turns any copied future target into
a fresh unapproved proposal.

## Applicability and eligibility

Aircraft and both curriculum relationship families are version-owned. Legacy
identifiers are never interpreted as future hierarchy identifiers. A future
target must have published/effective Phase → Task → Subtask → optional Element
ancestry and begins in attributable `review`. Approval/retirement requires an
actor distinct from the proposer and question author.

Eligibility is derived from published/effective question state, effective
aircraft, at least one approved future link, and valid current ancestry. Link
decisions, publication, question retirement, status persistence, and safe audit
events share one transaction. Active question links block retirement of their
target or any ancestor until the link is explicitly retired; that link
transaction removes eligibility before curriculum retirement proceeds. Phase 5
mapping approval never creates a link or changes eligibility.

## Authorization and privacy

The central inventory contains two question routes and eleven named mutations.
Safe list/detail-summary reads use the additive `questions.view` permission.
Create/edit/version/submit/delete/propose use `questions.create`; review and
future-link decisions use `questions.review`; publication uses
`questions.publish`; question retirement enforces both `questions.publish` and
`records.retire`. Distinct-actor checks apply even to administrators.

List/search DTOs never contain options, correctness, semantic values, or keys.
Key-bearing detail requires `answer_keys.view` or an established authoring,
adoption, review, or publication context. Audit metadata and reconciliation are
allow-listed/count-only and exclude prompts, choices, answers, keys, rationales,
source IDs, UUID lists, URLs, SQL, and restricted payloads.

## Schema and reconciliation

Ordered migration `0010_phase6_question_bank` leaves the application-table
count at 65 and the migration count at 11. It adds review time and
review/publication consistency to question versions, proposal/review attribution
to future links, prompt length enforcement, and filter/activity/search indexes.
Migrations `0000`–`0009` and all 15 Phase 3 source dispositions are unchanged.

Reconciliation results:

| Source        | Question rows | Accepted | Quarantined | Review/blocked | Future links | Eligible |
| ------------- | ------------: | -------: | ----------: | -------------: | -----------: | -------: |
| Fixture       |             8 |        5 |           3 |              5 |            0 |        0 |
| Authoritative |           657 |      612 |          45 |            612 |            0 |        0 |

Authoritative accepted versions reconcile as 72 true/false, 474 single choice,
32 two-correct compound, 29 all-correct, and 5 none-correct; aircraft is 372 CRJ
and 240 ERJ. There are 612 faithful legacy links spanning 1 TPO, 19 SPOs, and
164 EOs with zero parent violations. Quarantine reasons are 8 curriculum-parent
mismatches, 2 malformed shapes, and 35 zero/sentinel relationships. Repeated
same-target import is a no-op and an independent import produces the same run
identity and reconciliation counts.

## Verification result

The preliminary integrated tree passed formatting, lint, strict Svelte/TypeScript
checking (0 errors and 0 warnings), Drizzle validation, production build, clean
migration/integrity checks, and 57 test files / 364 tests. The focused question
suite passed 12 files / 128 tests and executed every one of the 17 golden cases.
Phase 3 migration regressions passed 5 files / 28 tests; Phase 4
authentication/authorization/security/instructor regressions passed 21 files /
102 tests; Phase 5 curriculum regressions passed 11 files / 74 tests.

The exact committed-tree rerun is recorded in
[PHASE_6_VERIFICATION_MATRIX.md](PHASE_6_VERIFICATION_MATRIX.md). Browser
automation is not claimed by this document; the coordinator reports only the
browser work actually performed after the persistent preview starts.
