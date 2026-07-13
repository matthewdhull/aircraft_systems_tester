# Phase 6 Question Bank Integration Contract

## Status and authority

This contract fixes the shared seams for Phase 6 tranches 6A–6D. It is
subordinate to the Phase 0 owner decisions, the Phase 3 schema, importer, and
reconciliation contracts, the Phase 4 authorization and audit boundaries, the
Phase 5 curriculum contracts, and the binding Phase 6 decisions. Tranche-local
implementations may add private fields, but all consumers use the vocabulary,
DTOs, commands, errors, transactions, and ownership boundaries below.

Phase 6 implements question-bank authoring and review only. It does not select
questions, define test templates, generate or snapshot exams, issue access
codes, or implement any Phase 7 behavior.

## Canonical vocabulary

```ts
export const QUESTION_TYPES = [
	'true_false',
	'single_choice',
	'two_correct_compound',
	'all_correct',
	'none_correct'
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type QuestionTypeAlias = 'tf' | 'mc' | 'c2' | 'ac' | 'nc';
export type QuestionLifecycle = 'draft' | 'review' | 'published' | 'retired';
export type GenerationStatus = 'blocked' | 'eligible';
export type FutureLinkStatus = 'review' | 'approved' | 'retired';
```

Type input is trimmed and lower-cased. Canonical values and only these aliases
are accepted: `tf → true_false`, `mc → single_choice`,
`c2 → two_correct_compound`, `ac → all_correct`, and
`nc → none_correct`. Unknown values fail with `invalid_question_type`.

## Identity, version, and safe projection DTOs

```ts
export interface QuestionIdentityDto {
	id: string; // immutable RFC 4122 UUID
	createdAt: string;
	retiredAt: string | null;
	latestVersion: QuestionVersionSummaryDto;
}

export interface QuestionVersionSummaryDto {
	id: string; // immutable version UUID
	questionId: string;
	version: number; // starts at 1 and increments within the identity
	questionType: QuestionType;
	lifecycle: QuestionLifecycle;
	generationStatus: GenerationStatus;
	authoredByUserId: string | null; // null only on provenance-preserving imports
	reviewedByUserId: string | null;
	createdAt: string;
	submittedAt: string | null;
	publishedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	retiredAt: string | null;
	promptCount: number;
	aircraftCount: number;
	legacyLinkCount: number;
	futureLinkCounts: Readonly<Record<FutureLinkStatus, number>>;
}

export interface SafeQuestionListItemDto extends QuestionVersionSummaryDto {
	primaryPrompt: string; // assessment content; permissioned question-bank read only
	aircraft: readonly AircraftApplicabilityDto[];
}

export interface PrivilegedQuestionDetailDto extends QuestionVersionSummaryDto {
	prompts: readonly QuestionPromptDto[];
	options: readonly PersistedQuestionOptionDto[];
	display: CanonicalQuestionDisplayDto;
	aircraft: readonly AircraftApplicabilityDto[];
	legacyCurriculum: readonly LegacyQuestionLinkDto[];
	futureCurriculum: readonly FutureQuestionLinkDto[];
	dependencies: QuestionDependencyResult;
}
```

General list and search payloads never include option text, correctness,
semantic answer values, answer keys, or derived compound-key text. Privileged
detail is returned only after server authorization for an authoring/review
context; displaying key material additionally requires `answer_keys.view` or a
server-recognized author/reviewer workflow that needs the key. Route code must
not infer that authority from client state.

## Prompt, option, and canonical display models

```ts
export interface QuestionPromptInput {
	text: unknown;
}
export interface QuestionPromptDto {
	id: string;
	position: number;
	text: string;
}

export interface QuestionOptionInput {
	text: unknown;
	isCorrect?: unknown;
	semanticValue?: unknown;
}

export interface PersistedQuestionOptionDto {
	id: string;
	position: number; // canonical source order, zero-based
	text: string;
	isCorrect: boolean;
	semanticValue: 'true' | 'false' | 'compound' | 'all' | 'none' | null;
}

export interface CanonicalDisplayChoiceDto {
	letter: 'A' | 'B' | 'C' | 'D';
	text: string;
	isCorrect?: boolean; // omitted in non-key display projections
}

export interface CanonicalQuestionDisplayDto {
	questionType: QuestionType;
	prompt: string;
	choices: readonly CanonicalDisplayChoiceDto[];
	keyLetter?: 'A' | 'B' | 'C' | 'D'; // privileged only
}
```

Every authored version has one or more ordered prompts. Prompt text is trimmed,
nonblank, distinct after trim, at most 4,000 characters, and stored at contiguous
positions. Options are trimmed, nonblank, and distinct after trim. The canonical
persisted representation stays compatible with Phase 3: true/false persists
canonical True and False rows; single-choice persists four source rows; the
compound/all/none types persist the three source A–C statement rows. Display D
is derived and is not inserted as a source option row.

Display construction is deterministic and shared by validation, server preview,
migration verification, and future Phase 7 consumers:

- true/false: `A. True`, `B. False`; the semantic Boolean selects the key;
- single choice: persisted positions 0–3 display as A–D and exactly one is key;
- two-correct compound: persisted positions 0–2 display as A–C; D is
  `A and B are correct.`, `A and C are correct.`, or `B and C are correct.`
  from the two correct persisted letters, sorted alphabetically, and D is key;
- all-correct: persisted A–C are correct; D is exactly `All of the above.` and
  is key; and
- none-correct: persisted A–C are incorrect; D is exactly
  `None of the above.` and is key.

No random all/none distractor is ever added to single choice. Imported versions
are not rewritten merely to persist a derived D choice.

## Shape validation

All validation is server authoritative and happens before persistence inside the
service command boundary.

- `true_false`: exactly two canonical semantic option rows, one `true`, one
  `false`, and exactly one keyed semantic Boolean. Missing, duplicated, unknown,
  or ambiguous semantics are rejected.
- `single_choice`: exactly four distinct options, one correct and three
  incorrect.
- `two_correct_compound`: exactly three distinct A–C statements, two correct and
  one incorrect. One-correct and three-correct shapes are rejected.
- `all_correct`: exactly three distinct correct A–C statements.
- `none_correct`: exactly three distinct incorrect A–C statements.

Validation errors contain only field names, positions, and fixed safe messages;
they never echo prompt, option, answer, or key content.

## Commands and lifecycle

Every command takes `actorUserId` separately. Routes derive it from the real
Phase 4 principal and never accept actor identity, roles, or permissions from
form input.

```ts
export interface CreateQuestionCommand {
	questionType: unknown;
	prompts: readonly QuestionPromptInput[];
	options: readonly QuestionOptionInput[];
	aircraftVariantIds: readonly unknown[];
	legacyCurriculumLinks?: readonly LegacyQuestionLinkInput[];
	futureCurriculumLinks?: readonly FutureQuestionLinkInput[];
}
export interface UpdateQuestionDraftCommand extends CreateQuestionCommand {
	versionId: string;
	expectedVersion: number;
}
export interface CreateQuestionVersionCommand {
	questionId: string;
	fromVersionId: string;
}
export interface SubmitQuestionReviewCommand {
	versionId: string;
}
export interface ReviewQuestionVersionCommand {
	versionId: string;
	decision: 'approve' | 'return';
	rationale: unknown;
}
export interface PublishQuestionVersionCommand {
	versionId: string;
	effectiveFrom: unknown;
	effectiveTo?: unknown;
}
export interface RetireQuestionVersionCommand {
	versionId: string;
	reason: unknown;
	expectedDependencyRevision: string;
}
export interface DeleteQuestionDraftCommand {
	versionId: string;
	expectedDependencyRevision: string;
}
```

Creation inserts one immutable identity and version 1 draft. Drafts alone may be
edited in place. Editing published, retired, referenced, or imported review
content is forbidden. `createVersion` copies an explicitly chosen version to a
new attributable draft with the next identity-local number and fresh UUIDs for
all version-owned rows. Published and referenced versions never change.

Allowed transitions are draft → review, review → draft on return, review →
published after explicit approval, and published → retired. Approval and
publication each require an authorized actor distinct from the author.
Administrator never bypasses this rule. Published/retired versions are
immutable. Retirement is terminal. Hard deletion is limited to an unreferenced
draft after a fresh dependency calculation; referenced or published content is
retired instead.

Imported Phase 3 versions remain provenance-preserving `review`/`blocked` rows
with null author attribution. They are never mutated in place to correct, adopt,
or publish them. Adoption always creates a new version draft with the current
authorized actor as author, copies the imported content and faithful legacy
links, and then follows the normal distinct-review lifecycle.

## Applicability and future-link review

```ts
export interface AircraftApplicabilityDto {
	aircraftVariantId: string;
	code: string;
	name: string;
}
export interface LegacyQuestionLinkInput {
	legacyTpoId: unknown;
	legacySpoId: unknown;
	legacyEoId: unknown;
}
export interface LegacyQuestionLinkDto {
	legacyTpoId: string;
	legacySpoId: string;
	legacyEoId: string;
}
export interface FutureQuestionLinkInput {
	subtaskVersionId: unknown;
	elementVersionId?: unknown;
}
export interface FutureQuestionLinkDto {
	questionVersionId: string;
	subtaskVersionId: string;
	elementVersionId: string | null;
	status: FutureLinkStatus;
	proposedByUserId: string;
	proposedAt: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
}
export interface DecideFutureQuestionLinkCommand {
	questionVersionId: string;
	subtaskVersionId: string;
	decision: 'approve' | 'retire';
	rationale: unknown;
}
```

Every version requires at least one effective, published aircraft variant for
publication and eligibility. Legacy links are faithful historical TPO → SPO →
EO chains and are never reinterpreted as future IDs. Future links target a
published/effective Subtask version and optional Element version whose exact
published/effective Phase → Task → Subtask → Element ancestry is valid. The
optional Element must belong to the selected Subtask version.

A future link is created only by an explicit attributable proposal in `review`.
An authorized distinct reviewer explicitly approves or retires it, recording
reviewer and time. No importer, legacy mapping, Phase 5 mapping approval,
identifier/name match, or reconciliation process proposes or approves a link.
Question author self-approval of their version's link is rejected.

## Generation eligibility

Eligibility is always server-derived at the injected clock instant. A version is
`eligible` only when all conditions hold together:

1. lifecycle is `published` and not retired;
2. `effectiveFrom <= now < effectiveTo`, with null end open;
3. at least one applicable aircraft variant is published and effective;
4. at least one explicitly approved, non-retired future curriculum link exists;
5. every approved link used for eligibility has a complete published/effective
   Phase → Task → Subtask and optional Element chain; and
6. no link or ancestor retirement/effective-range change makes that proof stale.

`deriveGenerationEligibility(versionId, now)` returns the Boolean plus safe
reason codes and counts, never assessment content or UUID lists. Every mutation
that can affect the version's eligibility recomputes and persists
`generation_status` in the same outer transaction as the mutation and audit.
Publication alone, an approved link on an unpublished question, or Phase 5
mapping approval alone remains blocked. Retirement transactionally changes the
status to blocked. Curriculum ancestry retirement is interlocked: an active
review/approved question link is a blocking dependency until an authorized
reviewer retires the link, which transactionally blocks the question and emits
the eligibility audit before curriculum retirement may proceed. Any failure
rolls back the lifecycle/link/status/audit unit.

## Search, filter, and pagination

```ts
export interface QuestionSearchQuery {
	search?: unknown; // trimmed, case-insensitive prompt search
	types?: readonly unknown[];
	lifecycles?: readonly unknown[];
	generationStatuses?: readonly unknown[];
	aircraftVariantIds?: readonly unknown[];
	futureLinkStatuses?: readonly unknown[];
	page?: unknown; // one-based, default 1
	pageSize?: unknown; // default 25, maximum 100
}
export interface QuestionSearchResult {
	items: readonly SafeQuestionListItemDto[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}
```

Ordering is deterministic: latest activity/creation descending, then immutable
version ID. Filters compose with AND across categories and OR within a category.
Search uses parameterized queries and never searches or returns option/answer
text. Representative list/filter query plans must use Phase 6 indexes and avoid
full scans of version-owned option/key rows.

## Dependencies

```ts
export type QuestionDependencyKind =
	| 'historical_performance'
	| 'exam_snapshot'
	| 'future_curriculum_link'
	| 'legacy_curriculum_link'
	| 'published_version';
export interface QuestionDependencyResult {
	operation: 'delete' | 'retire' | 'edit';
	items: readonly { kind: QuestionDependencyKind; count: number; blocking: boolean }[];
	totalCount: number;
	blocksHardDelete: boolean;
	requiresRetirement: boolean;
	revision: string;
}
```

Dependency previews contain safe kinds/counts only. Mutations recalculate them
inside the transaction and reject stale revisions with `dependency_changed`.

## Errors

Stable domain errors are:

- `invalid_input`, `invalid_question_type`, `invalid_question_shape`;
- `unauthenticated`, `forbidden`, `answer_key_forbidden`;
- `not_found`, `conflict`, `stale_version`, `invalid_transition`;
- `distinct_reviewer_required`, `referenced_immutable`;
- `aircraft_not_effective`, `parent_chain_invalid`,
  `curriculum_not_published`, `effective_range_invalid`;
- `future_link_review_required`, `future_link_conflict`;
- `dependency_exists`, `dependency_changed`; and
- `unavailable`.

Storage errors return only `unavailable`. Field errors never include content.

## Authorization

Question list and safe summary reads require the additive `questions.view`
permission. Create/edit/version/submit/delete and proposal operations require
`questions.create`. Review/return and future-link decisions require
`questions.review`. Publication requires `questions.publish` and an existing
distinct approval. Retirement requires `records.retire` plus
`questions.publish`. Any response that exposes correct-answer material requires
`answer_keys.view` unless the server has established the actor's authorized
question authoring/adoption or assigned review context. Safe list/search never
includes keys even for privileged actors.

All page loads and actions use `requirePermission` with the real principal.
Anonymous, authenticated-without-permission, Instructor-only, Curriculum
Manager-only, revoked-role, and suspended actors are denied. Origin/CSRF,
session, secure-cookie, and security-header behavior remains Phase 4 owned.

## Audit vocabulary and safe metadata

Audit action names are:

- `question.created`, `question.version.created`, `question.version.updated`,
  `question.version.submitted`, `question.version.reviewed`,
  `question.version.returned`, `question.version.published`,
  `question.version.retired`, and `question.version.deleted`;
- `question.aircraft.changed`;
- `question.future_link.proposed`, `.approved`, and `.retired`; and
- `question.eligibility.changed`.

Safe metadata is limited to `questionType`, `version`, `status`, `decision`,
`changedFields`, `count`, `aircraftCount`, `futureLinkCount`,
`generationStatus`, and fixed safe `reason` codes. Prompt/option text,
correctness, semantic values, derived keys, legacy source IDs, curriculum UUID
lists, rationales, request bodies, URLs, SQL, and quarantine payloads never enter
audit metadata or logs.

## Transaction, clock, and UUID ownership

The outer question service owns one synchronous `DatabaseHandle.transaction`
per mutation. Repositories, eligibility calculation, dependency checks,
curriculum-chain checks, and `recordAuditEvent` receive the caller's
`FoundationDatabase` transaction and never start nested transactions. Identity
plus version-owned rows, lifecycle/review attribution, link changes,
eligibility, and audit commit or roll back as a unit.

```ts
export interface QuestionClock {
	now(): Date;
}
export interface QuestionIdFactory {
	create(): string;
}
```

Production uses the UTC system clock and `randomUUID`. Tests inject deterministic
clocks and UUID factories and do not sleep.

## Schema, migration, and importer ownership

Tranche 6A alone edits `src/lib/server/db/schema/content.ts`, creates ordered
migration `0010` or later, and updates Drizzle metadata. Migrations `0000`–`0009`
are immutable. Required additive/rebuild work may add question review timestamps,
future-link proposal/reviewer attribution, publication/immutability checks, and
list/filter indexes while preserving Phase 3 imported identities and rows.

Tranche 6C alone may make narrow evidence-backed Phase 3 importer and
reconciliation edits. It must preserve `IMPORT_NAMESPACE`, the UUIDv5 name
formula, `IMPORTER_VERSION` unless a documented compatible version change is
required, all 15 source dispositions, and repeated-import idempotence. Imported
versions remain `review`/`blocked`, create zero future links, and create zero
eligible versions. Safe reports contain counts/status/reason vocabulary only.

## Route and mutation inventory

6B owns route files; 6A owns called services; the coordinator owns the central
authorization inventory and cross-tranche integration/security tests.

| Route             | Load                                       | Named mutations                                                                                                                                                                 |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/questions`      | safe list, filters, pagination             | `createQuestion`                                                                                                                                                                |
| `/questions/[id]` | authorized detail, lifecycle, dependencies | `updateDraft`, `createVersion`, `submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`, `deleteDraft`, `proposeFutureLink`, `approveFutureLink`, `retireFutureLink` |

Both routes use ordinary POST forms and remain functional without enhanced
JavaScript. No public question JSON endpoint is introduced. The coordinator may
split create/review pages only if every resulting route and named mutation is
added to the same central inventory with the permission rules above.

## File ownership and convergence

- 6A: question domain/schema/migrations and its exclusive tests/contracts.
- 6B: question components/routes and UI tests/contracts.
- 6C: question migration/reconciliation and narrowly corresponding Phase 3
  code/tests/contracts.
- 6D coordinator: shared authorization/audit/navigation, package manifests,
  golden/integration/accessibility/e2e/security tests, characterization,
  verification, summary, commits, and preview operation.

No sub-agent stages or commits. Shared changes are requested through the
coordinator. All tranches use this contract rather than defining duplicate
public types.
