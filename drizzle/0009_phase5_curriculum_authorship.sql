PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	CONSTRAINT "element_versions_reviewer_ck" CHECK(("__new_element_versions"."reviewed_by_user_id" is null and "__new_element_versions"."reviewed_at" is null) or ("__new_element_versions"."reviewed_by_user_id" is not null and "__new_element_versions"."reviewed_at" is not null and "__new_element_versions"."reviewed_by_user_id" <> "__new_element_versions"."authored_by_user_id")),
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
	CONSTRAINT "phase_versions_reviewer_ck" CHECK(("__new_phase_versions"."reviewed_by_user_id" is null and "__new_phase_versions"."reviewed_at" is null) or ("__new_phase_versions"."reviewed_by_user_id" is not null and "__new_phase_versions"."reviewed_at" is not null and "__new_phase_versions"."reviewed_by_user_id" <> "__new_phase_versions"."authored_by_user_id")),
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
	CONSTRAINT "subtask_versions_reviewer_ck" CHECK(("__new_subtask_versions"."reviewed_by_user_id" is null and "__new_subtask_versions"."reviewed_at" is null) or ("__new_subtask_versions"."reviewed_by_user_id" is not null and "__new_subtask_versions"."reviewed_at" is not null and "__new_subtask_versions"."reviewed_by_user_id" <> "__new_subtask_versions"."authored_by_user_id")),
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
	CONSTRAINT "task_versions_reviewer_ck" CHECK(("__new_task_versions"."reviewed_by_user_id" is null and "__new_task_versions"."reviewed_at" is null) or ("__new_task_versions"."reviewed_by_user_id" is not null and "__new_task_versions"."reviewed_at" is not null and "__new_task_versions"."reviewed_by_user_id" <> "__new_task_versions"."authored_by_user_id")),
	CONSTRAINT "task_versions_publication_ck" CHECK("__new_task_versions"."status" not in ('published', 'retired') or ("__new_task_versions"."reviewed_by_user_id" is not null and "__new_task_versions"."reviewed_at" is not null and "__new_task_versions"."published_at" is not null and "__new_task_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_task_versions`("id", "task_id", "phase_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id") SELECT "id", "task_id", "phase_version_id", "version", "name", "description", "position", "status", "effective_from", "effective_to", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "published_at", "retired_at", "bloom_verb_id" FROM `task_versions`;--> statement-breakpoint
DROP TABLE `task_versions`;--> statement-breakpoint
ALTER TABLE `__new_task_versions` RENAME TO `task_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_identity_version_uq` ON `task_versions` (`task_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_parent_position_from_uq` ON `task_versions` (`phase_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_unpublished_parent_position_uq` ON `task_versions` (`phase_version_id`,`position`) WHERE "task_versions"."status" in ('draft', 'review');--> statement-breakpoint
CREATE INDEX `task_versions_parent_idx` ON `task_versions` (`phase_version_id`,`status`);