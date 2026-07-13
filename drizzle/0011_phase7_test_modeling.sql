PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_test_template_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`test_template_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`aircraft_variant_id` text NOT NULL,
	`course_type_id` text,
	`configured_length` integer NOT NULL,
	`allotted_minutes` integer NOT NULL,
	`lifecycle` text DEFAULT 'draft' NOT NULL,
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`submitted_at` text,
	`published_at` text,
	`effective_from` text,
	`effective_to` text,
	`retired_at` text,
	FOREIGN KEY (`test_template_id`) REFERENCES `test_templates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`aircraft_variant_id`) REFERENCES `aircraft_variants`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`course_type_id`) REFERENCES `course_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "test_template_versions_values_ck" CHECK("__new_test_template_versions"."version" > 0 and "__new_test_template_versions"."configured_length" > 0 and "__new_test_template_versions"."allotted_minutes" > 0),
	CONSTRAINT "test_template_versions_lifecycle_ck" CHECK("__new_test_template_versions"."lifecycle" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "test_template_versions_dates_ck" CHECK("__new_test_template_versions"."effective_to" is null or "__new_test_template_versions"."effective_from" is null or "__new_test_template_versions"."effective_to" > "__new_test_template_versions"."effective_from"),
	CONSTRAINT "test_template_versions_reviewer_ck" CHECK(("__new_test_template_versions"."reviewed_by_user_id" is null and "__new_test_template_versions"."reviewed_at" is null) or ("__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."authored_by_user_id" is not null and "__new_test_template_versions"."reviewed_by_user_id" <> "__new_test_template_versions"."authored_by_user_id")),
	CONSTRAINT "test_template_versions_lifecycle_dates_ck" CHECK(("__new_test_template_versions"."lifecycle" = 'draft' and "__new_test_template_versions"."published_at" is null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'review' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."published_at" is null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'published' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."published_at" is not null and "__new_test_template_versions"."effective_from" is not null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'retired' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."published_at" is not null and "__new_test_template_versions"."effective_from" is not null and "__new_test_template_versions"."retired_at" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_test_template_versions`("id", "test_template_id", "version", "name", "aircraft_variant_id", "course_type_id", "configured_length", "allotted_minutes", "lifecycle", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at") SELECT "id", "test_template_id", "version", "name", "aircraft_variant_id", "course_type_id", "configured_length", "allotted_minutes", "lifecycle", "authored_by_user_id", "reviewed_by_user_id", CASE WHEN "reviewed_by_user_id" IS NOT NULL THEN coalesce("published_at", "created_at") ELSE NULL END, "created_at", CASE WHEN "lifecycle" <> 'draft' THEN "created_at" ELSE NULL END, "published_at", "effective_from", "effective_to", "retired_at" FROM `test_template_versions`;--> statement-breakpoint
DROP TABLE `test_template_versions`;--> statement-breakpoint
ALTER TABLE `__new_test_template_versions` RENAME TO `test_template_versions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_versions_identity_version_uq` ON `test_template_versions` (`test_template_id`,`version`);--> statement-breakpoint
CREATE INDEX `test_template_versions_effective_idx` ON `test_template_versions` (`lifecycle`,`aircraft_variant_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `test_template_versions_aircraft_idx` ON `test_template_versions` (`aircraft_variant_id`,`lifecycle`);--> statement-breakpoint
CREATE TABLE `__new_exam_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`test_template_version_id` text NOT NULL,
	`class_roster_id` text NOT NULL,
	`published_by_user_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`access_code_hash` text,
	`random_seed_ciphertext` text NOT NULL,
	`random_seed_envelope_version` text NOT NULL,
	`random_seed_key_id` text NOT NULL,
	`random_algorithm_version` text NOT NULL,
	`access_code_protection_version` text,
	`published_at` text,
	`start_closes_at` text,
	`created_at` text NOT NULL,
	`retention_until` text,
	FOREIGN KEY (`test_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`class_roster_id`) REFERENCES `class_rosters`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`published_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_instances_status_ck" CHECK("__new_exam_instances"."status" in ('draft', 'published', 'closed', 'retired')),
	CONSTRAINT "exam_instances_publication_ck" CHECK(("__new_exam_instances"."status" = 'draft') or ("__new_exam_instances"."published_at" is not null and "__new_exam_instances"."start_closes_at" is not null and "__new_exam_instances"."start_closes_at" > "__new_exam_instances"."published_at" and "__new_exam_instances"."access_code_hash" is not null and "__new_exam_instances"."access_code_protection_version" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_exam_instances`("id", "test_template_version_id", "class_roster_id", "published_by_user_id", "status", "access_code_hash", "random_seed_ciphertext", "random_seed_envelope_version", "random_seed_key_id", "random_algorithm_version", "access_code_protection_version", "published_at", "start_closes_at", "created_at", "retention_until") SELECT "id", "test_template_version_id", "class_roster_id", "published_by_user_id", "status", "access_code_hash", "random_seed_ciphertext", 'legacy-seed-envelope-v0', 'legacy-unavailable', "random_algorithm_version", CASE WHEN "access_code_hash" IS NOT NULL THEN 'legacy-code-protection-v0' ELSE NULL END, "published_at", "start_closes_at", "created_at", "retention_until" FROM `exam_instances`;--> statement-breakpoint
DROP TABLE `exam_instances`;--> statement-breakpoint
ALTER TABLE `__new_exam_instances` RENAME TO `exam_instances`;--> statement-breakpoint
CREATE INDEX `exam_instances_roster_status_idx` ON `exam_instances` (`class_roster_id`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `exam_instances_retention_idx` ON `exam_instances` (`retention_until`);--> statement-breakpoint
CREATE INDEX `exam_instances_template_idx` ON `exam_instances` (`test_template_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_test_template_required_elements` (
	`id` text PRIMARY KEY NOT NULL,
	`test_template_version_id` text NOT NULL,
	`element_version_id` text NOT NULL,
	`subtask_version_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`test_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`element_version_id`) REFERENCES `element_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "test_template_required_elements_position_ck" CHECK("__new_test_template_required_elements"."position" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_test_template_required_elements`("id", "test_template_version_id", "element_version_id", "subtask_version_id", "position") SELECT "test_template_version_id" || ':' || "element_version_id", "test_template_version_id", "element_version_id", (SELECT "subtask_version_id" FROM "element_versions" WHERE "id" = "element_version_id"), "position" FROM `test_template_required_elements`;--> statement-breakpoint
DROP TABLE `test_template_required_elements`;--> statement-breakpoint
ALTER TABLE `__new_test_template_required_elements` RENAME TO `test_template_required_elements`;--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_required_elements_element_uq` ON `test_template_required_elements` (`test_template_version_id`,`element_version_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_required_elements_position_uq` ON `test_template_required_elements` (`test_template_version_id`,`position`);--> statement-breakpoint
CREATE INDEX `test_template_required_elements_element_idx` ON `test_template_required_elements` (`element_version_id`);--> statement-breakpoint
CREATE INDEX `test_template_required_elements_subtask_idx` ON `test_template_required_elements` (`subtask_version_id`);--> statement-breakpoint
CREATE TABLE `__new_legacy_template_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`source_table` text NOT NULL,
	`source_id` text NOT NULL,
	`logical_name` text,
	`aircraft_source_id` text,
	`configured_length` integer,
	`source_shape_json` text NOT NULL,
	`reconciliation_state` text DEFAULT 'unreviewed' NOT NULL,
	`mapped_template_version_id` text,
	`adopted_by_user_id` text,
	`adopted_at` text,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`mapped_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`adopted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "legacy_template_sources_table_ck" CHECK("__new_legacy_template_sources"."source_table" in ('test_model', 'testModel')),
	CONSTRAINT "legacy_template_sources_state_ck" CHECK("__new_legacy_template_sources"."reconciliation_state" in ('unreviewed', 'mapped', 'ambiguous', 'retired')),
	CONSTRAINT "legacy_template_sources_length_ck" CHECK("__new_legacy_template_sources"."configured_length" is null or "__new_legacy_template_sources"."configured_length" > 0),
	CONSTRAINT "legacy_template_sources_adoption_ck" CHECK(("__new_legacy_template_sources"."reconciliation_state" = 'mapped' and "__new_legacy_template_sources"."mapped_template_version_id" is not null and "__new_legacy_template_sources"."adopted_by_user_id" is not null and "__new_legacy_template_sources"."adopted_at" is not null) or ("__new_legacy_template_sources"."reconciliation_state" <> 'mapped' and "__new_legacy_template_sources"."mapped_template_version_id" is null and "__new_legacy_template_sources"."adopted_by_user_id" is null and "__new_legacy_template_sources"."adopted_at" is null))
);
--> statement-breakpoint
INSERT INTO `__new_legacy_template_sources`("id", "import_run_id", "source_table", "source_id", "logical_name", "aircraft_source_id", "configured_length", "source_shape_json", "reconciliation_state", "mapped_template_version_id", "adopted_by_user_id", "adopted_at") SELECT "id", "import_run_id", "source_table", "source_id", "logical_name", "aircraft_source_id", "configured_length", "source_shape_json", CASE WHEN "reconciliation_state" = 'mapped' THEN 'unreviewed' ELSE "reconciliation_state" END, NULL, NULL, NULL FROM `legacy_template_sources`;--> statement-breakpoint
DROP TABLE `legacy_template_sources`;--> statement-breakpoint
ALTER TABLE `__new_legacy_template_sources` RENAME TO `legacy_template_sources`;--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_template_sources_source_uq` ON `legacy_template_sources` (`import_run_id`,`source_table`,`source_id`);--> statement-breakpoint
CREATE INDEX `legacy_template_sources_reconciliation_idx` ON `legacy_template_sources` (`source_table`,`reconciliation_state`);--> statement-breakpoint
CREATE INDEX `legacy_template_sources_mapped_idx` ON `legacy_template_sources` (`mapped_template_version_id`);--> statement-breakpoint
ALTER TABLE `exam_questions` ADD `test_template_rule_id` text NOT NULL REFERENCES test_template_rules(id);--> statement-breakpoint
ALTER TABLE `exam_questions` ADD `mandatory_element_version_id` text REFERENCES element_versions(id);
--> statement-breakpoint
CREATE TRIGGER `exam_questions_snapshot_immutable`
BEFORE UPDATE OF `source_question_version_id`, `test_template_rule_id`, `mandatory_element_version_id`, `position`, `question_type`, `prompt_text` ON `exam_questions`
BEGIN SELECT RAISE(ABORT, 'exam question snapshot is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `exam_question_options_snapshot_immutable`
BEFORE UPDATE OF `exam_question_id`, `source_question_option_id`, `position`, `option_text`, `is_correct` ON `exam_question_options`
BEGIN SELECT RAISE(ABORT, 'exam option snapshot is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `exam_questions_snapshot_no_delete`
BEFORE DELETE ON `exam_questions`
BEGIN SELECT RAISE(ABORT, 'exam question snapshot is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `exam_question_options_snapshot_no_delete`
BEFORE DELETE ON `exam_question_options`
BEGIN SELECT RAISE(ABORT, 'exam option snapshot is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_content_immutable`
BEFORE UPDATE OF `name`, `aircraft_variant_id`, `course_type_id`, `configured_length`, `allotted_minutes`, `authored_by_user_id`, `reviewed_by_user_id`, `reviewed_at`, `submitted_at`, `published_at`, `effective_from` ON `test_template_versions`
WHEN OLD.lifecycle IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template version is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_rules_no_insert`
BEFORE INSERT ON `test_template_rules`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = NEW.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template rules are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_rules_no_update`
BEFORE UPDATE ON `test_template_rules`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = OLD.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template rules are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_rules_no_delete`
BEFORE DELETE ON `test_template_rules`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = OLD.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template rules are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_elements_no_insert`
BEFORE INSERT ON `test_template_required_elements`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = NEW.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template elements are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_elements_no_update`
BEFORE UPDATE ON `test_template_required_elements`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = OLD.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template elements are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `published_template_elements_no_delete`
BEFORE DELETE ON `test_template_required_elements`
WHEN (SELECT lifecycle FROM test_template_versions WHERE id = OLD.test_template_version_id) IN ('published', 'retired')
BEGIN SELECT RAISE(ABORT, 'published template elements are immutable'); END;
