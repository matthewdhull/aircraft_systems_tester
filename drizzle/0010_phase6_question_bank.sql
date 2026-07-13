PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_question_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`question_version_id` text NOT NULL,
	`position` integer NOT NULL,
	`prompt_text` text NOT NULL,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "question_prompts_position_ck" CHECK("__new_question_prompts"."position" >= 0),
	CONSTRAINT "question_prompts_text_ck" CHECK(length(trim("__new_question_prompts"."prompt_text")) between 1 and 4000)
);
--> statement-breakpoint
INSERT INTO `__new_question_prompts`("id", "question_version_id", "position", "prompt_text") SELECT "id", "question_version_id", "position", "prompt_text" FROM `question_prompts`;--> statement-breakpoint
DROP TABLE `question_prompts`;--> statement-breakpoint
ALTER TABLE `__new_question_prompts` RENAME TO `question_prompts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `question_prompts_version_position_uq` ON `question_prompts` (`question_version_id`,`position`);--> statement-breakpoint
CREATE INDEX `question_prompts_search_idx` ON `question_prompts` (`prompt_text`,`question_version_id`);--> statement-breakpoint
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
	CONSTRAINT "question_versions_reviewer_ck" CHECK(("__new_question_versions"."reviewed_by_user_id" is null and "__new_question_versions"."reviewed_at" is null) or ("__new_question_versions"."reviewed_by_user_id" is not null and "__new_question_versions"."reviewed_at" is not null and ("__new_question_versions"."authored_by_user_id" is null or "__new_question_versions"."reviewed_by_user_id" <> "__new_question_versions"."authored_by_user_id"))),
	CONSTRAINT "question_versions_publication_ck" CHECK("__new_question_versions"."lifecycle" not in ('published', 'retired') or ("__new_question_versions"."authored_by_user_id" is not null and "__new_question_versions"."reviewed_by_user_id" is not null and "__new_question_versions"."reviewed_at" is not null and "__new_question_versions"."published_at" is not null and "__new_question_versions"."effective_from" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_question_versions`("id", "question_id", "version", "question_type", "lifecycle", "generation_status", "authored_by_user_id", "reviewed_by_user_id", "reviewed_at", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at") SELECT "id", "question_id", "version", "question_type", "lifecycle", "generation_status", "authored_by_user_id", "reviewed_by_user_id", NULL, "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at" FROM `question_versions`;--> statement-breakpoint
DROP TABLE `question_versions`;--> statement-breakpoint
ALTER TABLE `__new_question_versions` RENAME TO `question_versions`;--> statement-breakpoint
CREATE UNIQUE INDEX `question_versions_identity_version_uq` ON `question_versions` (`question_id`,`version`);--> statement-breakpoint
CREATE INDEX `question_versions_lifecycle_idx` ON `question_versions` (`lifecycle`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `question_versions_filter_idx` ON `question_versions` (`question_type`,`lifecycle`,`generation_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `question_versions_activity_idx` ON `question_versions` (`created_at`,`id`);--> statement-breakpoint
CREATE TABLE `__new_question_future_curriculum_links` (
	`question_version_id` text NOT NULL,
	`subtask_version_id` text NOT NULL,
	`element_version_id` text,
	`mapping_status` text DEFAULT 'review' NOT NULL,
	`proposed_by_user_id` text NOT NULL,
	`proposed_at` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	PRIMARY KEY(`question_version_id`, `subtask_version_id`),
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`element_version_id`) REFERENCES `element_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`proposed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "question_future_curriculum_status_ck" CHECK("__new_question_future_curriculum_links"."mapping_status" in ('review', 'approved', 'retired')),
	CONSTRAINT "question_future_curriculum_review_ck" CHECK(("__new_question_future_curriculum_links"."mapping_status" = 'review' and "__new_question_future_curriculum_links"."reviewed_at" is null and "__new_question_future_curriculum_links"."reviewed_by_user_id" is null) or ("__new_question_future_curriculum_links"."mapping_status" <> 'review' and "__new_question_future_curriculum_links"."reviewed_at" is not null and "__new_question_future_curriculum_links"."reviewed_by_user_id" is not null and "__new_question_future_curriculum_links"."reviewed_by_user_id" <> "__new_question_future_curriculum_links"."proposed_by_user_id"))
);
--> statement-breakpoint
INSERT INTO `__new_question_future_curriculum_links`("question_version_id", "subtask_version_id", "element_version_id", "mapping_status", "proposed_by_user_id", "proposed_at", "reviewed_by_user_id", "reviewed_at") SELECT "question_version_id", "subtask_version_id", "element_version_id", "mapping_status", NULL, NULL, NULL, NULL FROM `question_future_curriculum_links`;--> statement-breakpoint
DROP TABLE `question_future_curriculum_links`;--> statement-breakpoint
ALTER TABLE `__new_question_future_curriculum_links` RENAME TO `question_future_curriculum_links`;--> statement-breakpoint
CREATE INDEX `question_future_curriculum_element_idx` ON `question_future_curriculum_links` (`element_version_id`);--> statement-breakpoint
CREATE INDEX `question_future_curriculum_subtask_idx` ON `question_future_curriculum_links` (`subtask_version_id`);
