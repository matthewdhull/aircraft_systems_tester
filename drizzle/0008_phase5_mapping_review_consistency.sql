PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_legacy_curriculum_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`legacy_entity_type` text NOT NULL,
	`legacy_entity_id` text NOT NULL,
	`target_entity_type` text NOT NULL,
	`target_entity_id` text NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`proposed_by_user_id` text NOT NULL,
	`proposed_at` text NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`rationale` text NOT NULL,
	FOREIGN KEY (`proposed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "legacy_curriculum_mappings_legacy_type_ck" CHECK("__new_legacy_curriculum_mappings"."legacy_entity_type" in ('tpo', 'spo', 'eo')),
	CONSTRAINT "legacy_curriculum_mappings_target_type_ck" CHECK("__new_legacy_curriculum_mappings"."target_entity_type" in ('phase', 'task', 'subtask', 'element')),
	CONSTRAINT "legacy_curriculum_mappings_status_ck" CHECK("__new_legacy_curriculum_mappings"."status" in ('proposed', 'approved', 'rejected', 'retired')),
	CONSTRAINT "legacy_curriculum_mappings_review_ck" CHECK(("__new_legacy_curriculum_mappings"."status" = 'proposed' and "__new_legacy_curriculum_mappings"."reviewed_at" is null and "__new_legacy_curriculum_mappings"."reviewed_by_user_id" is null) or ("__new_legacy_curriculum_mappings"."status" <> 'proposed' and "__new_legacy_curriculum_mappings"."reviewed_at" is not null and "__new_legacy_curriculum_mappings"."reviewed_by_user_id" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_legacy_curriculum_mappings`("id", "legacy_entity_type", "legacy_entity_id", "target_entity_type", "target_entity_id", "status", "proposed_by_user_id", "proposed_at", "reviewed_by_user_id", "reviewed_at", "rationale") SELECT "id", "legacy_entity_type", "legacy_entity_id", "target_entity_type", "target_entity_id", "status", "proposed_by_user_id", "proposed_at", "reviewed_by_user_id", "reviewed_at", "rationale" FROM `legacy_curriculum_mappings`;--> statement-breakpoint
DROP TABLE `legacy_curriculum_mappings`;--> statement-breakpoint
ALTER TABLE `__new_legacy_curriculum_mappings` RENAME TO `legacy_curriculum_mappings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_curriculum_mappings_pair_uq` ON `legacy_curriculum_mappings` (`legacy_entity_type`,`legacy_entity_id`,`target_entity_type`,`target_entity_id`);--> statement-breakpoint
CREATE INDEX `legacy_curriculum_mappings_target_idx` ON `legacy_curriculum_mappings` (`target_entity_type`,`target_entity_id`,`status`);