# Phase 0B — Workflow archaeology

## Scope and evidence standard

This report inventories repository-visible SJTester workflows on the
`system_discovery` branch. It is repository archaeology only: no production
system, live database, credentials, or hosted page was accessed. Consequently,
"reachable" below means reachable through repository code, not confirmed in
production.

Evidence labels:

- **Confirmed (repository):** directly implemented or linked in checked-in
  code.
- **Inferred:** a likely purpose or disposition derived from naming, links,
  code history, or similarity. It requires confirmation before becoming a
  migration requirement.
- **External confirmation required:** cannot be established without an
  application owner, production URL/traffic inventory, or a safe live-system
  walkthrough.

The central finding is that the repository does not describe one internally
consistent application. The root redirect and instructor dashboard lead into
the older workflow, shared navigation leads into the later task-modeling
workflow, and shared endpoint/classes contain a mixture of both data models.
Production status cannot be settled from Git alone.

## Entry points and navigation

| Page or artifact | Repository-visible role | Reachability / likely disposition |
| --- | --- | --- |
| [`index.php`](../../../index.php#L1) | Redirects to a hosted `instructorArea.php`. | **Confirmed (repository)** root entry behavior. Whether the checked-in redirect target remains production is an **external confirmation** item. |
| [`instructorArea.php`](../../../instructorArea.php#L780) | Instructor login, test creation link, exam link, reports, and administrator tools. | **Primary active candidate.** It is the root redirect target and is named by shared navigation. Its internal buttons still route to older `testModeling.php` and `questionCRUD.php` implementations ([lines 381–399](../../../instructorArea.php#L381)). |
| [`Classes/contentClass.php`](../../../Classes/contentClass.php#L23) | Shared header/navigation. | **Confirmed (repository)** navigation routes to `instructorArea.php`, `testModeling_taskModeling.php`, `questionCRUD_taskModeling.php`, and `taskModeling.php` ([lines 32–57](../../../Classes/contentClass.php#L32)). This conflicts with the dashboard's older routes. |
| [`examCMS.php`](../../../examCMS.php#L220) | Student/instructor exam login, delivery, navigation, submission, scoring, and correction review. | **Active candidate.** Linked from `instructorArea.php`; production use remains unconfirmed. |
| [`testCRUD.php`](../../../testCRUD.php#L242) | Select/use/delete test models and generate an exam with a test/override password pair; also contains an older model-creation UI. | **Active candidate.** Linked from the dashboard's "Create a new test" action. |
| [`testModeling.php`](../../../testModeling.php#L1) | Older accordion test-template authoring by SPO/EO. | **Competing active candidate.** Dashboard admin action points here, but shared navigation does not. |
| [`testModeling_taskModeling.php`](../../../testModeling_taskModeling.php#L23) | Later DVA-oriented test-template authoring by Subtask/Element, with mandatory elements. | **Task-modeling candidate.** Shared navigation points here; not linked by the dashboard. |
| [`questionCRUD.php`](../../../questionCRUD.php#L1) | Older question CRUD by aircraft variant and SPO/EO. | **Competing active candidate.** Dashboard admin action points here, but shared navigation does not. |
| [`questionCRUD_taskModeling.php`](../../../questionCRUD_taskModeling.php#L1) | Later question CRUD relabeled for Subtask/Element and DVA/ERJ/CRJ variants. | **Task-modeling candidate.** Shared navigation points here; not linked by the dashboard. It contains an apparent JavaScript defect in the edit population call ([line 167](../../../questionCRUD_taskModeling.php#L167)). |
| [`taskModeling.php`](../../../taskModeling.php#L137) | CRUD tree for Phase → Task → Subtask → Element, including Bloom levels/key verbs and ordering. | **Task-modeling candidate.** Shared navigation points here. No page-level login check is visible, unlike question/test modeling. Production exposure must be confirmed. |
| [`faq.php`](../../../faq.php#L1) | Instructor help for test creation, access, and reports. | **Support-page candidate.** JavaScript still contains a dashboard route, but the current dashboard markup has no active FAQ button. |
| [`instructorArea_wip.php`](../../../instructorArea_wip.php#L1) | Expanded dashboard prototype with predefined tests and daily quiz generation. | **WIP/obsolete candidate.** Filename says WIP, it is unreferenced, and its first character makes its response malformed. Never infer its added behavior as required without owner confirmation. |
| [`plus_sign.php`](../../../plus_sign.php#L31) | Standalone prototype of predefined SYS/UPG tests and a selected-system daily quiz. | **Prototype/obsolete candidate.** No repository page links to it; similar code is embedded in `instructorArea_wip.php`. |
| [`aerodataCRUD.php`](../../../aerodataCRUD.php#L1) | Earlier question-CRUD variant. | **Obsolete/orphan candidate.** Added earlier than the current question pages and has no repository inbound link. |
| [`testCRUD.php`](../../../testCRUD.php#L336) model-authoring section | Older model authoring embedded below model selection/generation. | **Duplicate implementation within a reachable page.** It competes with both test-modeling pages. |
| `date.php`, `isotope.html` | Small date/demo artifacts. | **Development/demo candidates;** no inbound application links found. |

### Navigation contradiction

**Confirmed (repository):** two navigation systems select different generations
of the question and model-authoring UI:

1. The shared bar selects the `_taskModeling` pages
   ([`contentClass.php` lines 36–45](../../../Classes/contentClass.php#L36)).
2. The dashboard admin buttons select the older pages
   ([`instructorArea.php` lines 381–391](../../../instructorArea.php#L381)).

**Inference:** the task-modeling work was integrated into the common navigation
but not converged into the dashboard. This does not prove which set, if either,
is live.

## Major workflow traces

### 1. Instructor identity and dashboard

1. **Confirmed (repository):** an instructor enters employee number and
   password on `instructorArea.php` ([lines 790–805](../../../instructorArea.php#L790)).
2. The page posts to
   [`PHPScripts/admin/instructorLogin.php`](../../../PHPScripts/admin/instructorLogin.php#L7),
   which either reports the existing session or looks up the instructor and
   populates session identity/admin fields ([lines 12–21 and 39–75](../../../PHPScripts/admin/instructorLogin.php#L12)).
3. On success, instructor tasks appear; administrator tasks appear only when
   the returned `admin` flag is true
   ([`instructorArea.php` lines 79–97](../../../instructorArea.php#L79)).
4. Logout posts to
   [`instructorLogout.php`](../../../PHPScripts/admin/instructorLogout.php#L1)
   and hides the task areas ([`instructorArea.php` lines 371–378](../../../instructorArea.php#L371)).

**Confirmed UI behavior:** instructors can enter the test-generation page,
enter the exam page, and run class/student/curriculum reports. The view-tests
button exists in JavaScript but its markup is commented out
([`instructorArea.php` lines 499–524](../../../instructorArea.php#L499),
[`lines 820–825`](../../../instructorArea.php#L820)).

**External confirmation required:** whether instructors currently view their
generated-test history through a different route, and which non-admin report
scope is intended. `instructorArea_wip.php` attempted to restrict date lists to
the current instructor, but that file is not an active candidate by repository
linkage alone.

### 2. Administrator workflow

**Confirmed (repository):** the dashboard exposes these administrator-only UI
sections after client-side role detection ([`instructorArea.php` lines
861–918](../../../instructorArea.php#L861)):

- View all scores by year, quarter, or month.
- Export cumulative scores or quarterly SPO analysis.
- Open question authoring and test-model authoring.
- Produce a printable paper test from an access password.
- List, add, edit, and delete instructor records.

Most operations multiplex through
[`PHPScripts/admin/getReports.php`](../../../PHPScripts/admin/getReports.php#L30).
That endpoint supports generated-test history, questions for a generated test,
student/class reports, all scores, instructor management, question ejection,
date lookup, SPO/Element lists, and missed-question analysis
([lines 33–115](../../../PHPScripts/admin/getReports.php#L33)).

**Important confirmed implementation mismatch:** `getReports.php` checks only
that a session name exists before dispatching every option; it does not perform
a server-side admin-role check ([lines 30–31](../../../PHPScripts/admin/getReports.php#L30)).
Therefore the UI grouping is not proof of authorization policy. The intended
role ownership of each option requires owner confirmation and belongs in the
security remediation scope.

### 3. Curriculum/task authoring

**Confirmed (repository):** `taskModeling.php` loads and presents a nested
Phase → Task → Subtask → Element tree, supports create/update/delete at each
level, supports ordering, and associates Bloom taxonomy levels/key verbs. The
page calls the dedicated Phase/Task/Subtask/Element and Bloom endpoints; for
example, element load is at
[`taskModeling.php` lines 137–159](../../../taskModeling.php#L137), while the UI
entry is the add-phase tree at [lines 732–740](../../../taskModeling.php#L732).

Endpoint families:

- Read: `getPhases.php`, `getTasks.php`, `getSubtasks.php`, `getElements.php`.
- Create: `createPhase.php`, `createTask.php`, `createSubtask.php`,
  `createElement.php`.
- Update: `updatePhase.php`, `updateTask.php`, `updateSubtask.php`,
  `updateElement.php`.
- Delete: `deletePhase.php`, `deleteTask.php`, `deleteSubtask.php`,
  `deleteElement.php`.
- Bloom metadata: `getBlooms.php`, `getBloomsLevelsForRange.php`, and
  `getBloomsVerbs.php`.

**External confirmation required:** whether this route and hierarchy reached
production, who owns it, whether deletion is used, and whether any hierarchy
level is considered authoritative.

### 4. Question authoring

There are three generations of a similar CRUD workflow.

**Confirmed common flow:** authenticate in the browser, select a variant and
curriculum category, list questions, switch between create/edit modes, and call
shared endpoints to insert, fetch, update, or delete. The later page's calls are
visible at [`questionCRUD_taskModeling.php` lines
40–95](../../../questionCRUD_taskModeling.php#L40) and
[127–252](../../../questionCRUD_taskModeling.php#L127).

| Implementation | Curriculum vocabulary | Variant UI | Repository linkage |
| --- | --- | --- | --- |
| `aerodataCRUD.php` | Earlier SPO-oriented form | Earlier/limited | No inbound link found. |
| `questionCRUD.php` | SPO / EO | ERJ/CRJ switch | Dashboard admin action. |
| `questionCRUD_taskModeling.php` | Subtask / Element | DVA, ERJ, CRJ select | Shared navigation. |

All three call the same question endpoints and
[`Classes/testClass.php`](../../../Classes/testClass.php#L5). The shared class
now joins the task hierarchy when reading questions
([lines 587–637](../../../Classes/testClass.php#L587)), while some edit fields
still reference legacy `spo_id`/`eo_id` names
([lines 659–689](../../../Classes/testClass.php#L659)).

**Confirmed apparent defects, not requirements:**

- The task page uses `populateElementsForSubtask("#edit_spo".val(), ...)`,
  calling `.val()` on a string rather than a jQuery object
  ([`questionCRUD_taskModeling.php` line 167](../../../questionCRUD_taskModeling.php#L167)).
- The shared update SQL contains unattached `NULL` fragments and appends
  association fragments to a different variable
  ([`testClass.php` lines 560–576](../../../Classes/testClass.php#L560)).
- The "none correct" insertion path has a misspelled query variable
  ([`testClass.php` lines 480–497](../../../Classes/testClass.php#L480)).

These show incomplete convergence; they must not be preserved as intended
behavior.

### 5. Test-template authoring and generated-test creation

#### Template authoring

Three competing surfaces exist:

- `testCRUD.php` contains older row-based model creation, model listing,
  selection, and deletion ([lines 171–240](../../../testCRUD.php#L171)).
- `testModeling.php` is an older accordion SPO/EO authoring page.
- `testModeling_taskModeling.php` is an accordion Subtask/Element page fixed to
  DVA and supporting mandatory elements
  ([lines 23–54 and 221–255](../../../testModeling_taskModeling.php#L23)).

They share `newTestModel.php`, `getQuestionCount.php`, `showTestModels.php`, and
`removeModel.php`. The current `getQuestionCount.php` ignores the variant input
sent by `testCRUD.php` and calls the task-hierarchy count method
([`getQuestionCount.php` lines 1–6](../../../PHPScripts/getQuestionCount.php#L1)).
This is direct evidence that the older generation UI and later shared backend
were not fully reconciled.

#### Generated test from a saved model

1. **Confirmed (repository):** `testCRUD.php` filters models by fleet/course,
   lets a user select one, generates a test/override password pair, and posts
   the model and instructor fields to `createNewTest.php`
   ([lines 197–265](../../../testCRUD.php#L197)).
2. `createNewTest.php` retrieves the saved model and asks `Exam` to generate a
   test ([lines 13–27](../../../PHPScripts/createNewTest.php#L13)).
3. `Exam::generateTest()` randomly selects mandatory-element questions and
   remaining questions, inserts the generated test, snapshots generated
   question wording/choices/key into `usedQuestions`, and returns identifiers
   and access metadata
   ([`Exam.php` lines 73–236](../../../Classes/Exam.php#L73)).

**External confirmation required:** which template surface is used, supported
fleets/course types/lengths, ownership of model deletion, whether generation is
always model-based, and whether the model association is retained for history.

#### Predefined and daily-quiz generation

**Confirmed (repository):** `plus_sign.php` and `instructorArea_wip.php`
contain UI calls for predefined SYS/UPG tests and selected-system daily quizzes
([`plus_sign.php` lines 45–145](../../../plus_sign.php#L45)).

**Confirmed incomplete/WIP evidence:** the called backend expects
`Test_Model::modelForType()` and `modelForDailyQuiz()`, but those methods are not
defined in the checked-in `Test_Model` class. The daily-quiz client also
misspells the instructor parameter and the endpoint replaces it with a
hard-coded value
([`plus_sign.php` lines 130–139](../../../plus_sign.php#L130),
[`createNewDailyQuiz.php` lines 6–15](../../../PHPScripts/createNewDailyQuiz.php#L6)).
Treat both flows as **unconfirmed prototypes**, not migration scope.

### 6. Student exam access and delivery

1. **Confirmed (repository):** the candidate student page collects name,
   employee number, class date, qualification code, syllabus, retraining flag,
   and test password
   ([`examCMS.php` lines 761–881](../../../examCMS.php#L761)).
2. Basic client validation requires names and a five-digit employee number
   ([lines 722–734](../../../examCMS.php#L722)).
3. `getExam.php` delegates access to `Exam::fetchQuestionsForTest()`
   ([`getExam.php` lines 3–10](../../../PHPScripts/getExam.php#L3)).
4. The class rejects absent/expired test passwords, records a first login per
   student/test password, and requires the matching override password for a
   subsequent login
   ([`Exam.php` lines 261–383](../../../Classes/Exam.php#L261)).
5. The browser shuffles question order, retains answers and marks only in the
   page's JavaScript memory, supports previous/next wraparound and direct
   marked/unanswered navigation
   ([`examCMS.php` lines 74–214](../../../examCMS.php#L74),
   [250–299](../../../examCMS.php#L250)).

**Confirmed implementation behavior:** a re-login fetches the original
generated question snapshot but does not fetch previously selected answers.
There is no autosave/resume endpoint in the repository. Thus "re-login" is
implemented, while "resume prior answer state" is not evidenced.

**Instructor variation:** when an instructor session exists, the exam page
prefills/hides student metadata and sends `doNotGrade=true`
([`examCMS.php` lines 28–30 and 739–746](../../../examCMS.php#L28),
[600–625](../../../examCMS.php#L600)). This appears to be a preview/take-test
workflow; its intended scope needs owner confirmation.

### 7. Submission, grading, and correction review

1. The first Grade click checks that every question has an answer; a second
   click after the readiness message submits
   ([`examCMS.php` lines 672–689](../../../examCMS.php#L672)).
2. `gradeExam.php` converts the submitted question array to question-ID/choice
   pairs and delegates to `Exam::gradeExam()`
   ([`gradeExam.php` lines 31–39](../../../PHPScripts/gradeExam.php#L31)).
3. The class compares each submitted choice to the snapshotted answer key,
   writes per-question results and an attempt summary unless in instructor
   preview mode, calculates a percentage, and returns satisfactory or
   unsatisfactory
   ([`Exam.php` lines 415–480](../../../Classes/Exam.php#L415)).
4. The browser shows the score and forces each missed item to be corrected
   before review is considered complete
   ([`examCMS.php` lines 600–668](../../../examCMS.php#L600) and
   [180–200](../../../examCMS.php#L180)).

**Confirmed limitation:** the correction/retraining interaction is client-only;
the initial score is the stored record, and no corrected-answer write is
visible. Whether that is intentional must be confirmed.

### 8. Reporting, question ejection, printing, and export

**Confirmed repository report surfaces:**

| Surface | Inputs / output | Evidence |
| --- | --- | --- |
| Single-student report | Test date + student identifier; weak systems and missed questions; printable popup. | [`instructorArea.php` lines 150–192](../../../instructorArea.php#L150) |
| Class report | Test date; class average and per-student outcomes/scores; printable popup. | [`instructorArea.php` lines 116–148](../../../instructorArea.php#L116) |
| Class curriculum analysis | Test date + instructor; system/SPO percentages plus missed-question/student detail. | [`instructorArea.php` lines 194–240](../../../instructorArea.php#L194) |
| All scores | Year/quarter/month selection; tabular attempt history. | [`instructorArea.php` lines 551–575](../../../instructorArea.php#L551) |
| Generated-test history | Instructor-created tests, class/category averages, generated question snapshot. | JavaScript exists at [`instructorArea.php` lines 431–524](../../../instructorArea.php#L431), but its dashboard button is commented out. |
| Question ejection | Within 24 hours, set a generated question aside and recalculate affected outcomes. | UI behavior at [`instructorArea.php` lines 402–460](../../../instructorArea.php#L402); implementation in [`ReportsClass.php` from line 544](../../../Classes/ReportsClass.php#L544). |
| Printable paper test | Access password retrieves the generated test into a new browser window. | [`instructorArea.php` lines 724–740](../../../instructorArea.php#L724) |
| Cumulative score CSV | Session-gated direct download generated by `Reports::cumulativeTestStats()`. | [`downloadables/download.php` lines 3–24](../../../downloadables/download.php#L3) |
| Quarterly SPO CSV | POST generates a shared CSV, subsequent GET downloads it. | [`downloadQuarterlySPO.php` lines 3–35](../../../downloadables/downloadQuarterlySPO.php#L3) |

**Hybrid-model evidence:** `ReportsClass` retains older SPO/EO methods alongside
newer Subtask/Element methods
([`ReportsClass.php` lines 1132–1287](../../../Classes/ReportsClass.php#L1132)).
Report labels and groupings therefore need to be reconciled against live data
and owner expectations.

## Endpoint and class inventory

### Browser-facing PHP endpoints

| Domain | Endpoints | Repository-visible caller / role |
| --- | --- | --- |
| Instructor session | `admin/instructorLogin.php`, `admin/instructorLogout.php` | Dashboard plus question/test pages; establishes or clears instructor session. |
| Reports and instructor administration | `admin/getReports.php` | Dashboard, question helper script, and test-modeling pages; option-dispatch endpoint for reports, instructor CRUD, generated-test inspection/ejection, and curriculum lists. |
| Question CRUD | `newQuestion.php`, `viewQuestions.php`, `fetchQuestionForEditing.php`, `updateQuestion.php`, `deleteQuestion.php` | All competing question pages. |
| Test-template CRUD | `getQuestionCount.php`, `newTestModel.php`, `showTestModels.php`, `removeModel.php` | `testCRUD.php` and both test-modeling pages. |
| Generated exams | `passwordGenerator.php`, `createNewTest.php` | `testCRUD.php`. |
| Prototype generated exams | `createNewTestOfType.php`, `createNewDailyQuiz.php` | `plus_sign.php` and `instructorArea_wip.php`; incomplete against current classes. |
| Exam delivery | `getExam.php`, `gradeExam.php` | `examCMS.php`; `getExam.php` is also used for paper printing. |
| Task hierarchy | `get/create/update/delete` for Phase, Task, Subtask, Element | `taskModeling.php`. |
| Bloom taxonomy | `getBlooms.php`, `getBloomsLevelsForRange.php`, `getBloomsVerbs.php` | `taskModeling.php`. |
| Legacy curriculum helper | `showSPO.php` | No current browser caller found. |
| Exports | `downloadables/download.php`, `downloadQuarterlySPO.php` | Dashboard admin export controls. |

### Domain/data-access classes

| Class | Repository-visible responsibility |
| --- | --- |
| `ContentSnippets` | Shared header and the later navigation map. |
| `Question` (`testClass.php`) | Question type/choice shaping, CRUD, task-hierarchy lookup, and generated-question randomization. |
| `Test_Model` | Saved model creation/retrieval/list/deletion and question inventory by task-model category. |
| `Exam` | Generated-test materialization, access/re-login, grading, and attempt/result persistence. |
| `Reports` | Generated-test, student/class, curriculum, score, instructor-management, ejection, and export queries. |
| `Phase`, `Task`, `Subtask`, `Element`, `Blooms` | Task curriculum hierarchy and taxonomy CRUD/lookups. |
| `XJTestDBConnect.php` | Shared database connection settings. Values were not reproduced or used. |
| `eo_analysis.php`, `mailer.php` | Offline/auxiliary analysis and mail integration candidates; no active page caller found. |

## Duplicate, obsolete, WIP, and incomplete disposition register

The following are recommended discovery dispositions, not deletion decisions:

| Artifact / feature | Recommended Phase 0 disposition | Reason / confirmation needed |
| --- | --- | --- |
| `instructorArea.php` | **Retain as active candidate** | Root redirect target and main workflow hub. Confirm production URL/version. |
| `instructorArea_wip.php` | **Exclude by default; owner review** | Unlinked, explicitly WIP, malformed opening, and contains incomplete generation code. Ask whether any unique UI behavior was ever adopted elsewhere. |
| `questionCRUD.php` vs `questionCRUD_taskModeling.php` | **Competing; decision required** | Dashboard and shared navigation disagree. Confirm production URLs and authoritative curriculum hierarchy. |
| `testModeling.php` vs `testModeling_taskModeling.php` vs embedded authoring in `testCRUD.php` | **Competing/duplicate; decision required** | Three surfaces share drifting backend contracts. Confirm the one actually used and whether separate authoring and generation roles are intentional. |
| `aerodataCRUD.php` | **Exclude by default; owner review** | Orphan earlier question implementation. |
| `plus_sign.php` and predefined/daily quiz flow | **Prototype; exclude unless demonstrated live** | Orphan/WIP UI plus missing backend methods and hard-coded behavior. |
| `taskModeling.php` | **Retain as later candidate; decision required** | Direct shared-navigation link and newest feature history, but no production evidence and no visible auth gate. |
| Generated-test history UI | **Dormant feature; decision required** | Implementation exists, dashboard control is commented out. |
| FAQ | **Support content candidate** | Page exists; current dashboard control is absent. Confirm whether documentation is maintained elsewhere. |
| `date.php`, `isotope.html`, auxiliary CSV-analysis classes | **Development/offline candidate** | No active-route linkage. Confirm operational use before excluding. |

## Unsupported or contradictory behavior requiring focused validation

Priority is based on impact to scope and target route/domain design.

1. **Which exact production URLs/pages are used today?** Obtain an owner-led
   walkthrough or sanitized access log inventory. This resolves the older vs
   task-modeling question/test pages and the WIP/prototype surfaces.
2. **Which curriculum hierarchy is authoritative in each workflow?** Question,
   template, generation, and report code mixes SPO/EO and Subtask/Element.
3. **Is `taskModeling.php` a production administrator workflow?** If yes,
   identify owner, role, validation, deletion expectations, and current URL.
4. **Which test-template workflow is supported?** Decide among the embedded
   `testCRUD` authoring UI and the two standalone model pages; confirm whether
   saved models and mandatory elements are in current use.
5. **Are predefined SYS/UPG tests or daily quizzes real workflows?** Require a
   live demonstration or owner evidence before adding them to scope.
6. **What is the intended instructor/admin report matrix?** Confirm who may see
   all dates, all students, answer keys, generated passwords, exports, and
   instructor records. Browser visibility and server dispatch do not agree on
   a reliable authorization boundary.
7. **Is generated-test history intentionally unavailable?** The code is
   implemented but the dashboard action is commented out.
8. **Is question ejection used, who may perform it, and is the 24-hour window
   intentional?** Confirm report/audit and recalculation expectations.
9. **Is instructor exam preview (`doNotGrade`) used?** Confirm how instructors
   access it and whether login records should be created during preview.
10. **Does "resume" mean only re-entry or restoration of saved answers?** The
    repository supports override-based re-entry but contains no answer autosave
    or server-side resume state.
11. **Is forced correction after grading part of the required student flow?**
    It is client-only and does not alter the stored initial result.
12. **Which reports/exports are operational requirements?** Confirm printed
    popup reports, paper tests, cumulative CSV, quarterly curriculum CSV, and
    any externally maintained reports not present in Git.

## Initial 0B status before owner attestation

Repository discovery is complete for checked-in PHP pages, endpoints, shared
navigation, main classes, reports, exports, and major workflow paths. Each
identified surface has a provisional disposition and confirmed behavior is
separated from inference.

Phase 0B is **not authoritative for production** until the external items above
are resolved. In particular, the Phase 0 acceptance criterion that every active
workflow have an owner and disposition remains blocked on a production URL or
access-log inventory and an application-owner walkthrough. No final migration
scope should treat an orphan, WIP, dormant, or task-modeling implementation as
required solely because it exists in this repository.

The owner addendum below supersedes this repository-only checkpoint status.

## Owner decision addendum — July 12, 2026

The product scope in [OWNER_DECISIONS.md](OWNER_DECISIONS.md) supersedes the
policy questions above while leaving production reachability unconfirmed:

- Include the primary dashboard, exam, reporting, and task-modeling curriculum,
  question, and template behavior.
- Exclude older duplicate UI variants, daily/predefined WIP flows, FAQ, mail,
  offline analysis, demos, and other orphan/prototype artifacts unless a later
  signed scope change adds an owner and requirement.
- Require generated-test history, student/class/curriculum/organization reports,
  printable exam views, and audited CSV exports even where a legacy control is
  dormant.
- Replace client-side role behavior with server-enforced granular roles and
  owned instructor/report scopes.
- Replace legacy override re-entry with a roster-bound, timed, autosaved attempt
  and full audited resume. Required correction review occurs in a separate
  instructor-opened remediation session.
- Preserve instructor exam preview only as a server-authorized, audited view that
  creates no student attempt, login, score, or reportable result; never trust the
  legacy client `doNotGrade` flag.
- Use staff-entered or validated CSV rosters; external roster-system integration
  is outside initial scope.

Matthew Hull subsequently confirmed that the application is completely shut
down and no workflow is active today. Access logs and a live walkthrough do not
exist and are no longer required. The historical workflow inventory plus the
approved replacement/exclusion dispositions satisfy 0B's active-workflow gate.
