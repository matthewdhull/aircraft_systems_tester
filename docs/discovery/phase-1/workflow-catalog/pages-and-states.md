# Pages and states

## Actor and entry matrix

| Surface | Legacy entry condition / actor assumption | Legacy observed states | Target approved boundary |
| --- | --- | --- | --- |
| `instructorArea.php` | Public page initially; instructor submits staff identifier and password. Existing session is probed on load ([lines 79–97](../../../../instructorArea.php#L79), [login fields](../../../../instructorArea.php#L790)). | logged out; login pending; instructor dashboard; administrator controls; report output; logged out | New staff accounts only; secure authentication and server-enforced granular roles. Instructor sees assigned scope; privileged reports/actions require explicit permission. |
| `questionCRUD_taskModeling.php` | Calls login-status endpoint; body is replaced when logged out, and authoring area is shown only for the legacy admin flag ([lines 35–53](../../../../questionCRUD_taskModeling.php#L35)). | variant/category browse; create; edit; delete; five question-type field layouts | Question Author creates/versions drafts; a distinct authorized reviewer publishes/retires; effective published versions only are generated. |
| `testModeling_taskModeling.php` | Calls login status; task-model UI is visible only for the legacy admin flag ([lines 75–98](../../../../testModeling_taskModeling.php#L75)). | category-count accordion; mandatory-element selection; quantity total; submit pending | Curriculum Manager versions/publishes/retires templates; reviewed controlled vocabulary replaces fixed constants. |
| `testCRUD.php` | Session status populates instructor identifier; model list is filtered by selected fleet/course ([lines 197–240](../../../../testCRUD.php#L197)). | model filter/list; model selected; generated credentials prepared; generation pending; result/error message | Instructor publishes/starts from approved template; generation is atomic and shortages are actionable. Secrets are never rendered into durable discovery evidence. |
| `taskModeling.php` | Shared navigation links directly; no page-level login check is evident in the page ([navigation](../../../../Classes/contentClass.php#L44), [tree entry](../../../../taskModeling.php#L732)). | hierarchy loaded; add/edit/delete Phase, Task, Subtask, Element; Bloom/key-verb selection | Curriculum Manager only; version/publish/retire rather than hard deletion. Source task hierarchy starts empty. |
| `examCMS.php` | Student supplies identity/training fields plus exam code; instructor session changes the form to preview-like mode ([form](../../../../examCMS.php#L760), [instructor branch](../../../../examCMS.php#L739)). | access form; validation error; loading; recovery prompt; exam delivery; marked/unanswered review; submit readiness; result; correction review; complete | Roster-bound access, timed persisted attempt, autosave/full recovery, server-authorized preview, and separate persisted remediation. |
| dashboard reports | Instructor session; some controls are client-hidden behind binary admin flag ([dashboard visibility](../../../../instructorArea.php#L79), [admin markup](../../../../instructorArea.php#L861)). | criteria selection; loading; empty/error; table/list; print popup; export request | Assigned scope for Instructor; organization reports, answer keys, exports, corrections, and administration need explicit permission and audit. |

## Instructor login, dashboard, and logout

### Form and transitions

- Fields: staff identifier and password
  ([instructorArea.php](../../../../instructorArea.php#L790)).
- Submit posts those two fields and expects JSON containing at least
  `loggedIn`, `message`, and, on a session/success path, role/session display
  fields ([client](../../../../instructorArea.php#L350),
  [endpoint](../../../../PHPScripts/admin/instructorLogin.php#L7)).
- Success hides login, reveals instructor tasks, optionally reveals admin tasks,
  and populates report dates ([instructorArea.php](../../../../instructorArea.php#L79)).
- Failure clears task/report state. Repository branches distinguish missing
  input, no matching record, and mismatched password
  ([instructorLogin.php](../../../../PHPScripts/admin/instructorLogin.php#L46)).
- Logout calls the session-clearing endpoint and returns to logged-out UI
  ([client](../../../../instructorArea.php#L371),
  [endpoint](../../../../PHPScripts/admin/instructorLogout.php#L1)).

### Suspected defects

Passwords are compared directly and the query is assembled from request input
([instructorLogin.php](../../../../PHPScripts/admin/instructorLogin.php#L39)).
Admin visibility is client-controlled and is not a server authorization proof.
Both behaviors are expressly replaced by the Phase 0 authentication and role
decisions.

## Question authoring

### Browse and mode states

The approved preservation surface is the task-modeling behavior, not the exact
duplicate page. Variant and subtask selection request a list; each result offers
edit/delete. The page toggles between create and edit panels
([list request](../../../../questionCRUD_taskModeling.php#L194),
[mode transitions](../../../../questionCRUD_taskModeling.php#L439)).

Create/edit fields include type; variant; subtask; element; primary prompt;
optional alternate prompt; and up to three correct and three incorrect source
choice slots. The UI reveals fields based on the five type codes
([type selector](../../../../questionCRUD_taskModeling.php#L553),
[field shaping](../../../../questionCRUD_taskModeling.php#L350)). The fields are
structural evidence only; no real prompt or choice is recorded here.

Create posts the form shape then clears content fields and refreshes the list
([questionCRUD_taskModeling.php](../../../../questionCRUD_taskModeling.php#L57)).
Edit first fetches a record, populates the form, then posts the same core shape
plus question identifier ([fetch](../../../../questionCRUD_taskModeling.php#L127),
[update](../../../../questionCRUD_taskModeling.php#L217)). Delete posts only the
question identifier ([lines 173–183](../../../../questionCRUD_taskModeling.php#L173)).

### Validation/error characterization

The browser varies visible fields by type, but no complete server validation
contract is evident at these endpoints. Blank, duplicate, incompatible, or
unknown-type inputs therefore require negative target cases. The task page also
calls `.val()` on a string while populating an edit association
([line 167](../../../../questionCRUD_taskModeling.php#L167)); this is a suspected
defect, not a state to preserve.

## Test-template authoring and generation

The task-modeling UI presents a variant, course type, configured length, model
name, per-subtask counts, and mandatory elements
([form](../../../../testModeling_taskModeling.php#L25)). Count controls cap at
reported inventory and cannot be reduced below selected mandatory elements
([lines 109–143](../../../../testModeling_taskModeling.php#L109)). Selecting a
mandatory element increments its parent count
([lines 149–178](../../../../testModeling_taskModeling.php#L149)). Submit posts
the count array and parent/element pairs
([lines 221–254](../../../../testModeling_taskModeling.php#L221)).

The generation page filters saved models, exposes use/delete controls, and hides
delete for non-admin users in the browser
([testCRUD.php](../../../../testCRUD.php#L197)). Choosing a model prepares
generated access material; generation posts model, instructor, and access
fields and expects a JSON status object
([lines 242–265](../../../../testCRUD.php#L242)). The catalog intentionally does
not reproduce access material.

Observed generation randomly selects mandatory and remaining questions
([Exam.php](../../../../Classes/Exam.php#L83)), inserts a generated-test header,
then snapshots rendered prompt/choice/key data
([Exam.php](../../../../Classes/Exam.php#L173)). No server assertion for exact
counts is visible; identifier recovery uses the newest timestamp
([Exam.php](../../../../Classes/Exam.php#L189)). Silent shortage and concurrent
misassociation are suspected defects. Target behavior is atomic exact-count
generation with secure recorded seed/version and immutable snapshots.

## Student access and delivery

The form structurally collects student identity, class date, qualification,
syllabus, retraining indicator, and exam code; a recovery field is initially a
separate state ([examCMS.php](../../../../examCMS.php#L760)). Client validation
requires nonblank names and a five-digit numeric identifier
([lines 722–734](../../../../examCMS.php#L722)). That legacy rule is observation,
not the approved identity contract.

Begin posts student identifier, exam code, and optional recovery value
([lines 224–299](../../../../examCMS.php#L224)). The server rejects a missing or
expired code after one hour, records the first access, and requires matching
recovery data for later entry
([Exam.php](../../../../Classes/Exam.php#L277)). Success returns snapshotted
question display fields, which the browser augments with empty answer and mark
state and shuffles in memory ([examCMS.php](../../../../examCMS.php#L257)).

Delivery supports previous/next wraparound, direct unanswered/marked navigation,
answer selection, and marking in browser state
([examCMS.php](../../../../examCMS.php#L74)). There is no autosave contract.
Re-entry refetches content but reconstructs empty client state. Target behavior
instead restores the same persisted attempt's answers, marks, order, position,
and timing through single-use audited recovery.

## Submission, grading, and remediation

The first submit action counts answered items. All answered changes the button
into a ready-to-submit state; unanswered items produce a warning
([examCMS.php](../../../../examCMS.php#L672)). A second action posts the full
client question array and student/training metadata
([examCMS.php](../../../../examCMS.php#L600)).

The server compares selected letter to snapshot key, counts misses, calculates
percentage using configured test length, applies an 80 threshold, persists
question and attempt rows except when the client preview flag suppresses it, and
returns counts/outcome/missed identifiers
([Exam.php](../../../../Classes/Exam.php#L415)). Target grading uses actual valid
snapshot count, exact counts before two-decimal display rounding, and treats
deadline-unanswered items as incorrect.

After grading, the client displays score/outcome data and, for missed items,
requires choosing the known correct answer before removing each review tile
([examCMS.php](../../../../examCMS.php#L626),
[correction loop](../../../../examCMS.php#L180)). No corrected response is
persisted. Target remediation is a separate instructor-opened persisted session;
completion or audited waiver leaves original score/outcome unchanged.

## Reports, print, and export

| Surface | Legacy inputs and state/output shape | Evidence | Approved target |
| --- | --- | --- | --- |
| Student | date + student identifier; not-found state or weak-category and missed-item detail; popup print | [instructorArea.php](../../../../instructorArea.php#L150) | Student report for authorized scope; protected assessment detail and answer-key permission enforced. |
| Class | date; class summary plus member outcome/score rows; popup print | [instructorArea.php](../../../../instructorArea.php#L116) | Required assigned-class report. |
| Curriculum performance | date + instructor; category percentages plus missed-item/member detail | [instructorArea.php](../../../../instructorArea.php#L194) | Required curriculum report with scoped access and safe legacy aggregates only. |
| Generated-test history | current instructor; generated-test summaries, category averages, snapshot inspection | [instructorArea.php](../../../../instructorArea.php#L499) | Required, although legacy dashboard control is dormant; historical migration is aggregate-only. |
| Organization scores | year + period type/value; attempt rows | [instructorArea.php](../../../../instructorArea.php#L551) | Required organization report with explicit permission. |
| Printable exam | exam access field; opens printable question snapshot | [instructorArea.php](../../../../instructorArea.php#L724) | Required permissioned printable view; answer-key access remains separate. |
| Cumulative CSV | authenticated GET; writes and downloads shared fixed-name CSV | [download.php](../../../../downloadables/download.php#L3) | Audited export, generated for no more than 24 hours; no shared fixed path. |
| Quarterly curriculum CSV | authenticated POST builds shared file; later GET downloads it | [downloadQuarterlySPO.php](../../../../downloadables/downloadQuarterlySPO.php#L3) | Audited scoped export; privacy-safe historical aggregate only. |

The repository's fixed-file export behavior creates confidentiality and
concurrency risk. Report code may expose identities, assessment content, and
keys, but this artifact records only shapes and never reproduces values. Any
legacy-history target report uses only the approved non-identifying aggregate
datasets, suppresses or coarsens every group smaller than five, and never joins
those facts into current student or grading workflows
([source disposition](../../phase-0/SOURCE_EXPORT_DISPOSITION.md#privacy-safe-aggregate-contract)).
