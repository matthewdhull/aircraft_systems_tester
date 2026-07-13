# Phase 3 Schema Contract — Version 1

## Status and boundary

This is the stable importer-facing contract for the Phase 3 canonical SQLite
schema. The TypeScript definitions under `src/lib/server/db/schema/`, ordered SQL
under `drizzle/`, and Drizzle snapshots/journal are one versioned unit. The
schema provides persistence and invariants only; it does not implement
authentication, authoring, generation, delivery, grading, reporting, import, or
reconciliation services.

The authoritative 2014 export is the only migration source. Imported
TPO/SPO/EO data remains a separate historical curriculum. Phase, Task, Subtask,
Element, and Bloom structures begin empty. No importer may reinterpret a legacy
identifier as a future hierarchy identifier.

## Identifier and time contract

- Every mutable business concept has an immutable text primary key. Application
  services will use RFC 4122 UUIDs; new operational records use a
  time-independent random UUID and imported records use UUIDv5.
- The fixed import namespace is `e1777bf5-7f78-5d25-9ca4-b5241031263f`.
  The UUIDv5 name is the UTF-8 string
  `ast:legacy-2014:<source-table>:<source-id>:<target-table>:<target-version>`.
  Table names preserve source casing. Source IDs are decoded strings in their
  source representation, without numeric coercion. Version is `1` unless the
  importer creates a later canonical version. This makes independent clean
  imports logically identical.
- A source identifier is also stored explicitly in the relevant legacy table
  and in `source_target_mappings`; UUIDs never replace reconciliation evidence.
- New people use UUID identities and employee numbers remain strings, so leading
  zeros are significant.
- Instants use UTC RFC 3339 text with millisecond precision
  (`YYYY-MM-DDTHH:mm:ss.sssZ`). Calendar dates use `YYYY-MM-DD`. Effective ranges
  are half-open: `effective_from` is inclusive and `effective_to` is exclusive.
  Null `effective_to` means open-ended. Comparisons rely on this canonical
  encoding.
- Booleans are SQLite integers restricted by Drizzle's boolean mapping. Counts,
  positions, ordinals, and versions are integers; percentages are numeric values
  from 0 through 100.

## Table catalog

### Infrastructure, identity, and controlled vocabulary

| Table                         | Purpose and key invariants                                                                                                     | Future owner   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `_foundation_metadata`        | Empty Phase 2 migration probe; never domain data.                                                                              | Foundation     |
| `import_runs`                 | One atomic logical run per source checksum/importer version, safe outcome counts, and started/completed state.                 | Phase 3        |
| `users`                       | Immutable person/account ID, unique string employee number, lifecycle, and future password hash. No legacy person is imported. | Phase 4        |
| `employee_identifier_history` | Append-only audited employee-number corrections; old and new values must differ.                                               | Phase 4        |
| `roles`                       | Stable role vocabulary.                                                                                                        | Phase 4        |
| `permissions`                 | Stable granular permission vocabulary.                                                                                         | Phase 4        |
| `user_roles`                  | Effective role grants/revocations with granting actor.                                                                         | Phase 4        |
| `role_permissions`            | Many-to-many role permission assignment.                                                                                       | Phase 4        |
| `sessions`                    | Hashed revocable sessions with ordered creation, last-seen, and expiry instants.                                               | Phase 4        |
| `audit_events`                | Append-only actor/action/entity change metadata. JSON content is future-service controlled and must be redacted appropriately. | Phases 4–10    |
| `aircraft_variants`           | Effective-dated reviewed aircraft vocabulary; unique code/start pair. Imported `variant` rows enter review state.              | Phases 3 and 5 |
| `qualifications`              | Effective-dated reviewed qualification vocabulary.                                                                             | Phase 5        |
| `syllabi`                     | Effective-dated reviewed syllabus vocabulary.                                                                                  | Phase 5        |
| `course_types`                | Effective-dated reviewed course-type vocabulary.                                                                               | Phase 5        |
| `approved_course_offerings`   | Reviewed effective combination of aircraft, qualification, syllabus, and course type.                                          | Phase 5        |

### Curriculum

| Table                        | Purpose and key invariants                                                                                                                                         | Future owner |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `bloom_levels`               | Ordered, version-ready Bloom-level vocabulary. Starts empty.                                                                                                       | Phase 5      |
| `bloom_verbs`                | Stable verbs belonging to Bloom levels. Starts empty.                                                                                                              | Phase 5      |
| `phases`                     | Stable Phase identity; retirement replaces deletion after reference. Starts empty.                                                                                 | Phase 5      |
| `phase_versions`             | Ordered, authored/reviewed, effective-dated Phase versions.                                                                                                        | Phase 5      |
| `tasks`                      | Stable Task identity. Starts empty.                                                                                                                                | Phase 5      |
| `task_versions`              | Ordered Task versions with required Phase-version parent.                                                                                                          | Phase 5      |
| `subtasks`                   | Stable Subtask identity. Starts empty.                                                                                                                             | Phase 5      |
| `subtask_versions`           | Ordered Subtask versions with required Task-version parent.                                                                                                        | Phase 5      |
| `elements`                   | Stable Element identity. Starts empty.                                                                                                                             | Phase 5      |
| `element_versions`           | Ordered Element versions with required Subtask-version parent.                                                                                                     | Phase 5      |
| `legacy_tpos`                | Faithful accepted `TPO` row with explicit source ID and import run.                                                                                                | Phase 3      |
| `legacy_spos`                | Faithful accepted `SPO` row with enforced TPO parent.                                                                                                              | Phase 3      |
| `legacy_eos`                 | Faithful accepted `EO` row with enforced SPO parent.                                                                                                               | Phase 3      |
| `legacy_curriculum_mappings` | Explicit reviewed legacy-to-future mapping; starts empty and never comes from inference. Polymorphic IDs must be validated by the Phase 5 service before approval. | Phase 5      |

### Questions and templates

| Table                              | Purpose and key invariants                                                                                                                                                                                                                 | Future owner   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `questions`                        | Stable question identity, retired rather than deleted after reference.                                                                                                                                                                     | Phase 6        |
| `question_versions`                | Immutable numbered content versions with five normalized types, draft/review/published/retired lifecycle, distinct reviewer, and generation state. Imported versions default to `blocked`; only a published version may become `eligible`. | Phases 3 and 6 |
| `question_prompts`                 | Ordered primary/alternate wording for one version; blank text rejected.                                                                                                                                                                    | Phase 6        |
| `question_options`                 | Ordered distinct options, correctness, and optional normalized semantic value.                                                                                                                                                             | Phase 6        |
| `question_aircraft_applicability`  | Many-to-many versioned aircraft applicability.                                                                                                                                                                                             | Phase 6        |
| `question_legacy_curriculum_links` | Faithful accepted TPO/SPO/EO question relationships. Import validation must prove the three IDs form one parent chain before insertion.                                                                                                    | Phase 3        |
| `question_future_curriculum_links` | Reviewed Subtask/optional Element applicability. An approved link is required by the future generation service before changing a question to eligible.                                                                                     | Phases 5–6     |
| `test_templates`                   | Stable template identity.                                                                                                                                                                                                                  | Phase 7        |
| `test_template_versions`           | Numbered authored/reviewed/effective template definition with positive length and duration.                                                                                                                                                | Phase 7        |
| `test_template_rules`              | Ordered positive exact-count rules against future Subtask versions.                                                                                                                                                                        | Phase 7        |
| `test_template_required_elements`  | Ordered mandatory future Element versions.                                                                                                                                                                                                 | Phase 7        |
| `legacy_template_sources`          | Separate staging record for one `test_model` or `testModel` source definition; source shape remains distinguishable and no lineage is inferred.                                                                                            | Phase 3        |
| `legacy_template_source_rules`     | Ordered extracted legacy curriculum/count/mandatory rows belonging to exactly one source definition.                                                                                                                                       | Phase 3        |

Cross-row validation of prompt and option cardinality for the five question types
cannot be expressed safely as a row `CHECK`; the importer and Phase 6 service
must enforce that published contract transactionally. Database checks still
enforce normalized type, nonblank/distinct options, positions, lifecycle, and
review boundaries.

### Future operational assessment

| Table                       | Purpose and key invariants                                                                                                                                             | Future owner |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `class_rosters`             | New class offering and assigned instructor. No legacy roster is imported.                                                                                              | Phase 8      |
| `roster_members`            | New roster membership using internal user identity.                                                                                                                    | Phase 8      |
| `exam_instances`            | Published immutable exam header, template version, secure code hash, encrypted seed, and algorithm version.                                                            | Phase 7      |
| `exam_questions`            | Ordered immutable prompt/type snapshot with optional retained source version.                                                                                          | Phase 7      |
| `exam_question_options`     | Ordered immutable option/key snapshot.                                                                                                                                 | Phase 7      |
| `exam_attempts`             | New attempt lifecycle, self-referencing retake chain, original/corrected score facts, seven-year retention marker, and hold. No legacy individual attempt is imported. | Phase 8      |
| `attempt_question_order`    | Per-attempt stable question order and mark state.                                                                                                                      | Phase 8      |
| `attempt_answers`           | Autosaved selected snapshot option and submission correctness.                                                                                                         | Phase 8      |
| `attempt_extensions`        | Append-only audited deadline extension.                                                                                                                                | Phase 8      |
| `attempt_recovery_grants`   | Hashed, expiring, single-use/revocable recovery authorization.                                                                                                         | Phase 8      |
| `question_invalidations`    | One append-only, attributable invalidation per snapshot question.                                                                                                      | Phase 8      |
| `attempt_correction_events` | Append-only denominator/correct-count/outcome change caused by an invalidation.                                                                                        | Phase 8      |
| `remediation_sessions`      | Instructor-opened correction-to-proficiency state without changing original score.                                                                                     | Phase 8      |
| `retraining_assignments`    | Instructor-linked retraining against an originating attempt.                                                                                                           | Phase 8      |
| `retention_holds`           | Generic attributable legal/administrative hold and release metadata.                                                                                                   | Phase 10     |
| `generated_exports`         | Audited short-lived export metadata; file content is external and expires within 24 hours by service policy.                                                           | Phases 9–10  |

### Import, quarantine, and historical facts

| Table                              | Purpose and key invariants                                                                                                                                                                                                                                           | Future owner   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `source_table_inventories`         | Exactly one safe count/disposition record per observed table/run; only the 15 approved table names are accepted.                                                                                                                                                     | Phase 3        |
| `source_target_mappings`           | Deterministic source-to-target coverage with unique source and target mappings.                                                                                                                                                                                      | Phase 3        |
| `quarantine_records`               | Restricted anomaly record with stable reason, review state, optional restricted payload, and no operational-content foreign key. Snapshot-only content requires `usedQuestions`, a null source ID, and a stripped payload, so generated-test linkage cannot persist. | Phase 3        |
| `historical_generation_aggregates` | Read-only, non-personal legacy generation facts. Published groups require at least five.                                                                                                                                                                             | Phases 3 and 9 |
| `historical_assessment_aggregates` | Read-only, non-personal assessment facts. Published groups require at least five.                                                                                                                                                                                    | Phases 3 and 9 |
| `historical_question_performance`  | Read-only asked/correct facts linked only to migrated question versions. Published groups require at least five observations.                                                                                                                                        | Phases 3 and 9 |

Historical aggregate tables have no foreign key to current rosters, exams,
attempts, answers, or users. Quarantine has no foreign key to active questions,
templates, curriculum, generation, or reports. A future approved reconciliation
creates a new canonical version and mapping; it never makes a quarantine row
directly operational.

## Source-table dispositions

| Source table         | Executable target disposition                                                                                                                     | Importer-facing key                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `TPO`                | Validate and insert `legacy_tpos`; bad rows quarantine.                                                                                           | source ID → TPO UUIDv5                              |
| `SPO`                | Validate parent and insert `legacy_spos`; missing parent quarantines.                                                                             | source ID → SPO UUIDv5                              |
| `EO`                 | Validate parent and insert `legacy_eos`; missing/mismatched parent quarantines.                                                                   | source ID → EO UUIDv5                               |
| `variant`            | Insert reviewed `aircraft_variants`.                                                                                                              | source ID → variant UUIDv5                          |
| `questions`          | Validate five-type contract; insert stable question/version/prompts/options/applicability/legacy links or quarantine. Generation remains blocked. | source ID → question and version UUIDv5             |
| `test_model`         | Insert a distinct `legacy_template_sources` wide record and extracted rules; never infer lineage.                                                 | source ID → source UUIDv5                           |
| `testModel`          | Insert a distinct row-oriented source and rules; never infer lineage.                                                                             | logical source row key → source/rule UUIDv5         |
| `createdTests`       | Produce only approved generation aggregates; exclude access, instructor, date-time, and generated IDs.                                            | aggregate fingerprint only                          |
| `usedQuestions`      | Produce safe counts; unique snapshot-only content may enter restricted quarantine after all linkage removal.                                      | migrated question mapping or quarantine fingerprint |
| `studentTestRecords` | Produce only approved assessment aggregates and suppression facts.                                                                                | aggregate fingerprint only                          |
| `testResults`        | Produce only approved question-performance aggregates using reliable question mappings.                                                           | question mapping + aggregate fingerprint            |
| `instructors`        | Exclude all rows and record counts only.                                                                                                          | none                                                |
| `logins`             | Exclude all rows and record counts only.                                                                                                          | none                                                |
| `stamp`              | Exclude all rows and record counts only.                                                                                                          | none                                                |
| `test_info`          | Exclude all rows and record counts only.                                                                                                          | none                                                |

Every run must create all 15 `source_table_inventories` rows even when a source
table is empty. The importer must not insert rows into future hierarchy,
identity, roster, operational exam, attempt, answer, or report tables.

## Quarantine taxonomy

The schema and exported `QUARANTINE_REASON_CODES` constant define these stable
codes:

| Code                               | Use                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `missing_parent`                   | Required source parent does not exist.                                                                  |
| `curriculum_parent_mismatch`       | Individually present curriculum IDs do not form the recorded chain.                                     |
| `missing_or_invalid_variant`       | Variant is absent, a sentinel, or invalid.                                                              |
| `malformed_question_shape`         | Prompt/options/correctness violate a five-type contract.                                                |
| `duplicate_candidate`              | Content is a deterministic duplicate candidate requiring review.                                        |
| `zero_or_sentinel_relationship`    | A zero/sentinel appears where a relationship is required.                                               |
| `ambiguous_template_source`        | Template definition cannot be mapped without guessing.                                                  |
| `unreliable_historical_join`       | Aggregate dimension would require an unreliable or inferred join.                                       |
| `restricted_snapshot_only_content` | Unique recoverable content exists only in a generated snapshot; all historical linkage must be removed. |
| `aggregate_group_suppression`      | A group smaller than five was suppressed or safely rolled up.                                           |
| `encoding_error`                   | Source bytes cannot be validated after deliberate latin1 decoding.                                      |
| `unknown_question_type`            | Source type does not normalize to one of five approved types.                                           |

`approved_for_future_reconciliation` is not publication. It only records a
future reviewer decision; a separately authorized transaction must create a new
canonical version and mapping. New reason codes are additive schema-contract
changes owned by the schema owner. Existing meanings may not be broadened or
renamed.

## Delete, immutability, and retention

- Stable identities and referenced versions use restrictive foreign keys.
  Referenced curriculum, questions, templates, snapshots, and attempts are
  retired or retained, not hard-deleted.
- Cascades are limited to records wholly owned by a safely deletable draft or a
  retention-approved attempt, such as prompt/options, role joins, question order,
  and answers. A retained snapshot reference prevents deletion of its source
  version.
- Exam snapshots, invalidations, correction events, and their attribution are
  immutable service records. The schema supplies restrictive references; later
  services must expose no general update/delete operation.
- New identity-linked attempts, answers, snapshots, corrections, and associated
  access data retain a seven-year marker from completion unless a hold applies.
  Security/access audit events use a one-year policy. Generated export artifacts
  expire within 24 hours. Phase 10 owns enforcement and deletion transactions.
- Historical aggregates are permanent read-only non-identifying facts and never
  join into current attempts. Quarantine retention follows protected-evidence
  review policy and cannot be used by operational queries.
- Import runs referenced by imported rows or mappings are restricted from
  deletion, preserving provenance. Inventory rows alone cascade with a deleted
  abandoned run.

## Extension rules

Future phases may add service-owned tables or additive columns through a new
reviewed migration. They may not repurpose source IDs, make quarantine
operational, join historical aggregates to people/attempts, weaken the five-
member publication floor, or infer legacy-to-future curriculum/template lineage.
Breaking changes return to the schema owner and require an updated contract,
migration, snapshot, tests, and importer/reconciliation coordination.
