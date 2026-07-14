PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TRIGGER `published_template_content_immutable`;--> statement-breakpoint
DROP TRIGGER `published_template_rules_no_insert`;--> statement-breakpoint
DROP TRIGGER `published_template_rules_no_update`;--> statement-breakpoint
DROP TRIGGER `published_template_rules_no_delete`;--> statement-breakpoint
DROP TRIGGER `published_template_elements_no_insert`;--> statement-breakpoint
DROP TRIGGER `published_template_elements_no_update`;--> statement-breakpoint
DROP TRIGGER `published_template_elements_no_delete`;--> statement-breakpoint
CREATE TABLE `__new_element_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`element_id` text NOT NULL,
	`subtask_version_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`authored_by_user_id` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	FOREIGN KEY (`element_id`) REFERENCES `elements`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "element_versions_values_ck" CHECK("__new_element_versions"."version" > 0 and "__new_element_versions"."position" >= 0),
	CONSTRAINT "element_versions_status_ck" CHECK("__new_element_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "element_versions_dates_ck" CHECK("__new_element_versions"."effective_to" is null or "__new_element_versions"."effective_from" is null or "__new_element_versions"."effective_to" > "__new_element_versions"."effective_from"),
	CONSTRAINT "element_versions_reviewer_ck" CHECK(("__new_element_versions"."reviewed_by_user_id" is null and "__new_element_versions"."reviewed_at" is null) or ("__new_element_versions"."reviewed_by_user_id" is not null and "__new_element_versions"."reviewed_at" is not null)),
	CONSTRAINT "element_versions_publication_ck" CHECK("__new_element_versions"."status" not in ('published', 'retired') or ("__new_element_versions"."reviewed_by_user_id" is not null and "__new_element_versions"."reviewed_at" is not null and "__new_element_versions"."published_at" is not null and "__new_element_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_element_versions`("id", "element_id", "subtask_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at") SELECT "id", "element_id", "subtask_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at" FROM `element_versions`;--> statement-breakpoint
DROP TABLE `element_versions`;--> statement-breakpoint
ALTER TABLE `__new_element_versions` RENAME TO `element_versions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `element_versions_identity_version_uq` ON `element_versions` (`element_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `element_versions_parent_position_from_uq` ON `element_versions` (`subtask_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE UNIQUE INDEX `element_versions_unpublished_parent_position_uq` ON `element_versions` (`subtask_version_id`,`position`) WHERE "element_versions"."status" in ('draft', 'review');--> statement-breakpoint
CREATE INDEX `element_versions_parent_idx` ON `element_versions` (`subtask_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_phase_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`phase_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`authored_by_user_id` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "phase_versions_values_ck" CHECK("__new_phase_versions"."version" > 0 and "__new_phase_versions"."position" >= 0),
	CONSTRAINT "phase_versions_status_ck" CHECK("__new_phase_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "phase_versions_dates_ck" CHECK("__new_phase_versions"."effective_to" is null or "__new_phase_versions"."effective_from" is null or "__new_phase_versions"."effective_to" > "__new_phase_versions"."effective_from"),
	CONSTRAINT "phase_versions_reviewer_ck" CHECK(("__new_phase_versions"."reviewed_by_user_id" is null and "__new_phase_versions"."reviewed_at" is null) or ("__new_phase_versions"."reviewed_by_user_id" is not null and "__new_phase_versions"."reviewed_at" is not null)),
	CONSTRAINT "phase_versions_publication_ck" CHECK("__new_phase_versions"."status" not in ('published', 'retired') or ("__new_phase_versions"."reviewed_by_user_id" is not null and "__new_phase_versions"."reviewed_at" is not null and "__new_phase_versions"."published_at" is not null and "__new_phase_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_phase_versions`("id", "phase_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id") SELECT "id", "phase_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id" FROM `phase_versions`;--> statement-breakpoint
DROP TABLE `phase_versions`;--> statement-breakpoint
ALTER TABLE `__new_phase_versions` RENAME TO `phase_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `phase_versions_identity_version_uq` ON `phase_versions` (`phase_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `phase_versions_position_from_uq` ON `phase_versions` (`position`,`effective_from`);--> statement-breakpoint
CREATE UNIQUE INDEX `phase_versions_unpublished_position_uq` ON `phase_versions` (`position`) WHERE "phase_versions"."status" in ('draft', 'review');--> statement-breakpoint
CREATE INDEX `phase_versions_lifecycle_idx` ON `phase_versions` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `__new_subtask_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`subtask_id` text NOT NULL,
	`task_version_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`authored_by_user_id` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`subtask_id`) REFERENCES `subtasks`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`task_version_id`) REFERENCES `task_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "subtask_versions_values_ck" CHECK("__new_subtask_versions"."version" > 0 and "__new_subtask_versions"."position" >= 0),
	CONSTRAINT "subtask_versions_status_ck" CHECK("__new_subtask_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "subtask_versions_dates_ck" CHECK("__new_subtask_versions"."effective_to" is null or "__new_subtask_versions"."effective_from" is null or "__new_subtask_versions"."effective_to" > "__new_subtask_versions"."effective_from"),
	CONSTRAINT "subtask_versions_reviewer_ck" CHECK(("__new_subtask_versions"."reviewed_by_user_id" is null and "__new_subtask_versions"."reviewed_at" is null) or ("__new_subtask_versions"."reviewed_by_user_id" is not null and "__new_subtask_versions"."reviewed_at" is not null)),
	CONSTRAINT "subtask_versions_publication_ck" CHECK("__new_subtask_versions"."status" not in ('published', 'retired') or ("__new_subtask_versions"."reviewed_by_user_id" is not null and "__new_subtask_versions"."reviewed_at" is not null and "__new_subtask_versions"."published_at" is not null and "__new_subtask_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_subtask_versions`("id", "subtask_id", "task_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id") SELECT "id", "subtask_id", "task_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id" FROM `subtask_versions`;--> statement-breakpoint
DROP TABLE `subtask_versions`;--> statement-breakpoint
ALTER TABLE `__new_subtask_versions` RENAME TO `subtask_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `subtask_versions_identity_version_uq` ON `subtask_versions` (`subtask_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `subtask_versions_parent_position_from_uq` ON `subtask_versions` (`task_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE UNIQUE INDEX `subtask_versions_unpublished_parent_position_uq` ON `subtask_versions` (`task_version_id`,`position`) WHERE "subtask_versions"."status" in ('draft', 'review');--> statement-breakpoint
CREATE INDEX `subtask_versions_parent_idx` ON `subtask_versions` (`task_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_task_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`phase_version_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`authored_by_user_id` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`phase_version_id`) REFERENCES `phase_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "task_versions_values_ck" CHECK("__new_task_versions"."version" > 0 and "__new_task_versions"."position" >= 0),
	CONSTRAINT "task_versions_status_ck" CHECK("__new_task_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "task_versions_dates_ck" CHECK("__new_task_versions"."effective_to" is null or "__new_task_versions"."effective_from" is null or "__new_task_versions"."effective_to" > "__new_task_versions"."effective_from"),
	CONSTRAINT "task_versions_reviewer_ck" CHECK(("__new_task_versions"."reviewed_by_user_id" is null and "__new_task_versions"."reviewed_at" is null) or ("__new_task_versions"."reviewed_by_user_id" is not null and "__new_task_versions"."reviewed_at" is not null)),
	CONSTRAINT "task_versions_publication_ck" CHECK("__new_task_versions"."status" not in ('published', 'retired') or ("__new_task_versions"."reviewed_by_user_id" is not null and "__new_task_versions"."reviewed_at" is not null and "__new_task_versions"."published_at" is not null and "__new_task_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_task_versions`("id", "task_id", "phase_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id") SELECT "id", "task_id", "phase_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id" FROM `task_versions`;--> statement-breakpoint
DROP TABLE `task_versions`;--> statement-breakpoint
ALTER TABLE `__new_task_versions` RENAME TO `task_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_identity_version_uq` ON `task_versions` (`task_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_parent_position_from_uq` ON `task_versions` (`phase_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_unpublished_parent_position_uq` ON `task_versions` (`phase_version_id`,`position`) WHERE "task_versions"."status" in ('draft', 'review');--> statement-breakpoint
CREATE INDEX `task_versions_parent_idx` ON `task_versions` (`phase_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_question_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`version` integer NOT NULL,
	`question_type` text NOT NULL,
	`lifecycle` text DEFAULT 'draft' NOT NULL,
	`generation_status` text DEFAULT 'blocked' NOT NULL,
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`submitted_at` text,
	`published_at` text,
	`effective_from` text,
	`effective_to` text,
	`retired_at` text,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "question_versions_version_ck" CHECK("__new_question_versions"."version" > 0),
	CONSTRAINT "question_versions_type_ck" CHECK("__new_question_versions"."question_type" in ('true_false', 'single_choice', 'two_correct_compound', 'all_correct', 'none_correct')),
	CONSTRAINT "question_versions_lifecycle_ck" CHECK("__new_question_versions"."lifecycle" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "question_versions_generation_ck" CHECK("__new_question_versions"."generation_status" in ('blocked', 'eligible') and ("__new_question_versions"."generation_status" = 'blocked' or "__new_question_versions"."lifecycle" = 'published')),
	CONSTRAINT "question_versions_dates_ck" CHECK("__new_question_versions"."effective_to" is null or "__new_question_versions"."effective_from" is null or "__new_question_versions"."effective_to" > "__new_question_versions"."effective_from"),
	CONSTRAINT "question_versions_reviewer_ck" CHECK(("__new_question_versions"."reviewed_by_user_id" is null and "__new_question_versions"."reviewed_at" is null) or ("__new_question_versions"."reviewed_by_user_id" is not null and "__new_question_versions"."reviewed_at" is not null)),
	CONSTRAINT "question_versions_publication_ck" CHECK("__new_question_versions"."lifecycle" not in ('published', 'retired') or ("__new_question_versions"."authored_by_user_id" is not null and "__new_question_versions"."reviewed_by_user_id" is not null and "__new_question_versions"."reviewed_at" is not null and "__new_question_versions"."published_at" is not null and "__new_question_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_question_versions`("id", "question_id", "version", "question_type", "lifecycle", "generation_status", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at") SELECT "id", "question_id", "version", "question_type", "lifecycle", "generation_status", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at" FROM `question_versions`;--> statement-breakpoint
DROP TABLE `question_versions`;--> statement-breakpoint
ALTER TABLE `__new_question_versions` RENAME TO `question_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `question_versions_identity_version_uq` ON `question_versions` (`question_id`,`version`);--> statement-breakpoint
CREATE INDEX `question_versions_lifecycle_idx` ON `question_versions` (`lifecycle`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `question_versions_filter_idx` ON `question_versions` (`question_type`,`lifecycle`,`generation_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `question_versions_activity_idx` ON `question_versions` (`created_at`,`id`);--> statement-breakpoint
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
	CONSTRAINT "test_template_versions_reviewer_ck" CHECK(("__new_test_template_versions"."reviewed_by_user_id" is null and "__new_test_template_versions"."reviewed_at" is null) or ("__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."authored_by_user_id" is not null)),
	CONSTRAINT "test_template_versions_lifecycle_dates_ck" CHECK(("__new_test_template_versions"."lifecycle" = 'draft' and "__new_test_template_versions"."published_at" is null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'review' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."published_at" is null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'published' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."published_at" is not null and "__new_test_template_versions"."effective_from" is not null and "__new_test_template_versions"."retired_at" is null) or ("__new_test_template_versions"."lifecycle" = 'retired' and "__new_test_template_versions"."submitted_at" is not null and "__new_test_template_versions"."reviewed_by_user_id" is not null and "__new_test_template_versions"."reviewed_at" is not null and "__new_test_template_versions"."published_at" is not null and "__new_test_template_versions"."effective_from" is not null and "__new_test_template_versions"."retired_at" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_test_template_versions`("id", "test_template_id", "version", "name", "aircraft_variant_id", "course_type_id", "configured_length", "allotted_minutes", "lifecycle", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at") SELECT "id", "test_template_id", "version", "name", "aircraft_variant_id", "course_type_id", "configured_length", "allotted_minutes", "lifecycle", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at" FROM `test_template_versions`;--> statement-breakpoint
DROP TABLE `test_template_versions`;--> statement-breakpoint
ALTER TABLE `__new_test_template_versions` RENAME TO `test_template_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_versions_identity_version_uq` ON `test_template_versions` (`test_template_id`,`version`);--> statement-breakpoint
CREATE INDEX `test_template_versions_effective_idx` ON `test_template_versions` (`lifecycle`,`aircraft_variant_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `test_template_versions_aircraft_idx` ON `test_template_versions` (`aircraft_variant_id`,`lifecycle`);
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
