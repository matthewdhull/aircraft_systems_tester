PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_question_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`version` integer NOT NULL,
	`question_type` text NOT NULL,
	`lifecycle` text DEFAULT 'draft' NOT NULL,
	`generation_status` text DEFAULT 'blocked' NOT NULL,
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
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
	CONSTRAINT "question_versions_reviewer_ck" CHECK("__new_question_versions"."reviewed_by_user_id" is null or "__new_question_versions"."reviewed_by_user_id" <> "__new_question_versions"."authored_by_user_id")
);
--> statement-breakpoint
INSERT INTO `__new_question_versions`("id", "question_id", "version", "question_type", "lifecycle", "generation_status", "authored_by_user_id", "reviewed_by_user_id", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at") SELECT "id", "question_id", "version", "question_type", "lifecycle", 'blocked', "authored_by_user_id", "reviewed_by_user_id", "created_at", "submitted_at", "published_at", "effective_from", "effective_to", "retired_at" FROM `question_versions`;--> statement-breakpoint
DROP TABLE `question_versions`;--> statement-breakpoint
ALTER TABLE `__new_question_versions` RENAME TO `question_versions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `question_versions_identity_version_uq` ON `question_versions` (`question_id`,`version`);--> statement-breakpoint
CREATE INDEX `question_versions_lifecycle_idx` ON `question_versions` (`lifecycle`,`effective_from`,`effective_to`);
