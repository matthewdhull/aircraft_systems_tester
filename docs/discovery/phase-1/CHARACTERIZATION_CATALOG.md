# Phase 1 Characterization Catalog

## Interpretation

This catalog is the index for the approved offline preservation baseline.

- **Legacy observed** is static behavior evidenced in repository PHP or
  JavaScript. It is not a claim that the shut-down system ran successfully.
- **Target approved** is product behavior selected in
  [OWNER_DECISIONS.md](../phase-0/OWNER_DECISIONS.md).
- **Negative regression** is a suspected/rejected legacy defect that the target
  must not reproduce.
- **Runtime unavailable** records behavior that cannot be demonstrated because
  no application, database, or deployed system exists.

## Tranche catalog

| Tranche | Primary artifact | Supporting artifacts | Preserved result |
| --- | --- | --- | --- |
| 1A | [Sanitized source fixture](1A-data-fixture.md) | [Fixture files](FIXTURE_MANIFEST.md#legacy-source-fixture) | All 15 source shapes/dispositions, synthetic valid/anomaly relationships, both template formats, and expected reconciliation profile |
| 1B | [Legacy UI/API capture](1B-ui-api-capture.md) | [Workflow catalog](workflow-catalog/README.md) | Pages, actors, entry conditions, forms, states, transitions, endpoints, validation/error shapes, reports, exports, navigation, exclusions, and target distinctions |
| 1C | [Business characterization](1C-business-characterization.md) | [Golden behavior fixtures](FIXTURE_MANIFEST.md#golden-behavior-fixtures) | 67 machine-readable cases with evidence and future-test consumers |
| 1D | [Data-handling controls](1D-data-handling-controls.md) | Admission checklist and scan/incident procedures within the document | Protected storage/access, allowed content, sanitization, suppression, output/capture, temporary-file, retention, review, and escalation rules |

## Workflow preservation map

| Approved surface | Page/state evidence | Contract/transition evidence | Golden behavior |
| --- | --- | --- | --- |
| Instructor login/logout and dashboard | [Pages and states](workflow-catalog/pages-and-states.md#instructor-login-dashboard-and-logout) | [Identity/report contracts](workflow-catalog/endpoint-contracts.md#identity-and-reporting), [navigation](workflow-catalog/navigation-and-transitions.md) | Authorization/session implementation cases are deferred; insecure legacy behavior is explicitly rejected |
| Question authoring | [Question states](workflow-catalog/pages-and-states.md#question-authoring) | [Question endpoints](workflow-catalog/endpoint-contracts.md#question-authoring) | Five types, primary/alternate prompts, validation, review/publish/retire |
| Test-model authoring | [Template states](workflow-catalog/pages-and-states.md#test-template-authoring-and-generation) | [Template operations](workflow-catalog/endpoint-contracts.md#template-and-generated-exam-operations) | Exact composition, mandatory elements, two fixture template shapes |
| Test generation | Same catalog section | Same contract section | Shortage rollback, seeded invariants, immutable/shared snapshot behavior |
| Student access/delivery | [Access states](workflow-catalog/pages-and-states.md#student-access-and-delivery) | [Exam contracts](workflow-catalog/endpoint-contracts.md#exam-access-and-grading) | Start window, roster denial, full resume, recovery, extension, preview |
| Grading/correction | [Submission and remediation](workflow-catalog/pages-and-states.md#submission-grading-and-remediation) | [Exam contracts](workflow-catalog/endpoint-contracts.md#exam-access-and-grading) | Equal weighting, actual denominator, 80% threshold, rounding, timeout, invalidation, remediation, retake/retraining |
| Reports/exports | [Report states](workflow-catalog/pages-and-states.md#reports-print-and-export) | [Reporting and downloads](workflow-catalog/endpoint-contracts.md#downloads) | Student, class, curriculum, history, organization, printable, CSV, permissions, correction-aware totals, suppression |

## High-risk negative-regression catalog

The machine-readable baseline rejects seven observed behaviors:

1. non-uppercase true values silently resolving false;
2. accidental all/none distractors in ordinary multiple choice;
3. persisting a partial generated exam after a shortage;
4. reusable re-entry that restores no attempt state;
5. grading against configured length rather than valid snapshot count;
6. browser-only, unpersisted correction-to-proficiency; and
7. ejection that mutates credit without denominator removal and append-only
   attribution.

The workflow catalog additionally marks client-side authorization, plaintext
authentication, query interpolation, timestamp-based generated-ID recovery,
malformed update paths, hard deletion, and shared export files as suspected or
rejected behavior. They are evidence for defensive tests, not requirements.

## Coverage and consumers

| Characterization area | Machine-readable coverage | Future consumer |
| --- | --- | --- |
| Source extraction/reconciliation | 15 tables, 22 rows, expected profile | Phase 3 extraction/import and reconciliation tests |
| Question validation/lifecycle | 17 cases | Question-domain unit and content-lifecycle integration tests |
| Generation/access/snapshots | 17 cases | Generator property/transaction and access integration tests |
| Grading/corrections/attempt linkage | 20 cases | Grading unit and correction/attempt integration tests |
| Reports/exports/privacy | 13 cases | Report query, authorization, suppression, and export tests |
| Evidence handling | Admission and incident procedures | Every later phase and code review |

## Offline substitute and limitations

The page/state and request/response contract catalogs are the approved offline
substitute for screenshots, recordings, and production request captures. No
live screenshot, browser recording, HTTP response, traffic trace, production
record, deployed authorization result, runtime random distribution, timing, or
rendered layout was observed or fabricated. Static evidence cannot establish
HTTP status, reachability, browser compatibility, database ordering, or actual
runtime success.

The exact one-hour start boundary is represented as a half-open interval:
starts before 3,600 elapsed seconds are accepted and a new start at 3,600 is
rejected. This is consistent with both “for one hour after publication” and the
legacy `>= 3600` check; changing it requires a product-policy change before the
future integration case is frozen.
