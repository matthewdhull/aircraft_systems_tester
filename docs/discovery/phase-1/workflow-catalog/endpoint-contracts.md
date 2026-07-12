# Browser-facing endpoint contracts

## Interpretation

These are static contracts inferred from checked-in callers and PHP dispatch.
All methods are repository-observed POST unless noted. HTTP status, headers
other than CSV downloads, authentication failure status, actual database values,
and successful execution are **runtime unavailable**. Payload names are retained
because future compatibility tests need them; protected values are omitted.

## Identity and reporting

| Endpoint / operation | Request fields | Observed response shape and states | Evidence / concern |
| --- | --- | --- | --- |
| `admin/instructorLogin.php` | optional `employeeNo`, `loginPassword`; null request probes session | JSON with `loggedIn`, `message`; session/success may add `admin`, `employeeNo`, `name`, `instructorID` | [endpoint](../../../../PHPScripts/admin/instructorLogin.php#L7), [caller](../../../../instructorArea.php#L79). Direct password comparison and interpolated query are rejected defects. |
| `admin/instructorLogout.php` | none | empty body; client transitions locally | [endpoint](../../../../PHPScripts/admin/instructorLogout.php#L1), [caller](../../../../instructorArea.php#L371). Session variables are individually unset. |
| `admin/getReports.php` | `option` plus option-specific fields | JSON/encoded class result when a session name exists; no explicit else/error body | [dispatcher](../../../../PHPScripts/admin/getReports.php#L30). Session-only dispatch is not adequate authorization. |

`getReports.php` operation shapes:

| `option` | Additional fields | Client-consumed response |
| --- | --- | --- |
| `getCreatedTests` | none (session supplies instructor) | array of generated-test summaries and category analysis |
| `getQuestionsForTestID` | `testID` | object with snapshot question array and timeout flag |
| `getStudentReport` | `studentEmpNo`, `testDate`, client `admin` | found flag plus weak-category and missed-item structures |
| `getScoresForClass` | `testDate` | class metadata plus score rows |
| `getSpoAnalysisForClass` | `testDate`, `instructorEmpNo` | category percentage array |
| `questionsWithIncorrect` | `testDate`, `instructorEmpNo` | missed-question analysis array |
| `getAllScores` | `year`, `orgType`, `orgSpec` | organization score row array |
| `getTestDates`, `getClassDates`, `getInstructorTestDates` | none | date array |
| `getInstructorsForDate` | `testDate` | instructor identifier array |
| `getInstructors`, `getInstructorInfo` | optional `instructorEmpNo` | instructor list or record-shaped JSON |
| `addInstructor`, `updateInstructor` | `instructorEmpNo`, names, password, `admin` | edit status JSON |
| `deleteInstructor` | `instructorEmpNo` | deletion status JSON |
| `ejectQuestion` | `testID`, `questionID` | affected-result identifier array or inconsistent text path |
| `getSPOList`, `getSubtasks` | none | curriculum option array |
| `getEOs`, `getElements`, `getEnteredEOs`, `getEnteredElements` | parent/category/variant identifiers as dispatched | curriculum or question-populated option array |

Dispatch fields and branches are visible at
[getReports.php lines 7–115](../../../../PHPScripts/admin/getReports.php#L7).
Some responses can contain protected content in a real system; none is copied
here. Target routes must derive actor/scope server-side and audit privileged
access instead of accepting role or identity authority from request fields.

## Question authoring

| Endpoint | Request fields | Observed response / transition | Evidence / concern |
| --- | --- | --- | --- |
| `viewQuestions.php` | `spo`, `variant` | JSON array consumed as question list | [endpoint](../../../../PHPScripts/viewQuestions.php#L3), [caller](../../../../questionCRUD_taskModeling.php#L194). Legacy field name is used for a task-model category. |
| `fetchQuestionForEditing.php` | `questionID` | JSON array/object used to populate edit form | [endpoint](../../../../PHPScripts/fetchQuestionForEditing.php#L5), [caller](../../../../questionCRUD_taskModeling.php#L127). |
| `newQuestion.php` | type/category/subcategory, `spo`, `eo`, two prompt slots, three correct slots, three incorrect slots, variant | serialized question object; client clears and refreshes | [endpoint](../../../../PHPScripts/newQuestion.php#L5), [caller](../../../../questionCRUD_taskModeling.php#L57). No endpoint authentication or explicit validation. |
| `updateQuestion.php` | `questionID` plus the editable create shape | serialized question object; client refreshes | [endpoint](../../../../PHPScripts/updateQuestion.php#L4), [caller](../../../../questionCRUD_taskModeling.php#L217). Shared update construction is suspected malformed behavior. |
| `deleteQuestion.php` | `questionID` | class-encoded result; client removes row | [endpoint](../../../../PHPScripts/deleteQuestion.php#L5), [caller](../../../../questionCRUD_taskModeling.php#L173). Hard delete is rejected for target referenced versions. |

Target question contracts retain five semantic types but replace these permissive
payloads with server validation, version state, review attribution, and explicit
authorization.

## Curriculum and Bloom metadata

The task-modeling page calls a regular CRUD family. No endpoint in this family
contains an explicit session or role check, so page visibility cannot make the
operations authorized.

| Operation family | Request fields | Observed response | Evidence / target distinction |
| --- | --- | --- | --- |
| Read Phase/Task/Subtask/Element | phase list has no fields; child lists accept `phaseId`, `taskId`, or `subtaskId` | class-encoded JSON hierarchy arrays | [getPhases.php](../../../../PHPScripts/getPhases.php#L3), [getTasks.php](../../../../PHPScripts/getTasks.php#L4), [getSubtasks.php](../../../../PHPScripts/getSubtasks.php#L3), [getElements.php](../../../../PHPScripts/getElements.php#L3). Target hierarchy starts empty and access is permissioned. |
| Create Phase | `name`, `number`, `key_verb_id` | plain completion token | [createPhase.php](../../../../PHPScripts/createPhase.php#L5) |
| Create Task/Subtask | parent id, `name`, `number`, `description`, `key_verb_id` | plain completion token | [createTask.php](../../../../PHPScripts/createTask.php#L5), [createSubtask.php](../../../../PHPScripts/createSubtask.php#L5) |
| Create Element | `subtaskId`, `name`, `number`, `description` | plain completion token | [createElement.php](../../../../PHPScripts/createElement.php#L5) |
| Update hierarchy node | node id plus the corresponding create fields | plain completion token | [updatePhase.php](../../../../PHPScripts/updatePhase.php#L5), [updateTask.php](../../../../PHPScripts/updateTask.php#L5), [updateSubtask.php](../../../../PHPScripts/updateSubtask.php#L5), [updateElement.php](../../../../PHPScripts/updateElement.php#L5) |
| Delete hierarchy node | corresponding node id | plain completion token | [deletePhase.php](../../../../PHPScripts/deletePhase.php#L5), [deleteTask.php](../../../../PHPScripts/deleteTask.php#L5), [deleteSubtask.php](../../../../PHPScripts/deleteSubtask.php#L5), [deleteElement.php](../../../../PHPScripts/deleteElement.php#L5). Target referenced versions are retired rather than hard-deleted. |
| Bloom levels/range/verbs | none; or `startLevel` + `endLevel`; or `ordinality` | class-encoded JSON option arrays | [getBlooms.php](../../../../PHPScripts/getBlooms.php#L3), [getBloomsLevelsForRange.php](../../../../PHPScripts/getBloomsLevelsForRange.php#L5), [getBloomsVerbs.php](../../../../PHPScripts/getBloomsVerbs.php#L5) |

Target curriculum operations add server-side Curriculum Manager authorization,
version/review state, validation, audit attribution, and conflict/error shapes.
The legacy plain completion token does not characterize a sufficient target
contract.

## Template and generated-exam operations

| Endpoint | Request fields | Observed response / transition | Evidence / concern |
| --- | --- | --- | --- |
| `getQuestionCount.php` | none in current task UI | JSON inventory array with category id/name/count | [endpoint](../../../../PHPScripts/getQuestionCount.php#L1), [caller](../../../../testModeling_taskModeling.php#L183). It ignores variant expected by older callers. |
| `newTestModel.php` | `course_type`, `length`, count `model`, mandatory `requiredEOs`, `variant`, `modelName` | no explicit success body; client hides progress | [endpoint](../../../../PHPScripts/newTestModel.php#L6), [caller](../../../../testModeling_taskModeling.php#L221). No total-equals-length assertion is visible. |
| `showTestModels.php` | `variant`, `course_type` | JSON keyed/list model summaries | [endpoint](../../../../PHPScripts/showTestModels.php#L5), [caller](../../../../testCRUD.php#L197). |
| `removeModel.php` | `test_model_id` | class-encoded deletion result | [endpoint](../../../../PHPScripts/removeModel.php#L5). Target retires/version-controls templates. |
| `passwordGenerator.php` | none | JSON object containing two generated access fields | [endpoint](../../../../PHPScripts/passwordGenerator.php#L12). Actual values are protected and intentionally omitted. |
| `createNewTest.php` | model `id`, `instructorID`, two generated access fields | JSON status with message/error, metadata, generated identifier/timestamp and access fields | [endpoint](../../../../PHPScripts/createNewTest.php#L6), [result builder](../../../../Classes/Exam.php#L491). Client displays access data; target must handle it as a secret. |

Observed generation response does not define an atomic shortage contract. Target
success must mean exact requested content is committed; target failure must
create no exam and return category/mandatory shortages without protected content.

## Exam access and grading

| Endpoint | Request fields | Observed response / error states | Evidence / concern |
| --- | --- | --- | --- |
| `getExam.php` | `studentEmpNo`, exam `password`, optional `overridePassword` | success: array of snapshot display objects (`questionID`, `type`, prompt and A–D slots); error object for expired/invalid code, recovery required, or recovery mismatch | [endpoint](../../../../PHPScripts/getExam.php#L6), [server states](../../../../Classes/Exam.php#L277), [client handling](../../../../examCMS.php#L250). No answer/mark/order/position/timing state is returned. |
| `gradeExam.php` | question array, exam field, employee field, names, syllabus, qualification, retraining flag, class-date parts, client `doNotGrade` | JSON with incorrect count, percentage, outcome, missed-question key map, and preview flag | [endpoint](../../../../PHPScripts/gradeExam.php#L5), [grading](../../../../Classes/Exam.php#L415), [client](../../../../examCMS.php#L612). Client controls preview suppression; configured length drives score. |

Target access replaces the legacy identity/name payload with roster validation
and a persisted attempt. Target autosave, resume, extension, auto-submit,
duplicate-submit rejection, retake, and remediation have no legacy endpoint
equivalent; they are **target approved** and should not be described as observed.

## Downloads

| Endpoint | Request | Observed response | Evidence / concern |
| --- | --- | --- | --- |
| `downloadables/download.php` | authenticated GET | `text/csv` attachment after writing a shared fixed-name file | [download.php](../../../../downloadables/download.php#L3). Shared file and session-only access are rejected risks. |
| `downloadables/downloadQuarterlySPO.php` | POST `option=makeFile`, `orgSpec`, `year`; later GET `option=getFile` | shared fixed-name curriculum CSV download | [downloadQuarterlySPO.php](../../../../downloadables/downloadQuarterlySPO.php#L3). Split build/download can cross users. |

Target exports are permissioned and audited, scoped to the requesting actor,
created without a shared filename race, and retained no longer than 24 hours.
Historical export aggregates suppress or coarsen groups smaller than five.
