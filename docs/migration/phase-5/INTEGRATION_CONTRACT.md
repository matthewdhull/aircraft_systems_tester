# Phase 5 Integration Contract

## Status and authority

This contract fixes the shared seams for Phase 5 tranches 5A–5D. It is subordinate
to the Phase 0 owner decisions, the Phase 3 schema/importer/reconciliation
contracts, the Phase 4 authorization and audit contracts, and the binding Phase 5
decisions. Implementations may add private fields, but consumers must use the
shapes and behavior below.

The future curriculum is Phase → Task → Subtask → Element. It and the Bloom
vocabulary start empty. Legacy TPO/SPO/EO remains a separate historical
curriculum. Neither importer code nor mapping review may create future nodes,
reuse a legacy identifier as a future UUID, infer a mapping, create a future
question link, or make a question generation-eligible.

## Shared vocabulary and DTOs

```ts
export type CurriculumNodeType = 'phase' | 'task' | 'subtask' | 'element';
export type CurriculumLifecycle = 'draft' | 'review' | 'published' | 'retired';

export interface CurriculumNodeDto {
	id: string; // immutable RFC 4122 UUID identity
	type: CurriculumNodeType;
	createdAt: string;
	retiredAt: string | null;
	latestVersion: CurriculumVersionDto;
}

export interface CurriculumVersionDto {
	id: string; // immutable RFC 4122 UUID version identity
	nodeId: string;
	nodeType: CurriculumNodeType;
	version: number; // starts at 1 and increments per stable node
	name: string;
	description: string | null;
	position: number; // zero-based contiguous sibling position
	status: CurriculumLifecycle;
	parentVersionId: string | null; // null only for Phase
	bloomVerbId: string | null; // unavailable for Element
	effectiveFrom: string | null;
	effectiveTo: string | null; // half-open range
	authoredByUserId: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	createdAt: string;
	publishedAt: string | null;
	retiredAt: string | null;
}

export interface CurriculumHierarchyDto {
	generatedAt: string;
	rootOrderRevision: string;
	phases: readonly PhaseHierarchyDto[];
}

export interface PhaseHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	tasks: readonly TaskHierarchyDto[];
}

export interface TaskHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	subtasks: readonly SubtaskHierarchyDto[];
}

export interface SubtaskHierarchyDto {
	node: CurriculumNodeDto;
	childrenOrderRevision: string;
	elements: readonly CurriculumNodeDto[];
}
```

Hierarchy reads are deterministic: position ascending, then immutable version ID
as a defensive tie-breaker. The default manager view returns the latest
non-retired version of each identity and exposes lifecycle text. A published-only
read model returns only versions effective at the supplied clock instant and only
when the complete published/effective parent chain is valid.

## Curriculum commands

Every command receives `actorUserId`. Route code obtains that UUID from the real
Phase 4 principal; employee numbers and role names are never accepted as
authority.

```ts
export interface CreateNodeCommand {
	type: CurriculumNodeType;
	parentVersionId: string | null;
	name: unknown;
	description?: unknown;
	bloomVerbId?: unknown;
	position?: unknown; // omitted means append
}

export interface CreateDraftVersionCommand {
	nodeId: string;
	fromVersionId: string;
}

export interface UpdateDraftVersionCommand {
	versionId: string;
	expectedVersion: number;
	name: unknown;
	description?: unknown;
	bloomVerbId?: unknown;
	parentVersionId?: unknown;
	expectedDependencyRevision?: string;
}

export interface ReviewVersionCommand {
	versionId: string;
	decision: 'approve' | 'return';
	rationale: unknown;
}

export interface PublishVersionCommand {
	versionId: string;
	effectiveFrom: unknown;
	effectiveTo?: unknown;
}

export interface RetireVersionCommand {
	versionId: string;
	reason: unknown;
	expectedDependencyRevision: string;
}

export interface DeleteDraftCommand {
	versionId: string;
	expectedDependencyRevision: string;
}
```

Creation inserts one stable identity and version 1 draft in one transaction. A
later draft is a new immutable version number and UUID copied from the requested
source version; it never updates published content. Only drafts are editable or
movable between parents. Parent changes require a fresh dependency preview.

Lifecycle transitions are:

- `draft → review` by submit;
- `review → draft` by an attributable return-for-changes decision;
- `review → published` only after an attributable approval by a user distinct
  from the author;
- `published → retired` with a server-derived dependency preview; and
- safely unreferenced `draft → hard deleted` transactionally.

No other transition is allowed. Approval records `reviewedByUserId` and
`reviewedAt`; publication does not erase review attribution. Published and
retired versions are immutable. Retirement is terminal. A reviewer or publisher
must still hold `curriculum.manage`; Administrator does not bypass the
distinct-reviewer rule.

Effective ranges use canonical UTC RFC 3339 milliseconds and are half-open.
`effectiveTo`, when supplied, must be later than `effectiveFrom`. A published
Task/Subtask/Element requires a published parent version whose effective range
fully covers the child's range. All ancestors must form the declared hierarchy
and be published/effective. Draft parents are valid only for draft authoring;
they cannot support child publication.

## Reordering and position semantics

```ts
export interface ReorderSiblingsCommand {
	parentVersionId: string | null;
	nodeType: CurriculumNodeType;
	orderedVersionIds: readonly string[];
	expectedOrderRevision: string;
}

export interface ReorderResult {
	parentVersionId: string | null;
	nodeType: CurriculumNodeType;
	orderedVersionIds: readonly string[];
	orderRevision: string;
}
```

Positions are zero-based and contiguous (`0..n-1`) within the exact parent
version and node type. A reorder submits the complete sibling-version order, not
individual numeric positions. It must contain every current editable sibling
exactly once. The service compares `expectedOrderRevision` with a deterministic
revision of the current ordered UUIDs, rejects stale/concurrent requests with
`stale_order`, and rewrites positions inside one outer transaction. A temporary
collision-free range or equivalent two-pass update is required so the database
unique constraint remains enabled. Any failure rolls back the entire reorder.
Published versions are never rewritten; a changed published order requires new
draft versions.

The database must reject final duplicate sibling positions independently of the
service. Service tests cover first, middle, last, stale, collision, and rollback
cases.

## Bloom vocabulary

```ts
export type BloomLifecycle = 'draft' | 'published' | 'retired';

export interface BloomLevelDto {
	id: string;
	ordinal: number;
	name: string;
	status: BloomLifecycle;
	createdAt: string;
	retiredAt: string | null;
	verbs: readonly BloomVerbDto[];
}

export interface BloomVerbDto {
	id: string;
	bloomLevelId: string;
	verb: string;
	status: BloomLifecycle;
	createdAt: string;
	retiredAt: string | null;
}

export interface UpsertBloomLevelCommand {
	id?: string;
	ordinal: unknown;
	name: unknown;
}

export interface UpsertBloomVerbCommand {
	id?: string;
	bloomLevelId: unknown;
	verb: unknown;
}
```

Level and verb creation starts in draft. Drafts may be edited or safely deleted;
draft may publish, and published may retire. Published/retired vocabulary is not
hard-deleted. A verb is selectable only when both it and its level are
published, unless an existing draft version is retaining its already selected
draft verb. A child node's selected Bloom level may not be lower than its
parent's published selection when both exist. Element has no Bloom selection.
No taxonomy rows are seeded or guessed in Phase 5. Stable UUIDs and separate
level/verb identities preserve a version-ready boundary without inventing
production vocabulary.

## Dependency warnings

```ts
export type DependencyKind =
	| 'child_version'
	| 'question_future_link'
	| 'template_rule'
	| 'template_required_element'
	| 'legacy_mapping'
	| 'published_version';

export interface DependencyWarningItem {
	kind: DependencyKind;
	count: number;
	blocking: boolean;
}

export interface DependencyWarningResult {
	entityType: CurriculumNodeType | 'bloom_level' | 'bloom_verb';
	entityId: string;
	operation: 'parent_change' | 'retire' | 'delete' | 'archive';
	items: readonly DependencyWarningItem[];
	totalCount: number;
	blocksHardDelete: boolean;
	requiresRetirement: boolean;
	revision: string;
}
```

Dependency previews are calculated server-side from canonical tables. Commands
recompute them in the mutation transaction and compare the opaque, non-secret
revision. A mismatch returns `dependency_changed`; a blocking reference prevents
hard deletion. The result contains counts and kinds only, never question text,
answer material, quarantine payloads, or source IDs.

## Legacy curriculum and mapping

```ts
export type LegacyEntityType = 'tpo' | 'spo' | 'eo';
export type MappingStatus = 'proposed' | 'approved' | 'rejected' | 'retired';

export interface LegacyCurriculumNodeDto {
	id: string;
	type: LegacyEntityType;
	number: string;
	name: string;
	children: readonly LegacyCurriculumNodeDto[];
}

export interface LegacyCurriculumMappingDto {
	id: string;
	legacyEntityType: LegacyEntityType;
	legacyEntityId: string;
	targetEntityType: CurriculumNodeType;
	targetEntityId: string;
	status: MappingStatus;
	proposedByUserId: string;
	proposedAt: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	rationale: string;
}

export interface ProposeLegacyMappingCommand {
	legacyEntityType: unknown;
	legacyEntityId: unknown;
	targetEntityType: unknown;
	targetEntityId: unknown;
	rationale: unknown;
}

export interface DecideLegacyMappingCommand {
	mappingId: string;
	decision: 'approve' | 'reject';
	rationale: unknown;
}

export interface RetireLegacyMappingCommand {
	mappingId: string;
	rationale: unknown;
}
```

Only an explicit propose command creates a row, always with `proposed` status.
Only explicit approve/reject commands decide it; only an approved mapping may be
retired. Decisions record actor, time, and nonblank rationale. Source existence,
source parent chain, target stable identity/type, target published/effective
version, and complete target parent chain are validated at decision time.
Conflicting approved mappings for the same legacy entity and target type are
rejected. No mapping process reads question content or writes
`question_future_curriculum_links` or `question_versions.generation_status`.

Reconciliation is read-only and deterministic. It reports unmapped counts for
TPO/SPO/EO; status counts; counts by source and target type; invalid targets;
conflicts; broken source and target chains; zero importer-created future nodes;
and zero question-eligibility side effects. CLI/report output contains counts,
statuses, and check names only—no source IDs, UUIDs, content, quarantine payload,
paths, people, or assessment material.

## Results, validation, and errors

Commands return `ok: true` with a DTO or `ok: false` with one stable error:

- `invalid_input` — field-safe validation errors;
- `unauthenticated` — owned by the Phase 4 route guard;
- `forbidden` — owned by the Phase 4 permission guard;
- `not_found` — safe absence;
- `conflict` — duplicate name/ordinal/version or incompatible current state;
- `stale_version` — optimistic content version mismatch;
- `stale_order` — sibling order revision mismatch;
- `invalid_transition` — lifecycle transition not permitted;
- `distinct_reviewer_required` — author attempted review/publication;
- `parent_chain_invalid` — wrong type, missing ancestor, or mismatched chain;
- `parent_not_published` — publication lacks a published/effective parent chain;
- `effective_range_invalid` — invalid or uncovered effective range;
- `dependency_exists` — hard deletion is unsafe;
- `dependency_changed` — warning revision is stale;
- `referenced_immutable` — published/referenced version mutation attempted;
- `mapping_conflict` — an incompatible approved mapping exists; and
- `unavailable` — storage/audit failure with no partial write.

Names and descriptions are trimmed server-side. Names and Bloom verbs must be
nonblank and at most 200 characters; descriptions and rationales at most 2,000
characters, with rationale nonblank where required. Positions and ordinals are
integers in their declared ranges. IDs must be nonblank UUIDs for newly authored
identities. Dates must use the canonical Phase 3 encoding. Field errors contain
only field name and fixed safe message; storage errors do not expose SQL or
record content.

## Authorization and audit

Every Phase 5 page load and mutation uses the real Phase 4
`requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, mode)` guard. This
includes hierarchy reads, vocabulary reads, legacy hierarchy/reconciliation
reads, and all named actions. Administrator is allowed through its seeded
permission, not a role-name shortcut. Anonymous, insufficient permission,
Instructor-only, revoked grant, and suspended-user cases are denied by the real
cookie/session/hook/route chain. UI visibility is presentation only. SvelteKit
origin checking remains enabled for every action.

Audit action names are:

- `curriculum.node.created`, `curriculum.version.created`,
  `curriculum.version.updated`, `curriculum.version.submitted`,
  `curriculum.version.reviewed`, `curriculum.version.returned`,
  `curriculum.version.published`, `curriculum.version.retired`,
  `curriculum.version.deleted`, and `curriculum.siblings.reordered`;
- `curriculum.bloom_level.created`, `.updated`, `.published`, `.retired`,
  `.deleted`, with equivalent `curriculum.bloom_verb.*` names; and
- `curriculum.mapping.proposed`, `.approved`, `.rejected`, and `.retired`.

The audit entity ID is the stable node/vocabulary/mapping UUID. Allow-listed safe
metadata is limited to `nodeType`, `version`, `status`, `changedFields`,
`position`, `fromPosition`, `toPosition`, `count`, `decision`, `reason`,
`sourceType`, and `targetType`. Names, descriptions, rationales, legacy source
IDs, question/answer content, tokens, hashes, cookies, and dependency UUID lists
must not be persisted in audit JSON. The coordinator owns any additive audit
allow-list update.

## Transaction ownership and test injection

The outer domain or mapping service owns one synchronous
`DatabaseHandle.transaction` for each mutation. Repositories, dependency reads,
mapping target checks, and `recordAuditEvent` accept the supplied
`FoundationDatabase` transaction and never start nested transactions. Stable
identity plus initial version, all reorder writes, lifecycle mutation plus audit,
retirement, and draft cascades commit or roll back together.

```ts
export interface CurriculumClock {
	now(): Date;
}
export interface CurriculumIdFactory {
	create(): string;
}
```

Production uses the system UTC clock and `randomUUID`. Tests inject deterministic
clocks and UUID factories and never sleep or rely on wall-clock ordering.

## Route and mutation inventory

5B owns the route files and progressive-enhancement UI; 5A/5C own the called
services; the coordinator owns authorization inventory and cross-tranche tests.

| Route                        | Load                                                 | Named mutations                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/curriculum`          | hierarchy, lifecycle, dependency previews            | `createNode`, `createVersion`, `updateDraft`, `submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`, `deleteDraft`, `reorderSiblings` |
| `/admin/curriculum/bloom`    | Bloom levels and verbs                               | `createLevel`, `updateLevel`, `publishLevel`, `retireLevel`, `deleteLevel`, `createVerb`, `updateVerb`, `publishVerb`, `retireVerb`, `deleteVerb`  |
| `/admin/curriculum/mappings` | read-only legacy tree, mappings, safe reconciliation | `proposeMapping`, `approveMapping`, `rejectMapping`, `retireMapping`                                                                               |

All three route patterns are `curriculum.manage` reads and contain 23 protected
named mutations. Actions use ordinary POST forms and return SvelteKit `fail`
results with the stable error vocabulary. Dependency previews may be loaded by a
guarded action or included in the manager load; no public JSON endpoint is
introduced. Phase 5 adds no question-bank, template, exam, or generation route.

## Schema, migration, and file ownership

5A alone edits `src/lib/server/db/schema/curriculum.ts`, creates ordered Phase 5
migration `0007` or later, and updates Drizzle snapshots/journal. Migrations
`0000`–`0006` are immutable. Required additive schema work includes enforceable
sibling-position uniqueness, review timestamp/proposal attribution needed by
the DTOs, and mapping integrity support that 5C requests through the coordinator.
Polymorphic mapping existence and hierarchy-chain rules remain service checks
where SQLite cannot express them safely.

5B must not edit server domain/schema/migrations/shared authorization/navigation.
5C must not edit shared schema/migrations, importer dispositions, or UI routes.
The coordinator alone edits shared authorization/audit allow lists, navigation,
package manifests, coordinator test trees, this contract, and final Phase 5
documents. No tranche commits independently.
