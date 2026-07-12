# Phase 1 golden behavior fixtures

These JSON fixtures characterize repository-observed legacy behavior separately
from the owner-approved target contract. They contain synthetic identifiers,
prompts, choices, people, attempts, and scores only. They are specifications for
future unit, domain, integration, authorization, and report tests; they are not a
test runner or implementation.

Each case declares `behavior_class` as either `legacy_observed` or
`target_approved`. A `negative_regression` flag means the observed legacy result
is specifically forbidden in the target. Randomized cases assert invariants and
sets of permitted outcomes rather than one arbitrary order.

All aggregate examples contain at least five synthetic members. Individual
synthetic rows are present only as inputs to verify aggregation and suppression;
they are not historical records.

Files:

- `questions.json`: five question types, prompt selection, validation, and
  version-status rules.
- `test-generation.json`: composition, mandatory selection, atomic shortages,
  snapshots, access, resume, and attempt ordering.
- `grading.json`: scoring boundaries, timeout, submission, corrections,
  remediation, retakes, and retraining.
- `reports.json`: approved output totals, scope, correction effects, and
  minimum-group suppression.
- `manifest.json`: evidence and future consumer for every case.

JSON uses schema version `phase1-golden-v1`. IDs beginning `syn-` have no
relationship to source-system identifiers.
