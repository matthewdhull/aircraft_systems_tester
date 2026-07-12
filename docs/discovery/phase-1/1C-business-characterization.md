# Phase 1C — Business-logic characterization

## Result and evidence boundary

The machine-readable baseline in
[`fixtures/phase-1/golden-behavior/`](../../../fixtures/phase-1/golden-behavior/README.md)
characterizes question construction, test generation, exam access, grading,
correction/remediation, and approved report totals using synthetic data only.
Every case is explicitly `legacy_observed` or `target_approved`.

`legacy_observed` means executable behavior found in this repository. It does
not mean the behavior was observed in production: the application and database
are offline, and no runtime recording was possible. `target_approved` means the
product rule is settled by [OWNER_DECISIONS.md](../phase-0/OWNER_DECISIONS.md),
even where no legacy implementation exists. Suspected legacy defects are marked
`negative_regression: true` so future parity work cannot accidentally preserve
them.

No fixture contains historical people, accounts, codes, attempts, results,
question content, answers, or keys. All prompts, choices, IDs, actors, and
scores are synthetic. Aggregate examples use at least five synthetic members,
and the suppression case demonstrates that subgroups smaller than five are
rolled up rather than published.

## Artifact set

| Artifact | Coverage | Intended consumers |
| --- | --- | --- |
| [questions.json](../../../fixtures/phase-1/golden-behavior/questions.json) | All five types; primary/alternate prompts; normalization; blank/duplicate/shape rejection; retired versions; distinct reviewer | Question domain and content-lifecycle tests |
| [test-generation.json](../../../fixtures/phase-1/golden-behavior/test-generation.json) | Template counts; mandatory-first selection; shortages; atomicity; seeded replay; snapshots; per-attempt order; start/re-entry/preview | Generator property/transaction tests and access integration tests |
| [grading.json](../../../fixtures/phase-1/golden-behavior/grading.json) | Denominator; equal weights; threshold; rounding; unanswered items; timeout; idempotency; invalidation; remediation; retake/retraining | Grading unit tests and correction/attempt integration tests |
| [reports.json](../../../fixtures/phase-1/golden-behavior/reports.json) | Student, class, curriculum, generated-history, organization, printable, CSV, correction-aware and historical aggregate outputs | Report query, authorization, suppression, and export tests |
| [manifest.json](../../../fixtures/phase-1/golden-behavior/manifest.json) | Every case mapped to evidence and future layer | Test planning and traceability checks |

## Legacy behavior preserved as evidence

### Question construction

The legacy constructor chooses the primary prompt when alternate text is empty
and randomly chooses one of the two stored prompts otherwise
([`Classes/testClass.php:248`](../../../Classes/testClass.php#L248)). True/false
uses fixed A/B text and treats only exact uppercase `TRUE` as A
([`Classes/testClass.php:258`](../../../Classes/testClass.php#L258)). Ordinary
multiple choice permutes one correct and three wrong choices, but a separate
random branch inserts an all/none D distractor that is never correct
([`Classes/testClass.php:272`](../../../Classes/testClass.php#L272)). Compound,
all-correct, and none-correct types make D the key with different A-C shapes
([`Classes/testClass.php:322`](../../../Classes/testClass.php#L322),
[`Classes/testClass.php:335`](../../../Classes/testClass.php#L335),
[`Classes/testClass.php:346`](../../../Classes/testClass.php#L346)).

The exact-case true/false fall-through and accidental multiple-choice all/none
branch are negative regressions. The owner-approved contract instead normalizes
type casing, validates each type server-side, rejects blank/duplicate displayed
choices, and supports all five explicit shapes
([OWNER_DECISIONS.md:36](../phase-0/OWNER_DECISIONS.md#L36)).

### Generation and snapshots

Legacy generation queries one random question per mandatory element, then fills
the remaining category count while excluding selected mandatory IDs
([`Classes/Exam.php:83`](../../../Classes/Exam.php#L83),
[`Classes/Exam.php:118`](../../../Classes/Exam.php#L118)). It does not assert that
the final count meets the template and may persist a short test. It snapshots
the rendered prompt, choices, and key in `usedQuestions`
([`Classes/Exam.php:203`](../../../Classes/Exam.php#L203)).

Target cases require exact per-category composition, every mandatory element,
no duplicate selection, and transaction rollback with actionable shortage
details. Seed cases assert replay invariants instead of a chosen random order.
The snapshot immutability case proves later question-bank changes cannot affect
delivery or grading. Students sharing an exam receive the same selected content
and option layout, while each attempt persists a distinct derived permutation
([OWNER_DECISIONS.md:47](../phase-0/OWNER_DECISIONS.md#L47)).

### Access and attempt state

Legacy first access records a login and repeated access requires a reusable
override during the one-hour window
([`Classes/Exam.php:277`](../../../Classes/Exam.php#L277),
[`Classes/Exam.php:288`](../../../Classes/Exam.php#L288),
[`Classes/Exam.php:340`](../../../Classes/Exam.php#L340)). The returned snapshot
does not restore answers, marks, position, or persisted order; that behavior is
a negative regression, not target resume semantics.

Target cases cover roster rejection; the one-hour new-start boundary; one
attempt at first start; full state restoration; single-use audited recovery;
audited per-attempt extension; and authorized preview with no attempt, login,
score, or reportable result. These rules come directly from the access decision
([OWNER_DECISIONS.md:63](../phase-0/OWNER_DECISIONS.md#L63)).

### Grading, correction, and remediation

Legacy grading compares submitted letters against snapshotted keys, counts
incorrect answers, and divides by configured test length
([`Classes/Exam.php:419`](../../../Classes/Exam.php#L419),
[`Classes/Exam.php:433`](../../../Classes/Exam.php#L433),
[`Classes/Exam.php:462`](../../../Classes/Exam.php#L462)). Browser-only review
removes a missed item after the correct letter is selected but persists no
completion ([`examCMS.php:180`](../../../examCMS.php#L180)). Legacy ejection
changes response rows to correct and adds a configured question value to scores
([`Classes/ReportsClass.php:544`](../../../Classes/ReportsClass.php#L544)). Those
three behaviors are retained only as negative regression evidence.

Target score cases use equal weights and the actual valid immutable-snapshot
count. They exercise below, exactly at, and above 80%; a display value that
rounds to `80.00` while the exact fraction remains below the threshold; a model
length mismatch; unanswered items; deadline auto-submit; and duplicate submit.
Correction cases remove an invalidated item from the denominator, preserve
original and corrected values, attribute a reason-coded append-only event, and
verify idempotency. Separate remediation completion/waiver and linked
retake/retraining cases leave the original result intact
([OWNER_DECISIONS.md:74](../phase-0/OWNER_DECISIONS.md#L74),
[OWNER_DECISIONS.md:85](../phase-0/OWNER_DECISIONS.md#L85)).

### Reports

The one legacy report case preserves the repository's issued-count and truncated
average behavior for a five-member synthetic class
([`Classes/ReportsClass.php:116`](../../../Classes/ReportsClass.php#L116),
[`Classes/ReportsClass.php:152`](../../../Classes/ReportsClass.php#L152)). It is
not a target rounding requirement.

Target cases cover every required output: student, class,
curriculum-performance, generated-test-history, organization-wide score,
printable exam, and audited CSV export
([OWNER_DECISIONS.md:103](../phase-0/OWNER_DECISIONS.md#L103)). They also cover
assigned-instructor scope, explicit organization/export/key permissions,
correction-aware totals, 24-hour export retention, and isolation of read-only
historical aggregates. The small-cell case starts with six synthetic members,
suppresses groups of four and two, and publishes only the six-member roll-up, in
accordance with the approved aggregate contract
([SOURCE_EXPORT_DISPOSITION.md:94](../phase-0/SOURCE_EXPORT_DISPOSITION.md#L94)).

## Intentional negative regressions

Future target tests must reject these repository-observed behaviors:

- non-uppercase true values silently becoming false;
- accidental all/none distractors in ordinary multiple choice;
- persisting a partial exam after inventory or mandatory-element shortage;
- reusable override access that fails to restore attempt state;
- grading against configured model length rather than actual valid snapshot
  count;
- client-only correction-to-proficiency with no persisted completion; and
- mutable ejection that grants value without denominator removal or append-only
  attribution.

## Open implementation parameters, not new business decisions

Phase 0 settles the behavior needed by this baseline. The fixtures intentionally
do not choose a random algorithm, seed representation, domain-error message
wording, exact alternate-prompt review UI, audit event schema, or report file
format. Those implementation parameters may vary while preserving the asserted
invariants. The phrase “one hour after publication” is represented as a
half-open start interval: a start one second before the hour is accepted and a
new start exactly at the hour is rejected, consistent with the repository's
`>= 3600` expiry check. If product policy intends an inclusive final instant,
the owner must change that boundary before its future integration test is
frozen.

## Offline limitation

No live application, production database, screenshots, network captures, or
runtime observations were available. The `legacy_observed` cases are static
repository characterizations only. Future implementation tests should consume
these fixtures, but this tranche deliberately provides no runner, SvelteKit
code, schema, or importer.
