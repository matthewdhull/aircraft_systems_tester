# Phase 6 Question-Bank Characterization

## Evidence boundary

This catalog turns the approved offline question evidence into Phase 6
automation. The legacy application and database are shut down, so
`legacy_observed` means behavior evidenced by repository PHP/JavaScript, not a
runtime production observation. `target_approved` means the behavior is fixed by
the July 12, 2026 owner decisions and the Phase 6 instructions.

Primary evidence is:

- `questionCRUD_taskModeling.php` and the five `PHPScripts/*Question*.php`
  request handlers;
- `Classes/testClass.php`, especially prompt selection and the five display
  branches;
- the Phase 1 page/state, endpoint, scope, and business-characterization
  catalogs;
- `fixtures/phase-1/golden-behavior/questions.json` and every question reference
  in its manifest; and
- the Phase 3 importer plus Phase 5 curriculum and mapping contracts.

All Phase 6 fixtures, tests, and documentation use synthetic assessment content.
No authoritative prompt, choice, key, source identifier, access value, or
person appears in this artifact.

## Approved shape cases

| Case                    | Evidence                                                                                     | Automated target assertion                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Type normalization      | Legacy/UI codes are `tf`, `mc`, `c2`, `ac`, and `nc`.                                        | Trimmed, case-insensitive aliases and canonical names normalize to exactly five canonical types; unknown types are rejected. |
| True/false              | Legacy display fixes TRUE/FALSE but exact-case input can fall through.                       | Persist canonical True/False semantics, require one Boolean key, and reject missing or ambiguous semantics.                  |
| Single choice           | Normal legacy display uses one correct and three wrong choices.                              | Require four distinct nonblank choices with exactly one correct; never inject random all/none distractors.                   |
| Two-correct compound    | Legacy A–C contains two correct and one wrong statement; D names the two letters and is key. | Require exactly that A–C cardinality and derive deterministic D from the ordered correct letters.                            |
| All correct             | Legacy A–C contains three correct statements and D is the all-correct key.                   | Require three distinct correct statements and derive canonical D/key.                                                        |
| None correct            | Legacy A–C contains three incorrect statements and D is the none-correct key.                | Require three distinct incorrect statements and derive canonical D/key.                                                      |
| Primary prompt          | Legacy uses the primary prompt when alternate is blank.                                      | Require at least one nonblank prompt at position zero.                                                                       |
| Alternate prompts       | Legacy chooses one complete stored prompt.                                                   | Store distinct ordered version-owned prompts; preview selects an explicit prompt deterministically.                          |
| Blank/duplicate content | Legacy endpoints have no complete validation contract.                                       | Reject blank/duplicate prompts and choices server-side without echoing assessment content in errors.                         |

## Lifecycle characterization

| Case                      | Legacy evidence or approved delta                                | Automated target assertion                                                                                               |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Create and edit           | Legacy inserts and directly updates a single row.                | Create UUID identity/version 1 draft atomically; edit only an unreferenced draft.                                        |
| Submit and return         | No legacy review lifecycle exists.                               | Allow draft → review and attributable review → draft return only.                                                        |
| Review and publish        | Non-administrators require a distinct authorized reviewer.       | True Administrators may review their own work or publish a valid draft directly with a fixed audit reason.                |
| Version published content | Legacy update overwrites history.                                | Published/referenced versions are immutable; editing creates the next attributable draft version.                        |
| Retire and delete         | Legacy endpoint unconditionally hard-deletes.                    | Published/referenced content retires; only safely unreferenced drafts hard-delete after a fresh dependency proof.        |
| Imported adoption         | Phase 3 imports review/blocked content without a current author. | Imported rows remain unchanged; adoption creates a new attributable draft and follows the ordinary distinct-review flow. |

## Applicability and eligibility characterization

| Case                 | Approved target assertion                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Aircraft             | Publication and eligibility require at least one valid published/effective aircraft variant.                                                           |
| Legacy curriculum    | Preserve the exact historical TPO → SPO → EO chain; never reinterpret those IDs as future hierarchy IDs.                                               |
| Future curriculum    | A link targets a published/effective Subtask and optional child Element in a valid Phase → Task → Subtask → Element chain.                             |
| Link proposal/review | Creation is explicit and attributable; approval is a separate explicit review. No importer or heuristic creates or approves it.                        |
| Mapping isolation    | Phase 5 legacy mapping approval never creates a question link or changes eligibility.                                                                  |
| Eligibility          | Published/effective question + valid aircraft + approved future link + effective target ancestry is eligible; every incomplete combination is blocked. |
| Transactionality     | Lifecycle/link/eligibility/audit changes commit or roll back together; retirement removes eligibility.                                                 |

## Authorization and privacy characterization

Every list/detail load and direct action uses the Phase 4 principal and a real
permission guard. The matrix covers anonymous, authenticated without permission,
Question Author, Curriculum Manager-only, Instructor-only, Administrator,
revoked-role, and suspended actors. Create, review, publish, retirement, and key
viewing are distinct permissions; Administrator does not bypass the
distinct-reviewer rule.

General list/search results omit option text, correctness, semantic values,
derived D text, and answer keys. Correct-answer material is also absent from
URLs, validation/storage errors, structured logs, audit metadata, migration
reconciliation, and safe dependency results. Svelte client state is never an
authorization or validation source. Existing origin/CSRF, session, cookie,
redaction, and security-header behavior remains unchanged.

## UI and progressive-enhancement characterization

The target provides safe list/search/filter/pagination plus create, draft edit,
new-version, review, publication, link-review, preview, retirement, and draft
deletion states. Each of the five types has a semantic form and deterministic
preview. Alternate prompts, aircraft, legacy curriculum, and published future
curriculum are represented without drag-only interaction.

All mutations are ordinary SvelteKit form actions. Error summaries receive
focus after failure; successful actions restore a meaningful focus target.
Lifecycle, validation, dependency, authorization, conflict, loading, empty, and
success states are conveyed in text. Controls remain keyboard operable and the
layout has an explicit narrow-screen contract.

## Intentionally rejected legacy defects

1. Client-visible administrator state as an authorization boundary.
2. Unauthenticated question endpoints and raw request-to-SQL behavior.
3. Missing server validation and content-bearing database errors.
4. Exact-case true/false fall-through.
5. Random all/none distractors in ordinary single choice.
6. Direct overwrite of question content that erases published history.
7. Unconditional hard deletion of referenced content.
8. The task-page `.val()` call on a string during edit population.
9. Treating a legacy SPO/EO identifier or approved Phase 5 mapping as a future
   question link.
10. Exposing answer content and keys in general list payloads.

## Golden fixture traceability

The Phase 1 question fixture has 17 synthetic cases: five legacy-observed cases,
nine type-validation target cases, and three lifecycle/generation target cases.
The Phase 6 golden suite must execute every case ID and verify that the manifest
references all 17 exactly once across its question entries. Negative legacy
cases assert rejected behavior rather than reproducing the defect.

## Required automation map

| Suite                           | Coverage                                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/questions/domain`        | normalization, five validators, display derivation, lifecycle, adoption, applicability, link review, eligibility, dependencies, search, transactions |
| `tests/questions/database`      | constraints, indexes/query plans, migration upgrade, rollback, Phase 3 compatibility                                                                 |
| `tests/questions/migration`     | fixture/authoritative imports, reconciliation dimensions, idempotence/equivalence, privacy-safe reports                                              |
| `tests/questions/ui`            | five forms, route states, progressive forms, preview, focus, keyboard/narrow layout                                                                  |
| `tests/questions/golden`        | all 17 fixture cases and manifest references                                                                                                         |
| `tests/questions/integration`   | real service/routes, CRUD/lifecycle/applicability/link/eligibility/audit and Phase 3–5 isolation                                                     |
| `tests/questions/accessibility` | error summary/focus, keyboard-only operation, lifecycle text, responsive contract                                                                    |
| `tests/questions/security`      | route/action matrix, self-review, key leakage, safe audit/log/report output, CSRF/origin regressions                                                 |
| `tests/questions/e2e`           | built-application workflows for every type when an actual browser backend is available                                                               |

Browser coverage is recorded only when a real browser backend executes it.
Component, jsdom, server action, build, or HTTP smoke tests are not described as
browser automation.
