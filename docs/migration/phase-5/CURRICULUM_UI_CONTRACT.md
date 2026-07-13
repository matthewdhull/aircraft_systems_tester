# Phase 5 Curriculum UI Contract

## Scope

The Phase 5 user experience manages the future Phase → Task → Subtask → Element
hierarchy, controlled Bloom vocabulary, and explicitly reviewed legacy
TPO/SPO/EO mappings. It does not implement question-bank, template, exam,
generation, or other Phase 6 behavior.

The UI consumes the DTOs and commands in
[INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md). It contains no production
fixtures, inferred mappings, seeded Bloom taxonomy, client-only authorization,
or client-owned lifecycle rules.

## Protected routes

All page loads and every action call the Phase 4
`requirePermission(locals, PERMISSIONS.CURRICULUM_MANAGE, mode)` guard before
constructing or invoking a service. Ordinary POST forms preserve progressive
enhancement and SvelteKit's existing origin/CSRF behavior.

| Route                        | Read model                                                        | Named actions                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/curriculum`          | Manager hierarchy, Bloom selectors, server dependency previews    | `createNode`, `createVersion`, `updateDraft`, `submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`, `deleteDraft`, `reorderSiblings` |
| `/admin/curriculum/bloom`    | Bloom levels, verbs, and server dependency previews               | `createLevel`, `updateLevel`, `publishLevel`, `retireLevel`, `deleteLevel`, `createVerb`, `updateVerb`, `publishVerb`, `retireVerb`, `deleteVerb`  |
| `/admin/curriculum/mappings` | Legacy hierarchy, future hierarchy, mappings, safe reconciliation | `proposeMapping`, `approveMapping`, `rejectMapping`, `retireMapping`                                                                               |

The hierarchy and Bloom routes call `createCurriculumService(database)`. The
mapping route calls `createCurriculumMappingService(database)` and uses the
curriculum hierarchy only to render reviewed target choices. There are no
permanent mocks or public JSON endpoints.

## Hierarchy interaction

- The intentionally empty state explains that historical TPO/SPO/EO data was
  not copied and offers an initial Phase draft form.
- Nested levels use native `details`/`summary` progressive disclosure. The
  hierarchy remains linear and readable when collapsed, with type, lifecycle,
  version, and position rendered as text rather than color alone.
- Create and draft-edit forms submit unknown input to the server service for
  authoritative validation. Published and retired versions are never presented
  as editable.
- Review requires an explicit approve/return decision and rationale. Publication
  is available only after review attribution exists and collects the effective
  range checked by the server.
- Parent choices preserve the declared hierarchy. A server-derived dependency
  preview and opaque revision accompany parent changes.
- Draft deletion and published retirement are separate controls. Dependency
  counts are announced, blocking deletion is disabled, and the mutation sends
  the preview revision for transactional revalidation.

## Ordering

Ordering is not drag-only. Every editable sibling has native, focusable Move Up
and Move Down submit buttons. Each reorder form submits the complete reordered
sibling-version list, exact parent and node type, expected order revision, and a
post-action focus target. The server owns stale-order detection, contiguous
positions, collision avoidance, the transaction, and rollback.

After an enhanced successful response, focus returns to the moved node heading.
After a full non-JavaScript submission, the same ordinary POST action completes
the reorder and returns the refreshed deterministic hierarchy.

## Bloom vocabulary

The vocabulary page visibly supports the valid draft → published → retired
lifecycle for levels and verbs. Drafts can be edited or safely deleted;
published vocabulary can only be retired. Selectors show only published verbs
whose level is also published, except that a draft retains its already selected
verb as allowed by the domain contract. Elements never render a Bloom selector.

The page starts empty and does not suggest, seed, or hardcode taxonomy names or
verbs.

## Legacy mapping review

The mapping page states the manual review boundary before its controls. A user
must select an existing legacy node and a published future target and provide a
rationale to create a proposal. Approval and rejection are separate attributable
POST actions, each requiring a new rationale. Only approved mappings render a
retirement action.

The page explicitly states that approval neither creates a question link nor
makes a legacy question eligible for future generation. Safe reconciliation
renders only counts, check names, statuses, and pass/fail results. It does not
render source identifiers, quarantine payloads, question material, credentials,
or other restricted import detail.

## Accessibility and responsive behavior

- All controls are native links, buttons, inputs, textareas, selects, details,
  and summaries with programmatic labels.
- Move controls have node-specific accessible names and work with standard
  keyboard activation.
- Lifecycle is written as visible text. Dependency warnings use a live status
  region, while mutation success uses `role="status"`.
- Mutation errors use one `role="alert"`, receive focus after an enhanced
  response, and contain the server's field-safe messages. No SQL or record
  content is exposed.
- Successful add, edit, lifecycle, reorder, and delete responses provide a
  stable focus target.
- Layout grids use `auto-fit` and `minmax`; nesting indentation disappears at a
  narrow viewport; navigation and action groups wrap; no horizontal hierarchy
  width is required.
- Core read, create, edit, lifecycle, mapping, and reorder operations do not
  depend on client JavaScript.

## Stable UI states and errors

The pages render empty, loading, success, validation-error, conflict/stale,
dependency, authorization, not-found, and unavailable states. Loading is
announced from SvelteKit navigation state; server forms continue to work without
client JavaScript. The route guard owns anonymous and forbidden responses,
and the UI never treats hidden controls as authorization.

Stable domain errors are converted to safe HTTP failures: not found is `404`,
conflict/stale/dependency-change is `409`, unavailable is `503`, and other
field/lifecycle failures are `400`. Phase 4 owns unauthenticated and forbidden
responses.

## Verification ownership

Component tests under `tests/curriculum/ui/` cover the initial empty state,
labeled forms, full-order keyboard reorder submission, error announcement and
focus, empty Bloom vocabulary, and the mapping review boundary. Coordinator
suites own cross-route authorization, browser CRUD, narrow viewport, keyboard,
and integrated accessibility verification.
