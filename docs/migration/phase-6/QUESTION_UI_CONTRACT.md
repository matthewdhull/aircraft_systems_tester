# Phase 6 Question UI Contract

## Scope

The Phase 6 question-bank interface provides safe list, search, filter,
pagination, authoring, review, publication, retirement, applicability, and
preview workflows. It does not provide templates, question selection, exam
generation, snapshots, access codes, or any Phase 7 behavior.

The shared [integration contract](INTEGRATION_CONTRACT.md) remains authoritative
for DTOs, lifecycle rules, permissions, validation, transactions, audit safety,
and domain errors. The UI submits commands to the question service and never
reimplements those rules as an authorization or persistence boundary.

## Routes and progressive enhancement

The interface owns two protected routes:

| Route             | Read projection                                   | Form actions                                                                                                                                                                    |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/questions`      | Safe prompt-only list, filter options, pagination | `createQuestion`                                                                                                                                                                |
| `/questions/[id]` | Authorized privileged version detail              | `updateDraft`, `createVersion`, `submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`, `deleteDraft`, `proposeFutureLink`, `approveFutureLink`, `retireFutureLink` |

Search and filter controls use an ordinary GET form. Type selection also uses a
GET form, so all five type-specific editors remain reachable when client
JavaScript is unavailable. Every mutation uses an ordinary named SvelteKit POST
form. Native inputs, buttons, radios, checkboxes, and details/summary controls
remain keyboard-operable without drag interaction.

The list load requires `questions.view`. Create, update, version, submit,
delete, and link-proposal actions require `questions.create`. Review, return,
and future-link decisions require `questions.review`. Publication requires
`questions.publish`. Retirement requires both `questions.publish` and
`records.retire`. Route code obtains the actor from the Phase 4 principal and
never accepts identity, roles, or permissions from form data.

## Safe list and privileged detail

List and search cards render only `SafeQuestionListItemDto`. They include the
primary prompt, type, lifecycle, generation status, counts, and aircraft codes.
They never receive or render option text, semantic values, correctness, a key
letter, or derived compound-key text.

The detail route calls the safe `versionSummary` seam before the privileged
read. It permits the key-bearing detail only after establishing one of these
server-side contexts:

- `answer_keys.view`;
- an authenticated actor with `questions.create` in the protected authoring
  detail workflow;
- a distinct authorized reviewer viewing review content;
- a distinct authorized publisher viewing approved review content; or
- an authorized adoption workflow for provenance-preserving imported review
  content.

Client state never grants privileged access. A view-only user without one of
these contexts receives no key-bearing detail.

## Question editors

All editors submit the canonical question type, ordered prompts, ordered source
options, selected key positions, aircraft IDs, and preserved historical links.
Blank optional prompt slots are omitted by the route adapter; a blank primary
prompt and duplicate nonblank prompts reach the service and fail server
validation. Draft updates preserve faithful legacy TPO/SPO/EO relationships in
hidden version-owned fields rather than translating them into future IDs.

The five rendered shapes are:

- `true_false`: fixed canonical True and False rows with one semantic radio
  answer;
- `single_choice`: four editable choices with one radio answer and no automatic
  all/none distractor;
- `two_correct_compound`: three editable statements with correct-statement
  checkboxes and a server-derived D explanation;
- `all_correct`: three editable correct statements and canonical D display; and
- `none_correct`: three editable incorrect statements and canonical D display.

HTML constraints improve immediate usability, but they are not authoritative.
The service validates cardinality, semantics, whitespace, distinctness,
applicability, ancestry, lifecycle, attribution, and concurrency before any
write.

Up to four ordered prompt fields are available without a client-only add/remove
control. Clearing an alternate removes that slot from the submitted command.
Aircraft choices come from the service's effective aircraft projection. Future
curriculum choices come only from published/effective Phase 5 ancestry.

## Preview and lifecycle

`QuestionPreview` consumes `CanonicalQuestionDisplayDto`; it does not derive
compound D or answer keys. The same server projection therefore drives all five
preview shapes. A non-key preview omits the correct-answer label.

Drafts expose update, submit, and dependency-checked delete controls. Review
content exposes approve and return controls only to reviewers. Approved review
content exposes effective-range publication only to publishers. Published
content exposes new-version and authorized retirement controls. Imported review
content is labeled as adoption: creating a new attributable draft leaves the
imported version unchanged and blocked.

Future curriculum proposals start in review. A distinct authorized reviewer can
approve or retire a proposal with a rationale. The UI explicitly states that a
Phase 5 mapping approval does not approve a question link or create generation
eligibility. Generation status is displayed from the service and is never
calculated in the browser.

## States, errors, and accessibility

The list has loading, empty, result-count, pagination, and composed-filter
states. Detail actions display success status messages. Fixed safe domain-error
messages cover validation, conflict, stale version, authorization-independent
lifecycle failures, dependency changes, invalid applicability, unavailable
storage, and immutable references. Neither field errors nor generic messages
echo submitted assessment content.

Field errors link from the error summary to prompt, option, rationale, effective
range, and retirement inputs when a stable field path is available. After a
failure, focus moves to the error summary. After success, focus returns to the
updated question or applicability heading. Layouts use wrapping grids and
collapse to one column at narrow widths. Every input has an explicit label, and
status changes use `role="status"`.

## Verification

Focused component coverage is under `tests/questions/ui/`. It exercises all
five forms and previews, ordinary GET/POST behavior, alternate prompts,
aircraft and curriculum controls, key-free list rendering, draft deletion,
review/publication controls, imported adoption, and link review. Coordinator
accessibility, integration, security, authorization, golden, and browser suites
provide the cross-tranche completion gate.

All fixtures and examples use synthetic content. No authoritative question,
choice, key, or source identifier is reproduced here.
