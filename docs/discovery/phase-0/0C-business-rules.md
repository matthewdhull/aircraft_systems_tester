# Phase 0C — Business-rule discovery

## Scope and evidence standard

This is a repository-only discovery report for Phase 0. No live system was contacted. It records what the checked-in application appears to do; it does not assert that every checked-in page is deployed or that repository data matches production.

Labels used below:

- **Confirmed code behavior** — directly implemented by executable repository code. This still requires workflow discovery to establish whether that code is active in production.
- **Documented legacy intent** — stated in repository prose or comments, but not independently confirmed with an owner or live system.
- **Inference** — a likely consequence of code, requiring characterization or owner confirmation.
- **Suspected defect** — behavior that appears accidental, contradictory, unsafe, or inconsistent. It must not be adopted as a target requirement without evidence.
- **External dependency** — cannot be resolved from Git; requires owner, live-data, policy, or operational evidence.

The Phase 0 plan explicitly requires confirmation of question types, generation, grading, access, override, resume, and retention rules, and convergence on a hierarchy decision and question/scoring rules ([`MIGRATION_PLAN.md`](../../../MIGRATION_PLAN.md#L636)).

## Executive findings

1. Five question type codes are implemented: `tf`, `mc`, `c2`, `ac`, and `nc`. Their generated answer structures are materially different and should be modeled explicitly, not inferred from nullable answer columns.
2. Test models specify a variant, course type, stated length, per-subtask counts, and optional mandatory elements. Generation randomly selects questions, snapshots rendered wording/choices/key into `usedQuestions`, and the browser independently shuffles question order.
3. The recorded passing threshold is hard-coded at 80%. Every generated question is treated as equally weighted, using the stored model length as the denominator.
4. “Resume” is not a persisted attempt. A repeat login within one hour requires an override and returns the same generated question snapshots, but prior selections and progress exist only in browser memory and are lost after a crash.
5. The repository contains two competing curriculum vocabularies: legacy TPO/SPO/EO references and newer Phase → Task → Subtask → Element code. The target hierarchy is an unresolved schema-blocking owner decision.
6. Post-exam “ejection” changes missed responses to correct and adds one question-value to affected scores. It does not remove the question from the denominator. The implementation also contains two high-risk apparent defects that can change unrelated response rows or outcomes.
7. No assessment-record retention or deletion policy was found in executable code or authoritative repository policy. This is an external dependency, not evidence for indefinite retention.

## 1. Question-type rules

The authoring UI and display dictionary expose the same five type codes ([`questionCRUD_taskModeling.php`](../../../questionCRUD_taskModeling.php#L553), [`systemChoices.js`](../../../systemChoices.js#L6)). Server-side generation recognizes those same codes ([`Classes/testClass.php`](../../../Classes/testClass.php#L258)).

| Type | Repository behavior | Classification | Questions / risks |
|---|---|---|---|
| `tf` — True/False | Presents `TRUE` as A and `FALSE` as B. The key is A only when the stored correct-answer string is exactly `TRUE`; every other value keys B. | Confirmed code behavior ([`Classes/testClass.php`](../../../Classes/testClass.php#L258)) | Confirm exact casing/normalization and whether invalid values must be rejected rather than silently treated as false. |
| `mc` — Multiple Choice | Normally places one stored correct answer and three stored wrong answers randomly across A–D. In a random branch, D becomes “All of the above” or “None of the above,” while one correct and two wrong answers occupy A–C and the key remains in A–C. | Confirmed code behavior ([`Classes/testClass.php`](../../../Classes/testClass.php#L272)) | The special D choice is never the key in this branch. This looks like a distractor-generation experiment, not a sound all/none scoring rule. Owner must decide whether to preserve, remove, or redesign it. |
| `c2` — Multiple Correct | Randomly places two stored correct answers and one wrong answer in A–C. D is always keyed and states that the two indicated letters are correct. | Confirmed code behavior ([`Classes/testClass.php`](../../../Classes/testClass.php#L322)) | The student chooses one compound D option rather than selecting multiple answers. Confirm this is intended semantics. |
| `ac` — All Correct | Places three stored correct answers randomly in A–C; D is “All of the above” and is always keyed. | Confirmed code behavior ([`Classes/testClass.php`](../../../Classes/testClass.php#L335)) | Confirm wording and whether this type remains permissible under current assessment standards. |
| `nc` — None Correct | Places three stored wrong answers randomly in A–C; D is “None of the above” and is always keyed. | Confirmed code behavior ([`Classes/testClass.php`](../../../Classes/testClass.php#L346)) | Confirm wording and whether this type remains permissible. |

Additional rules and gaps:

- A question has primary and optional alternate wording; generation randomly chooses one when alternate wording is non-empty ([`Classes/testClass.php`](../../../Classes/testClass.php#L248)).
- The authoring UI varies visible answer fields by type: `tf` needs one true/false value; `mc` one correct plus three wrong; `c2` two correct plus one wrong; `ac` three correct; `nc` three wrong ([`questionCRUD_taskModeling.php`](../../../questionCRUD_taskModeling.php#L350)). This is UI behavior, not proof of server-enforced validity.
- **Suspected defect:** authoring endpoints accept posted fields without a visible type-specific validation contract; blank, duplicate, or incompatible answer values can therefore reach question construction/insertion. The target needs server-side invariants and migration handling for invalid legacy rows.
- **Suspected defect:** the `mc` special-choice branch is entered when `rand(0,2) == 2` and the combined answer strings contain at most seven digits ([`Classes/testClass.php`](../../../Classes/testClass.php#L274)). Neither the digit heuristic nor the use of a knowingly incorrect all/none distractor has an authoritative business explanation.
- **External dependency:** production counts by type, invalid/partial records, duplicate choices, casing variants, and actual use of each type require a sanitized live profile.

## 2. Curriculum and ownership hierarchy

### Newer task-modeling structure

The task-modeling classes implement the hierarchy:

`Phase → Task → Subtask → Element`

- Task rows are selected by `PhaseId` ([`Classes/task.php`](../../../Classes/task.php#L35)).
- Subtask rows are selected by `TaskId` ([`Classes/subtask.php`](../../../Classes/subtask.php#L27)).
- Element rows are selected by `SubtaskId` ([`Classes/element.php`](../../../Classes/element.php#L28)).
- Question retrieval joins a question to `Subtask` and `Element`, then to `Task` and `Phase` for its task reference ([`Classes/testClass.php`](../../../Classes/testClass.php#L587)).
- Phase, Task, and Subtask carry Bloom taxonomy references in read/update code; Element does not ([`Classes/phase.php`](../../../Classes/phase.php#L45), [`Classes/task.php`](../../../Classes/task.php#L35), [`Classes/subtask.php`](../../../Classes/subtask.php#L27)).

### Competing legacy vocabulary

Executable code still names model dimensions `spo_id` and mandatory items `eo_id`, while newer queries map those columns to `Subtask` and `Element` ([`Classes/test_model.php`](../../../Classes/test_model.php#L61), [`Classes/Exam.php`](../../../Classes/Exam.php#L101)). Other report methods still query legacy `SPO`/`EO` tables and fields. This is confirmed competing implementation evidence, but repository inspection alone cannot establish which hierarchy is authoritative in production.

**Schema-blocking external dependency:** the application owner must decide whether the target domain is TPO/SPO/EO, Phase/Task/Subtask/Element, a mapping between both, or versioned curricula. The decision must include stable identifiers, variant applicability, Bloom placement, ordering/numbering, and how historical attempts retain their original curriculum labels.

## 3. Test-model and generation rules

### Model composition

- A model stores one variant, course type, stated test length, name, per-subtask question counts, and zero or more mandatory elements ([`Classes/test_model.php`](../../../Classes/test_model.php#L50)).
- Per-subtask count rows are represented by a non-null count and null mandatory-element field; mandatory-element rows use a null count and carry the parent subtask and element ([`Classes/test_model.php`](../../../Classes/test_model.php#L72)).
- The modeling UI prevents a subtask count from exceeding the currently reported available-question count and prevents it from dropping below the number of selected mandatory elements ([`testModeling_taskModeling.php`](../../../testModeling_taskModeling.php#L109)). Checking a mandatory element increments its parent subtask count ([`testModeling_taskModeling.php`](../../../testModeling_taskModeling.php#L118)).
- **Suspected defect:** the UI separately captures “test length” and displays the sum of subtask counts, but no checked-in validation shown here requires equality before saving ([`testModeling_taskModeling.php`](../../../testModeling_taskModeling.php#L221)). Since grading uses stored length, mismatch can create invalid scores.
- **External dependency:** course-type vocabulary, variant vocabulary and applicability, model versioning, who may change a model after use, and whether zero-count rows are meaningful need owner confirmation and live profiling.

### Selection and mandatory elements

- For each subtask with a positive requested count, generation selects one random question for every configured mandatory element, filtered by variant ([`Classes/Exam.php`](../../../Classes/Exam.php#L83)).
- It then fills the remaining subtask quota with random questions for that subtask and variant, excluding the already selected mandatory-question IDs ([`Classes/Exam.php`](../../../Classes/Exam.php#L118)).
- Questions are selected with MySQL `ORDER BY RAND()`; there is no seed, audit reason, difficulty balancing, recent-use avoidance, or cross-test exposure constraint visible in this path.
- Generated question wording, choices, and answer key are snapshotted into `usedQuestions`, insulating a generated test from later question-bank edits ([`Classes/Exam.php`](../../../Classes/Exam.php#L203)). This is an important preservation requirement unless the owner explicitly rejects it.
- **Suspected defect:** there is no server-side assertion that every mandatory element produced a question or that the total selected count equals stated length. A missing mandatory-element candidate simply reduces the mandatory selection count; insufficient general candidates can also produce a short test.
- **Suspected defect:** if configured mandatory-element count exceeds the subtask quota, the computed remaining count becomes negative and is interpolated into SQL `LIMIT` ([`Classes/Exam.php`](../../../Classes/Exam.php#L118)). The UI attempts to prevent this, but the server does not enforce it.
- **Suspected defect / concurrency risk:** after inserting a created test, generation finds its identifier by selecting the newest timestamp rather than using the connection’s insert ID ([`Classes/Exam.php`](../../../Classes/Exam.php#L173)). Concurrent generations can associate questions with the wrong created test. This observed implementation must not become a requirement.

### Randomization layers

1. Question IDs are randomly chosen within each modeled subtask/variant.
2. Alternate question wording is randomly chosen when present.
3. Answer positions are randomized according to type, except `tf` and the fixed compound D keys.
4. Rendered questions/answers/key are persisted as a generated-test snapshot.
5. The browser shuffles the order of those persisted questions on each login ([`examCMS.php`](../../../examCMS.php#L250)).

**Owner decisions needed:** whether randomness must be reproducible/auditable, whether all students sharing a test access code should receive the same snapshot but different order, whether repeat login should preserve order, and whether exposure/history constraints are required.

## 4. Exam access, override, and resume

### Confirmed code behavior

- A generated test has a primary access value and a separate override value. Repository prose describes the primary value as single-use per student and override as recovery after a browser crash ([`faq.php`](../../../faq.php#L55)).
- A test can be opened only within 3,600 seconds of generation; override does not bypass expiry ([`Classes/Exam.php`](../../../Classes/Exam.php#L277)).
- First access is keyed by primary value plus student employee number. It records a login row and returns the generated snapshot ([`Classes/Exam.php`](../../../Classes/Exam.php#L288)).
- Later access for the same employee number requires both the primary and matching override values and returns the snapshot again ([`Classes/Exam.php`](../../../Classes/Exam.php#L340)).
- The override is not consumed or usage-limited by this code. It may be reused for repeated retrievals during the one-hour window.
- Primary and override values are generated as eight characters composed of four digits followed by four lowercase letters. Only the primary is checked for uniqueness among created tests; the override is not checked ([`PHPScripts/passwordGenerator.php`](../../../PHPScripts/passwordGenerator.php#L12)).

### Resume semantics

**Confirmed code behavior:** selected answers, marked questions, current position, and review state exist only in the browser’s `questions` array ([`examCMS.php`](../../../examCMS.php#L44)). The server stores a login event but stores responses only during final grading ([`Classes/Exam.php`](../../../Classes/Exam.php#L433)).

**Inference:** after a browser crash, override access restarts from the same snapshotted questions and choices, but with a newly shuffled question order and no restored answers, marks, or position. Calling this “resume” would overstate current capability.

### Access gaps and apparent defects

- Student identity is self-entered; client-side validation checks only non-empty names and a five-digit employee number ([`examCMS.php`](../../../examCMS.php#L722)). No repository evidence ties that identity to an authoritative roster.
- The browser decides whether an attempt is instructor practice and posts `doNotGrade`; the server trusts that posted flag ([`examCMS.php`](../../../examCMS.php#L600), [`Classes/Exam.php`](../../../Classes/Exam.php#L387)). **Suspected defect:** a client can suppress persistence. Target authorization must derive this server-side.
- Override and primary values are generated with non-cryptographic PRNG functions, stored/retrieved directly, and returned to UI generation callers. These are security implementation facts, not desired business rules.
- **External dependency:** confirm expiry duration, permitted attempts, override issuer/recipient, override-use audit, lockout/rate limits, accommodations, roster validation, shared-code semantics, abandoned-attempt handling, and whether an instructor practice attempt should be stored separately.

## 5. Submission, grading, scores, and outcomes

### Submission

- Client behavior requires every question to have a selected answer, then requires a second Grade click as confirmation ([`examCMS.php`](../../../examCMS.php#L672)). Marking a question is navigational only and does not alter grading.
- The grading endpoint receives the full client array and reduces it to `questionID → selectedAnswer` ([`PHPScripts/gradeExam.php`](../../../PHPScripts/gradeExam.php#L31)).
- **Suspected defect:** the server does not visibly enforce completeness, allowed answer keys, uniqueness, generated-test membership, one submission per student, or an unexpired access window at grading time. These must be explicit target invariants, not left to JavaScript.

### Score calculation

- Each snapshotted answer key is compared to the submitted letter for that question. The code writes one boolean result row per key when persistence is enabled ([`Classes/Exam.php`](../../../Classes/Exam.php#L419)).
- Score is `100 - (100 / stored test length × incorrect count)` ([`Classes/Exam.php`](../../../Classes/Exam.php#L462)). Questions are therefore equally weighted.
- Outcome is `satisfactory` at score ≥ 80, otherwise `unsatisfactory` ([`Classes/Exam.php`](../../../Classes/Exam.php#L465)). The threshold is hard-coded in both initial grading and correction logic.
- The recorded assessment includes student identity fields, class date, generated-test date, instructor, syllabus, qualification code, generated-test ID, retrain flag, outcome, and numeric score ([`Classes/Exam.php`](../../../Classes/Exam.php#L472)).

### Contradictions and risks

- **Suspected defect:** denominator is stored model length, not the actual number of generated keys or submitted answers. A short/overfull generated test or model-length mismatch can yield incorrect, negative, or above-expected scoring behavior.
- **Suspected defect:** answer comparison is exact string comparison. Case normalization is not performed on submitted letters in the grading method.
- **Suspected defect:** duplicate submission protection is absent in the shown path; repeated posts may create duplicate response and attempt records unless the live schema has constraints not present in code evidence.
- **Contradiction:** the UI computes and displays outcome mapping internally but the result line is commented out, while the score and incorrect count are displayed ([`examCMS.php`](../../../examCMS.php#L626)). Confirm whether students should see SAT/UNSAT, numeric score, both, or neither.
- **External dependency:** confirm threshold(s), rounding/display precision, weighted or mandatory-element failure rules, incomplete/abandoned attempt outcomes, invalidated attempts, retakes, accommodations, and whether historical scores must remain as originally awarded after rule changes.

## 6. Retraining and correction-to-proficiency

### Retraining flag

- The student-facing form exposes a self-selected `Retrain?` checkbox; its boolean value is stored on the attempt and appears in reports ([`examCMS.php`](../../../examCMS.php#L866), [`Classes/Exam.php`](../../../Classes/Exam.php#L472)).
- **External dependency:** define whether retraining is an attempt reason, prior outcome linkage, curriculum assignment, or reporting flag; who sets it; and whether evidence/approval is required. Current self-attestation is not sufficient evidence of the intended rule.

### Immediate missed-question correction

- After grading, every missed question is shown in review mode with its correct answer letter. The student must select that answer before the item is removed from the review list ([`examCMS.php`](../../../examCMS.php#L180), [`examCMS.php`](../../../examCMS.php#L643)).
- This correction-to-proficiency interaction does not update the originally stored score or boolean response rows. It is client-only remediation after the attempt has been graded.
- **Owner decision:** determine whether correction completion must be persisted/audited, whether explanations or references are required, whether answer disclosure is allowed, and whether correction affects outcome or only training completion.

### Post-exam question ejection

- An authenticated reporting endpoint exposes an `ejectQuestion` operation ([`PHPScripts/admin/getReports.php`](../../../PHPScripts/admin/getReports.php#L66)).
- For students who missed the specified question on a generated test, the implementation changes response correctness to true, adds `100 / test length` to each affected stored score, and changes an unsatisfactory result to satisfactory when the new score reaches 80 ([`Classes/ReportsClass.php`](../../../Classes/ReportsClass.php#L544)). Students who originally answered correctly are unchanged; the question remains in the test and denominator.
- **Business ambiguity:** “eject” behaves like granting credit to those who missed, not removing/recalculating the question. Owner must choose the target correction policy and required audit trail.
- **High-risk suspected defect:** the response update filters by generated test and question but not by the current student, so the first loop iteration marks all matching students’ responses correct ([`Classes/ReportsClass.php`](../../../Classes/ReportsClass.php#L595)).
- **High-risk suspected defect:** `resultNeedsUpdate` is initialized once outside the student loop and is not reset per student. Once any student crosses 80, later students can be set satisfactory even if their recalculated score is below 80 ([`Classes/ReportsClass.php`](../../../Classes/ReportsClass.php#L553)).
- **Suspected defect:** correction adds a point value to stored score rather than recomputing from authoritative response state and does not store who performed the correction, why, when, original values, or a reversible correction event.

These apparent defects require characterization against sanitized data and owner intent; they must not be preserved as requirements.

## 7. Qualification, syllabus, and date rules

- The UI hard-codes qualification choices New Hire, Upgrade, Re-Qual, and Transition, and maps them to syllabus choices: New Hire → L5; Upgrade → L4; Re-Qual → L5/L4/L3; Transition → L4 ([`examCMS.php`](../../../examCMS.php#L702)).
- The class date is assembled from three browser fields and persisted separately from generated-test date ([`PHPScripts/gradeExam.php`](../../../PHPScripts/gradeExam.php#L15)).
- **Suspected defect / obsolete behavior:** class-year choices stop at 2025, and the form permits invalid calendar combinations. This is not a valid target rule ([`examCMS.php`](../../../examCMS.php#L788)).
- **External dependency:** confirm current qualification/syllabus vocabularies, allowed combinations, effective dates, ownership, backdating rules, timezone/date semantics, and historical-label preservation.

## 8. Retention, deletion, and historical integrity

### Repository evidence

- Generated snapshots, login events, per-question results, and full attempt records are inserted and later queried for reports.
- Question-bank and curriculum CRUD classes contain direct delete operations, but no corresponding assessment-attempt purge, archival, anonymization, legal-hold, or scheduled retention workflow was found in the examined PHP paths.
- Historical reports join both snapshots and current question/curriculum tables in different methods. This creates an integrity risk if question or hierarchy records are hard-deleted.

### Required policy evidence

**External dependency:** obtain authoritative retention periods and deletion/legal-hold rules separately for:

- student identity and attempt records;
- per-question selections and correctness;
- generated question snapshots and answer keys;
- login/access and override audit events;
- exported reports;
- instructor identities and authorization history;
- question-bank revisions, retired questions, curricula, and test-model versions;
- correction/ejection and retraining evidence.

Absence of purge code does **not** establish indefinite retention as an intended requirement.

## 9. Prioritized decision questionnaire

Priority meanings: **P0** can materially change target schema or migration preservation; **P1** blocks characterization and domain behavior; **P2** affects later workflow/policy design.

### P0 — Resolve before target schema is frozen

1. **Authoritative hierarchy:** Is the target curriculum TPO/SPO/EO, Phase/Task/Subtask/Element, a formal mapping, or versioned coexistence? Which identifiers and relationships are authoritative, and how are historical attempts labeled?
2. **Question-type contract:** Which of `tf`, `mc`, `c2`, `ac`, and `nc` remain supported? For each, what fields are required, what makes choices valid/distinct, and are compound all/none choices allowed?
3. **Generated snapshot:** Must each generated attempt preserve exact wording, answer order, question order/seed, and answer key even after bank edits? What is the unit shared by students using one generated test?
4. **Attempt model:** What uniquely identifies an attempt? Can one student submit more than once for one generated test? How are abandoned, practice, invalidated, resumed, and retake attempts represented?
5. **Scoring model:** Is every question equally weighted? Is passing always 80? Is denominator actual generated items, configured model length, submitted items, or valid non-ejected items? What rounding rules apply?
6. **Corrections:** Does “eject question” grant universal credit, remove the question and recompute denominator, or invalidate attempts? Must corrections be append-only, attributable, reason-coded, reversible, and preserve original score/outcome?
7. **Retention/data classification:** What retention, deletion, anonymization, legal-hold, and export rules apply to each assessment, identity, answer, snapshot, access, and correction entity?
8. **Curriculum/model versioning:** Can a used question, curriculum node, or test model be edited/deleted? Must attempts reference immutable versions rather than current mutable rows?

### P1 — Resolve before characterization baseline

9. **Mandatory elements:** Does “mandatory” mean at least one question from each selected element? What happens if none is available, if mandates exceed quota, or if one item could satisfy multiple mandates?
10. **Generation failure:** Must generation be atomic and fail if exact requested counts cannot be satisfied? Are substitutions permitted? Who sees and resolves shortages?
11. **Randomization:** Must generation be reproducible/auditable? Are recent-use avoidance, exposure limits, difficulty/Bloom balancing, or per-student variants required?
12. **Access lifetime:** Is one hour still correct? From generation, first start, or another event? Does submission remain valid after access expiry?
13. **Override/resume:** Is override one-time, per student, instructor-issued, and audited? Should resume restore answers, marks, order, position, and remaining time?
14. **Student identity:** Is employee number sufficient, and must it be roster-validated? Who may correct identity/class metadata after submission?
15. **Outcome visibility:** Should students see numeric score, SAT/UNSAT, missed count, correct answers, or only instructor-mediated results?
16. **Correction to proficiency:** Is review mandatory? Must completion be recorded? Does it affect qualification, retraining, score, or only learning evidence?
17. **Retraining:** Who marks an attempt as retraining, what prior event does it reference, and what reporting/outcome rules differ?
18. **Qualification/syllabus:** What are the current controlled vocabularies and allowed combinations, and do they vary by variant/course/effective date?

### P2 — Resolve for workflow/policy completion

19. Are alternate wordings equivalent approved variants, and should their selection be recorded explicitly?
20. Should True/False be fixed A/B and should compound-answer types always use D, or should presentation be accessibility/configuration driven?
21. What question-author approvals, statuses, review dates, retirement reasons, and defect flags are required?
22. Are practice/instructor attempts retained, and if so, must they be isolated from operational statistics?
23. What reporting aggregation rules apply when scores are corrected, attempts invalidated, curricula renamed, or identities merged?

## 10. External evidence and characterization needed

Repository-only discovery cannot close the following:

- sanitized live distributions for question types, malformed type payloads, model-length/count mismatches, mandatory-element shortages, duplicate submissions, corrections, and retained history;
- deployed route/version confirmation for legacy versus task-modeling implementations;
- exact live schema constraints that may prevent some apparent code behaviors;
- owner-approved hierarchy, scoring, access, correction, retraining, and retention decisions;
- hosting/timezone/session behavior needed to characterize the one-hour boundary and concurrent generation;
- golden cases for every question type, alternate wording, mandatory selection, insufficient inventory, access/re-access, submission, pass boundary, correction, and review completion.

At the repository-only checkpoint, Phase 0C was **repository-complete but not
acceptance-gate complete**. The owner addendum below supersedes that checkpoint
status without altering the legacy evidence.

## Owner decision addendum — July 12, 2026

[OWNER_DECISIONS.md](OWNER_DECISIONS.md) resolves the product-policy questions
raised by this report. The target rules are:

- Support all five legacy question types with explicit type-specific validation;
  remove the accidental randomized all/none distractor behavior from ordinary
  multiple choice.
- Version and retire questions, curricula, and templates. Only reviewed,
  effective published question versions may be generated.
- Generate atomically: exact counts and every mandatory element must be
  satisfied or no exam is created. Use secure seeded randomness, record the seed
  and algorithm version, share selected content/answer layout, and persist a
  distinct question order per attempt.
- Treat the published exam as the immutable authority for wording, choices, and
  key. Score equal-weight items against its actual valid item count and mark
  scores ≥80.00% satisfactory.
- Permit starts for one hour after publication. Create one roster-bound attempt
  at first start with template-defined duration, autosave, full resume, audited
  single-use recovery, audited extensions, and deadline auto-submission of saved
  answers with unanswered items incorrect.
- Instructor preview is a separately authorized/audited non-attempt view; it
  creates no student access, score, or reportable result and does not trust a
  client grading-suppression flag.
- Make retakes and retraining separate instructor-authorized linked attempts.
  Show score/outcome/missed items after submission.
- Require persisted correction-to-proficiency in a separate instructor-opened
  remediation session; it does not change the original result. Audit waivers.
- Invalidate defective questions through append-only attributable correction
  events, remove them from affected denominators, recompute, and retain original
  and corrected values.
- Use effective-dated administrative vocabularies and approved combinations for
  qualification, syllabus, aircraft variant, and course type.
- Retain identity-linked assessment records seven years and security events one
  year; limit exports to 24 hours; delete personal assessment detail at expiry
  absent a hold and retain only non-identifying aggregates.

No live system exists. The owner-designated 2014 export supplies the available
source distributions/anomalies, while malformed content and ambiguous mappings
follow the approved quarantine rules. Matthew Hull's named decisions close 0C's
product gate. Future characterization cases are recorded in
[OWNER_DECISIONS.md](OWNER_DECISIONS.md), but they do not block Phase 0.
