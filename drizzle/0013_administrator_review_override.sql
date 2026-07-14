PRAGMA foreign_keys=OFF;--> statement-breakpoint
PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
PRAGMA legacy_alter_table=ON;--> statement-breakpoint
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
	CONSTRAINT "question_future_curriculum_status_ck" CHECK("mapping_status" in ('review', 'approved', 'retired')),
	CONSTRAINT "question_future_curriculum_review_ck" CHECK(("mapping_status" = 'review' and "reviewed_at" is null and "reviewed_by_user_id" is null) or ("mapping_status" <> 'review' and "reviewed_at" is not null and "reviewed_by_user_id" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_question_future_curriculum_links`("question_version_id", "subtask_version_id", "element_version_id", "mapping_status", "proposed_by_user_id", "proposed_at", "reviewed_by_user_id", "reviewed_at") SELECT "question_version_id", "subtask_version_id", "element_version_id", "mapping_status", "proposed_by_user_id", "proposed_at", "reviewed_by_user_id", "reviewed_at" FROM `question_future_curriculum_links`;--> statement-breakpoint
DROP TABLE `question_future_curriculum_links`;--> statement-breakpoint
ALTER TABLE `__new_question_future_curriculum_links` RENAME TO `question_future_curriculum_links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `question_future_curriculum_element_idx` ON `question_future_curriculum_links` (`element_version_id`);--> statement-breakpoint
CREATE INDEX `question_future_curriculum_subtask_idx` ON `question_future_curriculum_links` (`subtask_version_id`);
