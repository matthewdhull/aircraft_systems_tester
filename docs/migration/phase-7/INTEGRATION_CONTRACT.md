# Phase 7 Integration Contract

## Boundary

Phase 7 authors versioned templates and atomically publishes immutable generated-exam snapshots. It does not create attempts, attempt order, answers, grades, recovery, student access, roster CRUD, or reports. All instants are canonical UTC RFC 3339 strings and all identities are caller-created UUIDs.

## Shared DTOs

- `TemplateIdentity { id, createdAt, retiredAt }` and `TemplateVersionRef { templateId, versionId, version }`.
- `TemplateVersion` carries name, aircraft variant, optional course type, configured length, allotted minutes, lifecycle, author/reviewer attribution, effective interval, ordered rules, and ordered mandatory elements.
- Lifecycle is `draft -> review -> published -> retired`; review may return to draft. Editing published/referenced content creates the next draft version. Author and reviewer must differ. Only safely unreferenced drafts may be hard-deleted.
- `TemplateRule { id, position, subtaskVersionId, count }`; positions are contiguous, Subtasks unique, counts positive, and their sum equals configured length.
- `MandatoryElementRequirement { id, position, elementVersionId, subtaskVersionId }`; positions are contiguous, Elements unique, each Element belongs to a selected rule Subtask, and requirements per Subtask do not exceed its quota.
- `CapacityResult { status: 'sufficient'|'insufficient', ruleCapacity[], mandatoryCapacity[], shortages[] }` is advisory. Shortages use fixed codes `CATEGORY_SHORTAGE` and `MANDATORY_ELEMENT_SHORTAGE` with IDs and integer `needed`/`available`, never content.
- Legacy sources are `{ sourceKind: 'test_model'|'testModel', sourceId }`. They remain distinct. Adoption explicitly creates an attributable canonical draft; it never mutates, publishes, or infers lineage between sources.

## Selection contract

- Input: `{ algorithmVersion, seedBytes, rules, mandatoryElements, candidates }`. Supported algorithm version is `ast-selection-v1`.
- `SelectionCandidate { questionVersionId, eligible, subtaskVersionIds[], elementVersionIds[] }`; arrays are canonicalized by identifier and duplicate candidate rows merge only identical eligibility facts.
- Output success: `{ assignments, mandatoryAssignments }`, where `CategoryAssignment { questionVersionId, ruleId, categoryPosition }` assigns every selected version exactly once and `MandatoryAssignment { elementVersionId, questionVersionId }` uses a distinct selected question for every mandatory Element.
- Output failure is deterministic, safe, and contains only fixed domain codes and shortage DTOs. No partial selection is represented as success.
- The engine sorts all external collections, satisfies mandatory coverage before remaining capacity, and uses complete constraint solving so overlapping candidates cannot cause a false shortage.
- `SeededRandomSource` exposes unbiased bounded integers and deterministic byte/order derivation. No global randomness or clock is permitted. Unsupported versions fail closed. Plaintext seeds never appear in errors, logs, snapshots, or persistence.

## Snapshot and security contract

- Transaction input: actor, exact published template version, roster, clock, UUID factory, secure entropy, seed protector, code protector, and selector seam. The snapshot layer owns the database transaction and revalidates permission/scope, template, curriculum ancestry, aircraft/course applicability, question lifecycle/effective interval, approved future links, and `eligible` state inside it.
- Selection output feeds deterministic prompt and final option layout. Canonical Phase 6 rendering applies: TF A=True/B=False; single choice has A-D; compound/all/none use derived D and D as response key. Positions are contiguous and `isCorrect` is the actual response key.
- Snapshot transaction success returns `{ examId, rawAccessCode }` only after commit. The raw code is returned once and is absent from all reload/detail APIs. Failure creates no exam, snapshot, code digest, or success audit.
- `SeedProtector.encrypt(seed, context) -> { envelopeVersion, keyId, ciphertext }`; `ReplaySeedDecryptor.decrypt(...)` is available only behind explicit replay authorization. Authenticated encryption binds exam/template/algorithm context.
- `AccessCodeProtector.createAndProtect() -> { rawCode, protectedDigest, protectionVersion }` uses secure entropy and keyed/slow protection suitable for low entropy. Persistence contains only the protected representation.
- Production configuration fails closed without valid, versioned key material. Tests inject synthetic keys, entropy, UUIDs, and clocks.

## Projections

- Safe list/detail exposes identity, status, template version, algorithm version, counts, publication/start-window metadata, roster-safe labels, prompt text and displayed choices only where preview permission allows. It never exposes keys, seed envelope, code digest, or raw code.
- Preview requires `exams.preview` and returns immutable snapshot prompts/choices without attempts or results.
- Answer-key projection additionally includes response keys and requires `answer_keys.view`. Print mode uses the same server projections.

## Authorization, roster, audit, and errors

- Template mutations require `templates.manage`; generation/publication requires `exams.publish`; preview requires `exams.preview`; keys require `answer_keys.view`.
- Instructor generation requires the roster's assigned instructor identity. Organization-wide bypass is allowed only by explicit policy/permission and is checked server-side independently of UI.
- Domain error vocabulary: `TEMPLATE_NOT_FOUND`, `TEMPLATE_NOT_PUBLISHED`, `TEMPLATE_NOT_EFFECTIVE`, `TEMPLATE_INVALID`, `DISTINCT_REVIEWER_REQUIRED`, `DRAFT_REFERENCED`, `CATEGORY_SHORTAGE`, `MANDATORY_ELEMENT_SHORTAGE`, `QUESTION_INELIGIBLE`, `CURRICULUM_INELIGIBLE`, `AIRCRAFT_INAPPLICABLE`, `ROSTER_SCOPE_DENIED`, `PERMISSION_DENIED`, `UNSUPPORTED_ALGORITHM`, `SEED_PROTECTION_FAILED`, `CODE_PROTECTION_FAILED`, `SNAPSHOT_WRITE_FAILED`, `AUDIT_WRITE_FAILED`, `DATABASE_BUSY`.
- Safe audit actions: `template.created`, `template.submitted`, `template.returned`, `template.published`, `template.retired`, `template.deleted`, `template.legacy_adopted`, `exam.published`, `exam.previewed`, `exam.answer_key_viewed`, `exam.replayed`. Metadata contains only IDs, versions, fixed status/error codes, counts, algorithm/envelope versions, and scope decisions—never content or secrets.

## Ownership and route inventory

- 7C alone owns schema and migration `0011+`; template schema requirements flow from 7A through the coordinator. 7C owns the generation transaction and calls the pure 7B selector. The coordinator owns cross-tranche composition, shared authorization/config/navigation, and all generated-test routes.
- Template routes: `GET/POST /test-models`, `GET/POST /test-models/[id]` with create/update/submit/return/publish/retire/delete/adopt actions.
- Generated-test routes: `GET/POST /generated-tests` (list/generate), `GET /generated-tests/[id]` (safe detail), `GET /generated-tests/[id]/preview`, and `GET /generated-tests/[id]/print?answerKey=...`. Direct loads and mutations enforce the same server authorization.
