# Phase 1 Summary — Preservation and Characterization

## Status

**Phase 1 is complete and its acceptance gate passes for the approved offline
preservation scope. Stop after Phase 1; do not begin Phase 2 in this work
session.**

The four parallel tranches converged on a synthetic, repository-evidenced
baseline:

- [1A — Sanitized representative source fixture](1A-data-fixture.md)
- [1B — Legacy UI and API capture](1B-ui-api-capture.md)
- [1C — Business-logic characterization](1C-business-characterization.md)
- [1D — Data-handling controls](1D-data-handling-controls.md)

The indexed results are in
[CHARACTERIZATION_CATALOG.md](CHARACTERIZATION_CATALOG.md) and
[FIXTURE_MANIFEST.md](FIXTURE_MANIFEST.md).

## Preflight record

Phase 1 began only after the required checks passed:

| Check | Result |
| --- | --- |
| Dedicated branch | `logic_capture` was created from `821b269`; reflog records `branch: Created from HEAD`. |
| Accepted Phase 0 commit | `821b269` is `phase 0 documents and decisions`; Phase 0 documents and `MIGRATION_PLAN.md` had no working-tree changes. |
| Phase 0 gate | [PHASE_0_SUMMARY.md](../phase-0/PHASE_0_SUMMARY.md) and [DECISION_REGISTER.md](../phase-0/DECISION_REGISTER.md) record all Phase 0 gate conditions met. |
| Authoritative source identity | Protected export size is 15,472,302 bytes; SHA-256 is `ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70`, matching [SOURCE_EXPORT_DISPOSITION.md](../phase-0/SOURCE_EXPORT_DISPOSITION.md). |

No branch switch, commit, push, production/external connection, or protected-
export modification occurred.

## Tranche results

### 1A — Data fixture

The synthetic MySQL-shaped fixture defines all 15 authoritative source tables
and represents every migrate, aggregate, quarantine, or exclude disposition.
Only curriculum, variant, question, and template source tables contain rows.
The 22 rows cover five question types, alternate/null shapes, a zero sentinel,
latin1 decoding, orphan and parent-mismatch quarantines, a duplicate candidate,
and both legacy template formats. Expected counts and relationships are
machine-readable. Phase/Task/Subtask/Element/Bloom source structures are absent.

### 1B — UI and API preservation

The offline catalog traces the approved login/dashboard, question authoring,
template authoring, generation, student access/delivery, grading/remediation,
report, print, and export surfaces. It records entry/actor assumptions, fields,
states, transitions, endpoint request/response shapes, navigation, validation,
errors, exclusions, target-policy differences, and suspected defects with
repository file/line citations.

### 1C — Business characterization

Five JSON case files contain 67 unique cases, all mapped by the manifest to
evidence and a future test layer: 13 legacy-observed and 54 target-approved
cases, including seven negative regressions. Random behavior is expressed as
invariants/permitted outcomes. All published aggregate examples use at least
five synthetic members. A convergence correction made duplicate submission an
explicit rejection and made equal per-valid-item weighting machine-readable.

### 1D — Data-handling controls

The controls define protected export storage/access, allowed and prohibited
repository content, approved derived artifacts, irreversible synthetic fixture
design, aggregate suppression, redacted logs/captures, temporary/backup copy
handling, retention/deletion, fixture admission, non-disclosing scans, protected
evidence references, code review, and incident escalation.

## Migration-plan deliverable assessment

| Phase 1 deliverable | Status | Evidence |
| --- | --- | --- |
| Sanitized representative MySQL fixture | **Met** | [Fixture manifest](FIXTURE_MANIFEST.md#legacy-source-fixture) covers all tables/dispositions and expected transformations. |
| Screenshots or recordings of active workflows | **Met by approved offline substitute** | No workflows/system are active. The [workflow catalog](workflow-catalog/README.md) preserves page/state evidence and explicitly does not claim live media. |
| Legacy request/response examples | **Met by approved offline substitute** | [Endpoint contracts](workflow-catalog/endpoint-contracts.md) preserve field and response shapes from callers/dispatch without protected values or invented live responses. |
| Golden examples of generated exams and reports | **Met** | Generation/snapshot and report JSON cases are indexed in the [fixture manifest](FIXTURE_MANIFEST.md#golden-behavior-fixtures). |
| Characterization tests for high-risk rules | **Met as machine-readable future test cases** | 67 manifest-covered cases include seven explicit negative regressions. Per instruction, Phase 1 created no runner or application code. |
| Sensitive-data handling procedure | **Met** | [1D controls](1D-data-handling-controls.md) are enforceable admission, scan, retention, and incident procedures. |

## Acceptance gate

The `MIGRATION_PLAN.md` Phase 1 gate requires the team to demonstrate current
behavior without production personal data in ordinary development. **Pass.**

- Repository-observed behavior is demonstrable through cited page/state,
  endpoint, and golden-case artifacts.
- Target-approved behavior is separately labeled and traceable to Phase 0.
- Fixtures and cases are synthetic; historical individual records and protected
  assessment/access/account values are absent.
- Historical aggregate rules enforce a minimum group size of five.
- Suspected defects remain negative evidence and are not target requirements.
- Offline limitations are explicit and no unavailable runtime evidence is
  claimed.

## Convergence verification

Coordinator review and independent checks produced these results:

| Check | Result |
| --- | --- |
| JSON parsing and manifest coverage | **Pass:** 5 JSON inputs, 67 unique case IDs, 67 manifest mappings, both behavior classes, 7 negative regressions |
| Source table/disposition coverage | **Pass:** 15/15 source tables; 12 primary keys; no foreign keys |
| Canonical schema comparison | **Pass:** source and fixture table names, column order/types/defaults, primary keys, engines, and charsets agree after applying dump ALTER statements |
| Fixture parsing and relationship checks | **Pass:** SQL statement/tuple parser found 15 balanced table definitions and 22 rows; expected valid/orphan/mismatch/zero/duplicate/template totals agree |
| Target hierarchy exclusion | **Pass:** no Phase/Task/Subtask/Element/Bloom fixture tables or rows |
| Aggregate suppression | **Pass:** minimum 5; the 4/2 small cells are suppressed into a 6-member roll-up |
| Sensitive overlap / secret scan | **Pass:** no exact protected assessment, identity/access, or credential literal overlap; no secret-assignment/private-key patterns; values were never printed |
| Markdown links and whitespace | **Pass:** relative file targets resolve; tracked and untracked Phase 1 files have no trailing whitespace |
| Source citations | **Pass:** spot checks confirmed navigation, endpoint authorization, question construction, generation, access, grading, correction, and report citations |
| Allowed paths and protected files | **Pass:** changes are confined to `docs/discovery/phase-1/` and `fixtures/phase-1/`; authoritative export checksum remains unchanged |
| `git diff --check` | **Pass;** ordinary untracked files were also checked directly |

## Remaining limitations and ownership

| Item | Status / owner |
| --- | --- |
| Live screenshots, traffic, rendering, HTTP status, reachability, database-dependent order, and runtime authorization | Permanently unavailable for the shut-down legacy system; recorded limitation, not a Phase 1 blocker. |
| Quarantine reason-code names and reviewer workflow | Deferred implementation detail for the Phase 3 importer/reconciliation owner; no repair or template lineage may be inferred. |
| Random algorithm, seed representation, exact error wording, audit schema, and report file format | Deferred to the respective future domain-contract owners; golden invariants constrain behavior. |
| One-hour exact boundary | Reviewed interpretation is half-open and consistent with approved wording/repository evidence; Matthew Hull remains the product-policy owner if a change is requested. |
| MySQL runtime load check | The installed local `mysqld` fails during its own initialization/help path before reading the fixture (missing server message data followed by a binary crash). Canonical schema comparison plus statement/tuple parsing is the strongest successful local check. The Phase 3 test-harness owner must run an actual disposable MySQL-compatible load. |
| SQL fixture Git admission | Existing `.gitignore:11` ignores `*.sql`, so `schema.sql` and `data.sql` are present but appear only with `git status --ignored`. The future repository/commit owner must force-add these exact reviewed files or approve a narrow exception. |

No unresolved issue changes the preservation baseline or blocks the Phase 1
acceptance gate.

## Stop boundary

Phase 1 produced no SvelteKit scaffold, SQLite schema/migration, importer,
future test runner, application-code modification, commit, push, or branch
switch. Phase 2 has not begun.
