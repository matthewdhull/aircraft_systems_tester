# Phase 0 Summary — Repository and Owner Discovery

## Status

**Phase 0 is complete and its acceptance gate has passed. Stop after Phase 0;
do not start Phase 1 in this work session.**

The four discovery tranches completed without production access:

- [0A — Database discovery](0A-database-discovery.md)
- [0B — Workflow archaeology](0B-workflow-archaeology.md)
- [0C — Business-rule discovery](0C-business-rules.md)
- [0D — Operations and security discovery](0D-operations-security.md)

The product decision interview is recorded in
[OWNER_DECISIONS.md](OWNER_DECISIONS.md). It resolves the schema-affecting
product intent identified by repository discovery. Matthew Hull, original
developer and product decision authority, also confirmed that the application
and database are completely shut down, no workflows are active, the newest 2014
production export is the authoritative available migration source, and all
legacy credentials are revoked. Table dispositions are recorded in
[SOURCE_EXPORT_DISPOSITION.md](SOURCE_EXPORT_DISPOSITION.md).

Work began on the requested `system_discovery` branch with a clean working tree.
No branch switch, application-code change, SQL-dump change, migration-plan
change, production connection, commit, or push was made.

The Phase 0 gate in
[`MIGRATION_PLAN.md:636-669`](../../../MIGRATION_PLAN.md#L636) requires every
production table and active workflow to have an owner/disposition, schema drift
to be understood, and no unresolved question that materially changes the target
schema. Repository evidence plus owner attestation now meet those conditions for
the only available source system.

## Converged findings

### 1. The repository contains three incompatible data-model generations

Historical dumps evolve from an early question/test schema into a TPO/SPO/EO
curriculum and row-oriented `testModel`. Current PHP additionally expects
Phase/Task/Subtask/Element/Bloom tables and question/result columns absent from
every checked-in dump. The code also mixes legacy and task-modeling joins in the
same classes. See [0A, “Schema drift timeline”](0A-database-discovery.md#schema-drift-timeline)
and [0A, “Current task-modeling code”](0A-database-discovery.md#current-task-modeling-code-versus-every-checked-in-dump).

The newest checked-in production dump is from 2014. It is both archaeological
evidence and, by owner attestation, the authoritative available migration source.
It defines 15 MyISAM/`latin1` tables with no foreign keys and
approximately 473 generated-test headers, 657 questions, 2,148 attempt summaries,
41,593 generated-question snapshots, and 169,062 per-question results. Aggregate
orphan and parent-mismatch evidence exists in that source. The source artifact's
size and checksum are verified in the disposition document.

### 2. No application surface is currently active

The dashboard routes to older question/test-model pages, while shared navigation
routes to task-modeling variants. A third model-authoring UI exists inside the
test-generation page, and WIP/prototype pages add incomplete daily/predefined
test flows. Shared endpoint classes combine old and new schemas. See
[0B, “Entry points and navigation”](0B-workflow-archaeology.md#entry-points-and-navigation)
and [0B, “Duplicate, obsolete, WIP”](0B-workflow-archaeology.md#duplicate-obsolete-wip-and-incomplete-disposition-register).

The owner confirmed the system is fully shut down and neither route generation
is used today. Active workflow count is therefore zero. The replacement scope is
an owner-approved synthesis of the primary dashboard/exam/report functions and
task-modeling behavior, with older duplicates and prototypes excluded.

### 3. Core assessment behavior is discoverable and target policy is approved

Repository code implements five question-type codes, random question/wording/
answer placement, mandatory-element selection, generated-question snapshots,
one-hour access, override-based re-entry, equal-weight grading against a stored
model length, an 80% pass threshold, client-only correction-to-proficiency, and
post-exam question ejection. See [0C](0C-business-rules.md).

Important labels overstate the implementation:

- “Resume” returns the same generated snapshot after override but restores no
  saved answers, marks, order, or position.
- “Eject” grants credit and adjusts stored scores; it does not remove the item
  from the denominator.
- Apparent concurrency, grading, ejection, update-query, and client-trust defects
  are documented as suspected defects, never as target requirements.

The owner approved the future hierarchy, five validated question contracts,
atomic seeded generation, immutable snapshots, attempt/resume/retake semantics,
actual-item scoring at an 80.00% threshold, audited denominator-changing
corrections, instructor-linked retraining, effective-dated vocabularies, and
seven-year assessment retention. Because all identifiable assessment history in
the source is older than seven years and is not important to preserve, it will
not be migrated individually. Only non-identifying aggregates are retained;
curriculum, questions, variants, and reusable templates are prioritized.

### 4. Shutdown and initial operating assumptions are confirmed

Tracked source embeds credential material; historical artifacts contain personal,
assessment, answer, score, and exam-access data classes. Values are intentionally
not reproduced. Authentication compares stored and submitted password text,
request data is concatenated into SQL, sessions lack repository-defined
hardening, most endpoints have no session check, and administrator visibility is
primarily client-side. Fixed-path CSV exports introduce confidentiality and
concurrency hazards. See [0D](0D-operations-security.md).

There is no current host, runtime, network exposure, workload, or production
session topology because the application is offline. Initial replacement work
is local-only using one writable Node instance and local persistent SQLite
storage. Future use is estimated at 16–18 concurrent students every one to two
weeks. Scheduled backups are deferred; Matthew Hull explicitly accepts manual
operator snapshots and their recovery risk for this stage. Local load validation
and a repeatable snapshot procedure are later implementation/hardening work, not
Phase 0 blockers.

## Cross-report review

The coordinator reviewed all four reports for contradictions, unsupported
claims, omissions, and duplicated conclusions.

| Apparent conflict / overlap | Converged interpretation |
| --- | --- |
| Historical TPO/SPO/EO schema versus task-modeling PHP | Phase/Task/Subtask/Element is approved for future data; fully import legacy labels and quarantine rather than guess mappings. |
| Dashboard older routes versus shared task-modeling routes | No route is active; primary flows plus task-modeling behavior are approved replacement scope. |
| Administrator UI restrictions versus permissive server dispatch | UI behavior is confirmed, but it is not accepted as authorization policy. |
| “Resume” terminology versus browser-only state | Legacy re-entry is confirmed; target full autosaved resume is owner-approved. |
| “Question ejection” versus score mutation | Legacy behavior is characterized; target correction removes the item from denominators through an append-only audit event. |
| Repeated hierarchy, retention, and hosting findings | Deliberate cross-domain dependencies, consolidated in the decision register rather than treated as independent conclusions. |

No report promoted a suspected defect to a requirement, exposed record values,
or claimed repository evidence was current production fact. No focused agent
correction was necessary after review.

## Approved feature inventory and disposition

| Domain | Repository status | Approved disposition | Later validation |
| --- | --- | --- | --- |
| Instructor login/logout and dashboard | Historical primary candidate | In scope; create new accounts, force secure password setup, and replace insecure implementation | Future characterization |
| Instructor administration | Historical implementation | In scope under granular server-side permissions | Future characterization |
| TPO/SPO/EO curriculum | Authoritative source data | Migrate fully as historical labels; quarantine invalid relationships | Import reconciliation |
| Phase/Task/Subtask/Element/Bloom | Later code expectation; no source rows | Authoritative future curriculum starts empty; author/import reviewed content later | Future content authoring |
| Question authoring | Three historical pages | Fully migrate question content; use task behavior and draft/review/publish; exclude duplicate UI | Import validation |
| Test-model authoring | Three historical surfaces | Fully stage both template shapes, reconcile/version/retire, quarantine ambiguity | Import reconciliation |
| Saved-model test generation | Historical behavior | Replace with approved atomic seeded immutable generation | Future characterization |
| Daily/predefined test generation | WIP/prototype evidence | Excluded unless added by signed scope change | None |
| Student exam access/delivery/grading | Strong active candidate | Roster/code access, timed autosaved attempt, full resume, actual-item grading | Characterization evidence |
| Override re-entry | Historical implementation | Replace with single-use audited recovery of the same attempt | Future characterization |
| Instructor preview | Implemented through client flag | Permissioned audited preview with no student attempt/result; never trust client grading suppression | Production-use characterization |
| Correction to proficiency | Client-only implemented behavior | Required, persisted, instructor-opened remediation; original result unchanged | Characterization evidence |
| Question ejection/correction | Historical suspected defects | Append audited invalidation, remove denominator item, recompute, preserve originals | Future characterization |
| Student/class/curriculum reports | Historical candidates | Required for new data; legacy history imports only as safe aggregates | Future golden cases |
| Generated-test history | Dormant historical UI | Required for new data; do not import identifiable legacy generated history | Future golden cases |
| CSV and paper-test exports | Historical implementation | Required, permissioned, audited, and per-request | Future golden cases |
| FAQ and auxiliary/demo artifacts | Support/orphan candidates | Excluded unless added by signed scope change | None for current scope |

## Phase 0 deliverables

| Required deliverable | Status | Completion / blocker |
| --- | --- | --- |
| Authoritative production database schema export | **Complete** | Owner designated the newest 2014 export as the authoritative available source; checksum/readability verified. |
| Table and row-count inventory | **Complete** | All 15 source tables and approximate volumes inventoried. |
| Active URL and workflow inventory | **Complete** | Active workflow count is zero; historical routes/workflows inventoried for replacement scope. |
| Duplicate-page disposition list | **Complete** | Primary/task behavior retained; older duplicates/WIP/prototypes excluded by owner. |
| Data classification and retention requirements | **Complete** | Legacy personal history excluded; safe aggregate contract and future retention approved. |
| TPO/SPO/EO versus task hierarchy decision | **Complete** | Task hierarchy is future authority; legacy curriculum imports fully without guessed mappings. |
| Question-type and scoring rules | **Complete for product intent** | Five validated types, atomic generation, actual-item denominator, ≥80.00% threshold, and correction policy approved. |
| Current hosting and concurrency profile | **Complete** | Current system is offline; initial use is local; future estimate is 16–18 students every 1–2 weeks. |
| Signed-off migration scope | **Complete** | Matthew Hull approved the recorded scope and source dispositions on July 12, 2026. |

## Acceptance gate

| Acceptance criterion | Status | Evidence / blocker |
| --- | --- | --- |
| Every production/source table has an owner and disposition | **Met** | All 15 tables in the authoritative available export have explicit migrate/aggregate/quarantine/exclude dispositions owned by Matthew Hull. |
| Every active workflow has an owner and disposition | **Met** | No workflow is active; historical workflows have approved replacement/exclusion dispositions. |
| Schema drift is understood | **Met for the available source** | Dump/code drift is documented; unresolved mappings are handled explicitly through staging/quarantine rather than schema assumptions. |
| No unresolved question materially changes the target schema | **Met** | Product, source, privacy, identity, attempt, correction, and initial operating decisions are approved. Later hosting/load validation does not change the current schema contract. |

## Completion and deferred validation

### Complete for repository-only Phase 0

- Historical schema/table/field/relationship/encoding/volume archaeology.
- Current PHP versus dump drift inventory.
- Candidate page, endpoint, class, navigation, workflow, report, and export map.
- Business-rule characterization with suspected defects separated from intent.
- Repository security, credential-handling, session/authentication/authorization,
  export, backup-artifact, dependency, deployment, and SQLite-constraint review.
- Prioritized external evidence and owner-decision lists.
- Owner-approved curriculum, scope, question, generation, snapshot, attempt,
  scoring, correction, access, retention, identity, authorization, reporting,
  content-governance, and target-hosting policies.
- Authoritative source checksum, 15-table disposition, safe aggregate contract,
  zero-active-workflow attestation, credential-revocation attestation, and
  manual-snapshot risk acceptance.

### Live-access disposition

No live database or application exists, so live access is not a remaining
dependency. The newest 2014 export is the owner-designated authoritative source.
Its repository profile supplies the source DDL, counts, types, encodings, and
anomalies. Schema expectations present only in task-modeling PHP are target/
historical clues, not assumed source data.

The source contains no Phase/Task/Subtask/Element/Bloom population. Target
structures start empty; legacy curriculum/questions are preserved and must
receive reviewed task mappings before use in new task-based generation. This is
a known content-recovery limitation, not a Phase 0 schema blocker.

### Resolved by product-owner interview

- Future curriculum and historical-label policy; migration feature scope and
  default exclusions.
- Question, generation, snapshot, access, attempt/resume/retake, grading,
  correction, remediation, retraining, reporting, and content-governance rules.
- Identity keys, anomaly quarantine, retention/deletion, authorization,
  authentication, roster, vocabulary, and repository-remediation policies.

Matthew Hull's name, authority, decisions, and July 12, 2026 decision date are
recorded.

### Deferred implementation and operations validation

These do not block Phase 0:

- Validate local SQLite locking/storage against the estimated 16–18-student
  workload during foundation/hardening.
- Choose production hosting only when deployment becomes in scope.
- Document the repeatable manual snapshot procedure before irreplaceable new
  data is entered; scheduled automation remains post-migration.
- Execute the approved repository archive/history-remediation work separately.

## Stop condition

Phase 0 is **complete and accepted**. This work session stops at the Phase 0
boundary as requested. Phase 1 may begin only through a separate explicit user
request and must use the approved source dispositions and characterization cases.
