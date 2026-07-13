CREATE TABLE `aircraft_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`status` text DEFAULT 'review' NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "aircraft_variants_status_ck" CHECK("aircraft_variants"."status" in ('review', 'active', 'retired')),
	CONSTRAINT "aircraft_variants_dates_ck" CHECK("aircraft_variants"."effective_to" is null or "aircraft_variants"."effective_to" > "aircraft_variants"."effective_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aircraft_variants_code_from_uq` ON `aircraft_variants` (`code`,`effective_from`);--> statement-breakpoint
CREATE INDEX `aircraft_variants_effective_idx` ON `aircraft_variants` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `approved_course_offerings` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_variant_id` text NOT NULL,
	`qualification_id` text NOT NULL,
	`syllabus_id` text NOT NULL,
	`course_type_id` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	FOREIGN KEY (`aircraft_variant_id`) REFERENCES `aircraft_variants`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`qualification_id`) REFERENCES `qualifications`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`syllabus_id`) REFERENCES `syllabi`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`course_type_id`) REFERENCES `course_types`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "approved_course_offerings_dates_ck" CHECK("approved_course_offerings"."effective_to" is null or "approved_course_offerings"."effective_to" > "approved_course_offerings"."effective_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `approved_course_offerings_dimensions_from_uq` ON `approved_course_offerings` (`aircraft_variant_id`,`qualification_id`,`syllabus_id`,`course_type_id`,`effective_from`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`before_json` text,
	`after_json` text,
	`occurred_at` text NOT NULL,
	`retention_until` text,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_events_actor_idx` ON `audit_events` (`actor_user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_events_entity_idx` ON `audit_events` (`entity_type`,`entity_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `course_types` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`status` text DEFAULT 'review' NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "course_types_status_ck" CHECK("course_types"."status" in ('review', 'active', 'retired')),
	CONSTRAINT "course_types_dates_ck" CHECK("course_types"."effective_to" is null or "course_types"."effective_to" > "course_types"."effective_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_types_code_from_uq` ON `course_types` (`code`,`effective_from`);--> statement-breakpoint
CREATE INDEX `course_types_effective_idx` ON `course_types` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `employee_identifier_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`previous_value` text NOT NULL,
	`replacement_value` text NOT NULL,
	`changed_by_user_id` text NOT NULL,
	`changed_at` text NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "employee_identifier_history_values_ck" CHECK("employee_identifier_history"."previous_value" <> "employee_identifier_history"."replacement_value")
);
--> statement-breakpoint
CREATE INDEX `employee_identifier_history_user_idx` ON `employee_identifier_history` (`user_id`,`changed_at`);--> statement-breakpoint
CREATE TABLE `import_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`importer_version` text NOT NULL,
	`source_checksum` text NOT NULL,
	`source_byte_size` integer NOT NULL,
	`status` text DEFAULT 'started' NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`source_row_count` integer DEFAULT 0 NOT NULL,
	`accepted_count` integer DEFAULT 0 NOT NULL,
	`quarantined_count` integer DEFAULT 0 NOT NULL,
	`excluded_count` integer DEFAULT 0 NOT NULL,
	`aggregated_count` integer DEFAULT 0 NOT NULL,
	`suppressed_group_count` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "import_runs_checksum_ck" CHECK(length("import_runs"."source_checksum") = 64 and "import_runs"."source_checksum" not glob '*[^0-9a-f]*'),
	CONSTRAINT "import_runs_status_ck" CHECK("import_runs"."status" in ('started', 'completed')),
	CONSTRAINT "import_runs_completion_ck" CHECK(("import_runs"."status" = 'started' and "import_runs"."completed_at" is null) or ("import_runs"."status" = 'completed' and "import_runs"."completed_at" is not null)),
	CONSTRAINT "import_runs_counts_ck" CHECK("import_runs"."source_byte_size" > 0 and "import_runs"."source_row_count" >= 0 and "import_runs"."accepted_count" >= 0 and "import_runs"."quarantined_count" >= 0 and "import_runs"."excluded_count" >= 0 and "import_runs"."aggregated_count" >= 0 and "import_runs"."suppressed_group_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_runs_source_version_uq` ON `import_runs` (`source_checksum`,`importer_version`);--> statement-breakpoint
CREATE INDEX `import_runs_status_idx` ON `import_runs` (`status`,`started_at`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_code_unique` ON `permissions` (`code`);--> statement-breakpoint
CREATE TABLE `qualifications` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`status` text DEFAULT 'review' NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "qualifications_status_ck" CHECK("qualifications"."status" in ('review', 'active', 'retired')),
	CONSTRAINT "qualifications_dates_ck" CHECK("qualifications"."effective_to" is null or "qualifications"."effective_to" > "qualifications"."effective_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qualifications_code_from_uq` ON `qualifications` (`code`,`effective_from`);--> statement-breakpoint
CREATE INDEX `qualifications_effective_idx` ON `qualifications` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_code_unique` ON `roles` (`code`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sessions_window_ck" CHECK("sessions"."created_at" <= "sessions"."last_seen_at" and "sessions"."last_seen_at" <= "sessions"."expires_at")
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `syllabi` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`status` text DEFAULT 'review' NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "syllabi_status_ck" CHECK("syllabi"."status" in ('review', 'active', 'retired')),
	CONSTRAINT "syllabi_dates_ck" CHECK("syllabi"."effective_to" is null or "syllabi"."effective_to" > "syllabi"."effective_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `syllabi_code_from_uq` ON `syllabi` (`code`,`effective_from`);--> statement-breakpoint
CREATE INDEX `syllabi_effective_idx` ON `syllabi` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`granted_by_user_id` text,
	`granted_at` text NOT NULL,
	`revoked_at` text,
	PRIMARY KEY(`user_id`, `role_id`, `granted_at`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_roles_active_idx` ON `user_roles` (`user_id`,`revoked_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_number` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`password_hash` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`password_changed_at` text,
	`retired_at` text,
	CONSTRAINT "users_status_ck" CHECK("users"."status" in ('pending', 'active', 'suspended', 'retired')),
	CONSTRAINT "users_employee_number_ck" CHECK(length("users"."employee_number") > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_employee_number_uq` ON `users` (`employee_number`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);--> statement-breakpoint
CREATE TABLE `bloom_levels` (
	`id` text PRIMARY KEY NOT NULL,
	`ordinal` integer NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text,
	CONSTRAINT "bloom_levels_ordinal_ck" CHECK("bloom_levels"."ordinal" > 0),
	CONSTRAINT "bloom_levels_status_ck" CHECK("bloom_levels"."status" in ('draft', 'published', 'retired'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bloom_levels_ordinal_uq` ON `bloom_levels` (`ordinal`);--> statement-breakpoint
CREATE TABLE `bloom_verbs` (
	`id` text PRIMARY KEY NOT NULL,
	`bloom_level_id` text NOT NULL,
	`verb` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text,
	FOREIGN KEY (`bloom_level_id`) REFERENCES `bloom_levels`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "bloom_verbs_status_ck" CHECK("bloom_verbs"."status" in ('draft', 'published', 'retired'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bloom_verbs_level_verb_uq` ON `bloom_verbs` (`bloom_level_id`,`verb`);--> statement-breakpoint
CREATE TABLE `element_versions` (
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
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	FOREIGN KEY (`element_id`) REFERENCES `elements`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "element_versions_values_ck" CHECK("element_versions"."version" > 0 and "element_versions"."position" >= 0),
	CONSTRAINT "element_versions_status_ck" CHECK("element_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "element_versions_dates_ck" CHECK("element_versions"."effective_to" is null or "element_versions"."effective_from" is null or "element_versions"."effective_to" > "element_versions"."effective_from"),
	CONSTRAINT "element_versions_reviewer_ck" CHECK("element_versions"."reviewed_by_user_id" is null or "element_versions"."reviewed_by_user_id" <> "element_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `element_versions_identity_version_uq` ON `element_versions` (`element_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `element_versions_parent_position_from_uq` ON `element_versions` (`subtask_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE INDEX `element_versions_parent_idx` ON `element_versions` (`subtask_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `elements` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `legacy_curriculum_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`legacy_entity_type` text NOT NULL,
	`legacy_entity_id` text NOT NULL,
	`target_entity_type` text NOT NULL,
	`target_entity_id` text NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`reviewed_by_user_id` text,
	`reviewed_at` text,
	`rationale` text NOT NULL,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "legacy_curriculum_mappings_legacy_type_ck" CHECK("legacy_curriculum_mappings"."legacy_entity_type" in ('tpo', 'spo', 'eo')),
	CONSTRAINT "legacy_curriculum_mappings_target_type_ck" CHECK("legacy_curriculum_mappings"."target_entity_type" in ('phase', 'task', 'subtask', 'element')),
	CONSTRAINT "legacy_curriculum_mappings_status_ck" CHECK("legacy_curriculum_mappings"."status" in ('proposed', 'approved', 'rejected', 'retired')),
	CONSTRAINT "legacy_curriculum_mappings_review_ck" CHECK(("legacy_curriculum_mappings"."status" = 'proposed' and "legacy_curriculum_mappings"."reviewed_at" is null) or ("legacy_curriculum_mappings"."status" <> 'proposed' and "legacy_curriculum_mappings"."reviewed_at" is not null and "legacy_curriculum_mappings"."reviewed_by_user_id" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_curriculum_mappings_pair_uq` ON `legacy_curriculum_mappings` (`legacy_entity_type`,`legacy_entity_id`,`target_entity_type`,`target_entity_id`);--> statement-breakpoint
CREATE INDEX `legacy_curriculum_mappings_target_idx` ON `legacy_curriculum_mappings` (`target_entity_type`,`target_entity_id`,`status`);--> statement-breakpoint
CREATE TABLE `legacy_eos` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`legacy_spo_id` text NOT NULL,
	`number` text NOT NULL,
	`name` text NOT NULL,
	`import_run_id` text NOT NULL,
	FOREIGN KEY (`legacy_spo_id`) REFERENCES `legacy_spos`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_eos_source_uq` ON `legacy_eos` (`import_run_id`,`source_id`);--> statement-breakpoint
CREATE INDEX `legacy_eos_parent_idx` ON `legacy_eos` (`legacy_spo_id`);--> statement-breakpoint
CREATE TABLE `legacy_spos` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`legacy_tpo_id` text NOT NULL,
	`number` text NOT NULL,
	`name` text NOT NULL,
	`import_run_id` text NOT NULL,
	FOREIGN KEY (`legacy_tpo_id`) REFERENCES `legacy_tpos`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_spos_source_uq` ON `legacy_spos` (`import_run_id`,`source_id`);--> statement-breakpoint
CREATE INDEX `legacy_spos_parent_idx` ON `legacy_spos` (`legacy_tpo_id`);--> statement-breakpoint
CREATE TABLE `legacy_tpos` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`number` text NOT NULL,
	`name` text NOT NULL,
	`import_run_id` text NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_tpos_source_uq` ON `legacy_tpos` (`import_run_id`,`source_id`);--> statement-breakpoint
CREATE TABLE `phase_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`phase_id` text NOT NULL,
	`version` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "phase_versions_values_ck" CHECK("phase_versions"."version" > 0 and "phase_versions"."position" >= 0),
	CONSTRAINT "phase_versions_status_ck" CHECK("phase_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "phase_versions_dates_ck" CHECK("phase_versions"."effective_to" is null or "phase_versions"."effective_from" is null or "phase_versions"."effective_to" > "phase_versions"."effective_from"),
	CONSTRAINT "phase_versions_reviewer_ck" CHECK("phase_versions"."reviewed_by_user_id" is null or "phase_versions"."reviewed_by_user_id" <> "phase_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `phase_versions_identity_version_uq` ON `phase_versions` (`phase_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `phase_versions_position_from_uq` ON `phase_versions` (`position`,`effective_from`);--> statement-breakpoint
CREATE INDEX `phase_versions_lifecycle_idx` ON `phase_versions` (`status`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `phases` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `subtask_versions` (
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
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`subtask_id`) REFERENCES `subtasks`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`task_version_id`) REFERENCES `task_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "subtask_versions_values_ck" CHECK("subtask_versions"."version" > 0 and "subtask_versions"."position" >= 0),
	CONSTRAINT "subtask_versions_status_ck" CHECK("subtask_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "subtask_versions_dates_ck" CHECK("subtask_versions"."effective_to" is null or "subtask_versions"."effective_from" is null or "subtask_versions"."effective_to" > "subtask_versions"."effective_from"),
	CONSTRAINT "subtask_versions_reviewer_ck" CHECK("subtask_versions"."reviewed_by_user_id" is null or "subtask_versions"."reviewed_by_user_id" <> "subtask_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subtask_versions_identity_version_uq` ON `subtask_versions` (`subtask_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `subtask_versions_parent_position_from_uq` ON `subtask_versions` (`task_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE INDEX `subtask_versions_parent_idx` ON `subtask_versions` (`task_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `task_versions` (
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
	`authored_by_user_id` text,
	`reviewed_by_user_id` text,
	`created_at` text NOT NULL,
	`published_at` text,
	`retired_at` text,
	`bloom_verb_id` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`phase_version_id`) REFERENCES `phase_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bloom_verb_id`) REFERENCES `bloom_verbs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "task_versions_values_ck" CHECK("task_versions"."version" > 0 and "task_versions"."position" >= 0),
	CONSTRAINT "task_versions_status_ck" CHECK("task_versions"."status" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "task_versions_dates_ck" CHECK("task_versions"."effective_to" is null or "task_versions"."effective_from" is null or "task_versions"."effective_to" > "task_versions"."effective_from"),
	CONSTRAINT "task_versions_reviewer_ck" CHECK("task_versions"."reviewed_by_user_id" is null or "task_versions"."reviewed_by_user_id" <> "task_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_identity_version_uq` ON `task_versions` (`task_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_versions_parent_position_from_uq` ON `task_versions` (`phase_version_id`,`position`,`effective_from`);--> statement-breakpoint
CREATE INDEX `task_versions_parent_idx` ON `task_versions` (`phase_version_id`,`status`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `legacy_template_source_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`legacy_template_source_id` text NOT NULL,
	`position` integer NOT NULL,
	`legacy_curriculum_type` text NOT NULL,
	`legacy_curriculum_source_id` text NOT NULL,
	`question_count` integer NOT NULL,
	`is_mandatory` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`legacy_template_source_id`) REFERENCES `legacy_template_sources`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "legacy_template_source_rules_values_ck" CHECK("legacy_template_source_rules"."position" >= 0 and "legacy_template_source_rules"."question_count" >= 0),
	CONSTRAINT "legacy_template_source_rules_type_ck" CHECK("legacy_template_source_rules"."legacy_curriculum_type" in ('tpo', 'spo', 'eo'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_template_source_rules_position_uq` ON `legacy_template_source_rules` (`legacy_template_source_id`,`position`);--> statement-breakpoint
CREATE TABLE `legacy_template_sources` (
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
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`mapped_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "legacy_template_sources_table_ck" CHECK("legacy_template_sources"."source_table" in ('test_model', 'testModel')),
	CONSTRAINT "legacy_template_sources_state_ck" CHECK("legacy_template_sources"."reconciliation_state" in ('unreviewed', 'mapped', 'ambiguous', 'retired')),
	CONSTRAINT "legacy_template_sources_length_ck" CHECK("legacy_template_sources"."configured_length" is null or "legacy_template_sources"."configured_length" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_template_sources_source_uq` ON `legacy_template_sources` (`import_run_id`,`source_table`,`source_id`);--> statement-breakpoint
CREATE INDEX `legacy_template_sources_reconciliation_idx` ON `legacy_template_sources` (`source_table`,`reconciliation_state`);--> statement-breakpoint
CREATE TABLE `question_aircraft_applicability` (
	`question_version_id` text NOT NULL,
	`aircraft_variant_id` text NOT NULL,
	PRIMARY KEY(`question_version_id`, `aircraft_variant_id`),
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aircraft_variant_id`) REFERENCES `aircraft_variants`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `question_future_curriculum_links` (
	`question_version_id` text NOT NULL,
	`subtask_version_id` text NOT NULL,
	`element_version_id` text,
	`mapping_status` text DEFAULT 'review' NOT NULL,
	PRIMARY KEY(`question_version_id`, `subtask_version_id`),
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`element_version_id`) REFERENCES `element_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "question_future_curriculum_status_ck" CHECK("question_future_curriculum_links"."mapping_status" in ('review', 'approved', 'retired'))
);
--> statement-breakpoint
CREATE INDEX `question_future_curriculum_element_idx` ON `question_future_curriculum_links` (`element_version_id`);--> statement-breakpoint
CREATE TABLE `question_legacy_curriculum_links` (
	`question_version_id` text NOT NULL,
	`legacy_tpo_id` text NOT NULL,
	`legacy_spo_id` text NOT NULL,
	`legacy_eo_id` text NOT NULL,
	PRIMARY KEY(`question_version_id`, `legacy_eo_id`),
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`legacy_tpo_id`) REFERENCES `legacy_tpos`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`legacy_spo_id`) REFERENCES `legacy_spos`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`legacy_eo_id`) REFERENCES `legacy_eos`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `question_legacy_curriculum_spo_idx` ON `question_legacy_curriculum_links` (`legacy_spo_id`);--> statement-breakpoint
CREATE INDEX `question_legacy_curriculum_tpo_idx` ON `question_legacy_curriculum_links` (`legacy_tpo_id`);--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` text PRIMARY KEY NOT NULL,
	`question_version_id` text NOT NULL,
	`position` integer NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` integer NOT NULL,
	`semantic_value` text,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "question_options_position_ck" CHECK("question_options"."position" >= 0),
	CONSTRAINT "question_options_text_ck" CHECK(length(trim("question_options"."option_text")) > 0),
	CONSTRAINT "question_options_semantic_ck" CHECK("question_options"."semantic_value" is null or "question_options"."semantic_value" in ('true', 'false', 'compound', 'all', 'none'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_options_version_position_uq` ON `question_options` (`question_version_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `question_options_version_text_uq` ON `question_options` (`question_version_id`,`option_text`);--> statement-breakpoint
CREATE TABLE `question_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`question_version_id` text NOT NULL,
	`position` integer NOT NULL,
	`prompt_text` text NOT NULL,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "question_prompts_position_ck" CHECK("question_prompts"."position" >= 0),
	CONSTRAINT "question_prompts_text_ck" CHECK(length(trim("question_prompts"."prompt_text")) > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_prompts_version_position_uq` ON `question_prompts` (`question_version_id`,`position`);--> statement-breakpoint
CREATE TABLE `question_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`version` integer NOT NULL,
	`question_type` text NOT NULL,
	`lifecycle` text DEFAULT 'draft' NOT NULL,
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
	CONSTRAINT "question_versions_version_ck" CHECK("question_versions"."version" > 0),
	CONSTRAINT "question_versions_type_ck" CHECK("question_versions"."question_type" in ('true_false', 'single_choice', 'two_correct_compound', 'all_correct', 'none_correct')),
	CONSTRAINT "question_versions_lifecycle_ck" CHECK("question_versions"."lifecycle" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "question_versions_dates_ck" CHECK("question_versions"."effective_to" is null or "question_versions"."effective_from" is null or "question_versions"."effective_to" > "question_versions"."effective_from"),
	CONSTRAINT "question_versions_reviewer_ck" CHECK("question_versions"."reviewed_by_user_id" is null or "question_versions"."reviewed_by_user_id" <> "question_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_versions_identity_version_uq` ON `question_versions` (`question_id`,`version`);--> statement-breakpoint
CREATE INDEX `question_versions_lifecycle_idx` ON `question_versions` (`lifecycle`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `test_template_required_elements` (
	`test_template_version_id` text NOT NULL,
	`element_version_id` text NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`test_template_version_id`, `element_version_id`),
	FOREIGN KEY (`test_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`element_version_id`) REFERENCES `element_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "test_template_required_elements_position_ck" CHECK("test_template_required_elements"."position" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_required_elements_position_uq` ON `test_template_required_elements` (`test_template_version_id`,`position`);--> statement-breakpoint
CREATE TABLE `test_template_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`test_template_version_id` text NOT NULL,
	`subtask_version_id` text NOT NULL,
	`question_count` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`test_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subtask_version_id`) REFERENCES `subtask_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "test_template_rules_count_ck" CHECK("test_template_rules"."question_count" > 0 and "test_template_rules"."position" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_rules_subtask_uq` ON `test_template_rules` (`test_template_version_id`,`subtask_version_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_rules_position_uq` ON `test_template_rules` (`test_template_version_id`,`position`);--> statement-breakpoint
CREATE TABLE `test_template_versions` (
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
	`created_at` text NOT NULL,
	`published_at` text,
	`effective_from` text,
	`effective_to` text,
	`retired_at` text,
	FOREIGN KEY (`test_template_id`) REFERENCES `test_templates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`aircraft_variant_id`) REFERENCES `aircraft_variants`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`course_type_id`) REFERENCES `course_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`authored_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "test_template_versions_values_ck" CHECK("test_template_versions"."version" > 0 and "test_template_versions"."configured_length" > 0 and "test_template_versions"."allotted_minutes" > 0),
	CONSTRAINT "test_template_versions_lifecycle_ck" CHECK("test_template_versions"."lifecycle" in ('draft', 'review', 'published', 'retired')),
	CONSTRAINT "test_template_versions_dates_ck" CHECK("test_template_versions"."effective_to" is null or "test_template_versions"."effective_from" is null or "test_template_versions"."effective_to" > "test_template_versions"."effective_from"),
	CONSTRAINT "test_template_versions_reviewer_ck" CHECK("test_template_versions"."reviewed_by_user_id" is null or "test_template_versions"."reviewed_by_user_id" <> "test_template_versions"."authored_by_user_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `test_template_versions_identity_version_uq` ON `test_template_versions` (`test_template_id`,`version`);--> statement-breakpoint
CREATE INDEX `test_template_versions_effective_idx` ON `test_template_versions` (`lifecycle`,`aircraft_variant_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `test_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`retired_at` text
);
--> statement-breakpoint
CREATE TABLE `attempt_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`exam_question_id` text NOT NULL,
	`exam_question_option_id` text,
	`answered_at` text NOT NULL,
	`is_correct_at_submission` integer,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exam_question_id`) REFERENCES `exam_questions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`exam_question_option_id`) REFERENCES `exam_question_options`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_answers_attempt_question_uq` ON `attempt_answers` (`exam_attempt_id`,`exam_question_id`);--> statement-breakpoint
CREATE INDEX `attempt_answers_question_idx` ON `attempt_answers` (`exam_question_id`);--> statement-breakpoint
CREATE TABLE `attempt_correction_events` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`question_invalidation_id` text NOT NULL,
	`previous_correct_count` integer NOT NULL,
	`previous_denominator` integer NOT NULL,
	`corrected_correct_count` integer NOT NULL,
	`corrected_denominator` integer NOT NULL,
	`previous_outcome` text NOT NULL,
	`corrected_outcome` text NOT NULL,
	`applied_by_user_id` text NOT NULL,
	`applied_at` text NOT NULL,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`question_invalidation_id`) REFERENCES `question_invalidations`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`applied_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "attempt_correction_events_counts_ck" CHECK("attempt_correction_events"."previous_denominator" > 0 and "attempt_correction_events"."corrected_denominator" >= 0 and "attempt_correction_events"."previous_correct_count" between 0 and "attempt_correction_events"."previous_denominator" and "attempt_correction_events"."corrected_correct_count" between 0 and "attempt_correction_events"."corrected_denominator"),
	CONSTRAINT "attempt_correction_events_outcome_ck" CHECK("attempt_correction_events"."previous_outcome" in ('satisfactory', 'unsatisfactory') and "attempt_correction_events"."corrected_outcome" in ('satisfactory', 'unsatisfactory'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_correction_events_attempt_invalidation_uq` ON `attempt_correction_events` (`exam_attempt_id`,`question_invalidation_id`);--> statement-breakpoint
CREATE TABLE `attempt_extensions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`previous_deadline_at` text NOT NULL,
	`new_deadline_at` text NOT NULL,
	`granted_by_user_id` text NOT NULL,
	`granted_at` text NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "attempt_extensions_deadline_ck" CHECK("attempt_extensions"."new_deadline_at" > "attempt_extensions"."previous_deadline_at")
);
--> statement-breakpoint
CREATE INDEX `attempt_extensions_attempt_idx` ON `attempt_extensions` (`exam_attempt_id`,`granted_at`);--> statement-breakpoint
CREATE TABLE `attempt_question_order` (
	`exam_attempt_id` text NOT NULL,
	`exam_question_id` text NOT NULL,
	`position` integer NOT NULL,
	`is_marked` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`exam_attempt_id`, `exam_question_id`),
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exam_question_id`) REFERENCES `exam_questions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "attempt_question_order_position_ck" CHECK("attempt_question_order"."position" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_question_order_position_uq` ON `attempt_question_order` (`exam_attempt_id`,`position`);--> statement-breakpoint
CREATE TABLE `attempt_recovery_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`granted_by_user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`consumed_at` text,
	`revoked_at` text,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "attempt_recovery_grants_expiry_ck" CHECK("attempt_recovery_grants"."expires_at" > "attempt_recovery_grants"."created_at"),
	CONSTRAINT "attempt_recovery_grants_terminal_ck" CHECK("attempt_recovery_grants"."consumed_at" is null or "attempt_recovery_grants"."revoked_at" is null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_recovery_grants_token_hash_unique` ON `attempt_recovery_grants` (`token_hash`);--> statement-breakpoint
CREATE INDEX `attempt_recovery_grants_attempt_idx` ON `attempt_recovery_grants` (`exam_attempt_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `class_rosters` (
	`id` text PRIMARY KEY NOT NULL,
	`course_offering_id` text NOT NULL,
	`instructor_user_id` text NOT NULL,
	`name` text NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text,
	`created_at` text NOT NULL,
	`retired_at` text,
	FOREIGN KEY (`course_offering_id`) REFERENCES `approved_course_offerings`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`instructor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "class_rosters_dates_ck" CHECK("class_rosters"."ends_on" is null or "class_rosters"."ends_on" >= "class_rosters"."starts_on")
);
--> statement-breakpoint
CREATE INDEX `class_rosters_instructor_idx` ON `class_rosters` (`instructor_user_id`,`starts_on`);--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_instance_id` text NOT NULL,
	`roster_member_id` text NOT NULL,
	`prior_attempt_id` text,
	`attempt_number` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`started_at` text NOT NULL,
	`deadline_at` text NOT NULL,
	`submitted_at` text,
	`submission_reason` text,
	`original_correct_count` integer,
	`original_denominator` integer,
	`original_score_percent` real,
	`original_outcome` text,
	`corrected_correct_count` integer,
	`corrected_denominator` integer,
	`corrected_score_percent` real,
	`corrected_outcome` text,
	`retention_until` text NOT NULL,
	`legal_hold` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`exam_instance_id`) REFERENCES `exam_instances`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`roster_member_id`) REFERENCES `roster_members`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_attempts_number_ck" CHECK("exam_attempts"."attempt_number" > 0),
	CONSTRAINT "exam_attempts_status_ck" CHECK("exam_attempts"."status" in ('in_progress', 'submitted', 'expired', 'voided')),
	CONSTRAINT "exam_attempts_window_ck" CHECK("exam_attempts"."deadline_at" > "exam_attempts"."started_at"),
	CONSTRAINT "exam_attempts_submission_reason_ck" CHECK("exam_attempts"."submission_reason" is null or "exam_attempts"."submission_reason" in ('student', 'deadline', 'administrative')),
	CONSTRAINT "exam_attempts_outcome_ck" CHECK("exam_attempts"."original_outcome" is null or "exam_attempts"."original_outcome" in ('satisfactory', 'unsatisfactory')),
	CONSTRAINT "exam_attempts_corrected_outcome_ck" CHECK("exam_attempts"."corrected_outcome" is null or "exam_attempts"."corrected_outcome" in ('satisfactory', 'unsatisfactory')),
	CONSTRAINT "exam_attempts_original_score_ck" CHECK("exam_attempts"."original_denominator" is null or ("exam_attempts"."original_denominator" > 0 and "exam_attempts"."original_correct_count" between 0 and "exam_attempts"."original_denominator" and "exam_attempts"."original_score_percent" between 0 and 100)),
	CONSTRAINT "exam_attempts_corrected_score_ck" CHECK("exam_attempts"."corrected_denominator" is null or ("exam_attempts"."corrected_denominator" > 0 and "exam_attempts"."corrected_correct_count" between 0 and "exam_attempts"."corrected_denominator" and "exam_attempts"."corrected_score_percent" between 0 and 100))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_attempts_exam_member_number_uq` ON `exam_attempts` (`exam_instance_id`,`roster_member_id`,`attempt_number`);--> statement-breakpoint
CREATE INDEX `exam_attempts_status_deadline_idx` ON `exam_attempts` (`status`,`deadline_at`);--> statement-breakpoint
CREATE INDEX `exam_attempts_retention_idx` ON `exam_attempts` (`legal_hold`,`retention_until`);--> statement-breakpoint
CREATE TABLE `exam_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`test_template_version_id` text NOT NULL,
	`class_roster_id` text NOT NULL,
	`published_by_user_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`access_code_hash` text,
	`random_seed_ciphertext` text NOT NULL,
	`random_algorithm_version` text NOT NULL,
	`published_at` text,
	`start_closes_at` text,
	`created_at` text NOT NULL,
	`retention_until` text,
	FOREIGN KEY (`test_template_version_id`) REFERENCES `test_template_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`class_roster_id`) REFERENCES `class_rosters`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`published_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_instances_status_ck" CHECK("exam_instances"."status" in ('draft', 'published', 'closed', 'retired')),
	CONSTRAINT "exam_instances_publication_ck" CHECK(("exam_instances"."status" = 'draft') or ("exam_instances"."published_at" is not null and "exam_instances"."start_closes_at" is not null and "exam_instances"."access_code_hash" is not null))
);
--> statement-breakpoint
CREATE INDEX `exam_instances_roster_status_idx` ON `exam_instances` (`class_roster_id`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `exam_instances_retention_idx` ON `exam_instances` (`retention_until`);--> statement-breakpoint
CREATE TABLE `exam_question_options` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_question_id` text NOT NULL,
	`source_question_option_id` text,
	`position` integer NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` integer NOT NULL,
	FOREIGN KEY (`exam_question_id`) REFERENCES `exam_questions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_question_option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_question_options_position_ck" CHECK("exam_question_options"."position" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_question_options_position_uq` ON `exam_question_options` (`exam_question_id`,`position`);--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_instance_id` text NOT NULL,
	`source_question_version_id` text,
	`position` integer NOT NULL,
	`question_type` text NOT NULL,
	`prompt_text` text NOT NULL,
	`is_invalidated` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`exam_instance_id`) REFERENCES `exam_instances`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_questions_position_ck" CHECK("exam_questions"."position" >= 0),
	CONSTRAINT "exam_questions_type_ck" CHECK("exam_questions"."question_type" in ('true_false', 'single_choice', 'two_correct_compound', 'all_correct', 'none_correct'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_questions_position_uq` ON `exam_questions` (`exam_instance_id`,`position`);--> statement-breakpoint
CREATE INDEX `exam_questions_source_idx` ON `exam_questions` (`source_question_version_id`);--> statement-breakpoint
CREATE TABLE `generated_exports` (
	`id` text PRIMARY KEY NOT NULL,
	`requested_by_user_id` text NOT NULL,
	`export_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`requested_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "generated_exports_status_ck" CHECK("generated_exports"."status" in ('pending', 'ready', 'failed', 'deleted')),
	CONSTRAINT "generated_exports_expiry_ck" CHECK("generated_exports"."expires_at" > "generated_exports"."created_at")
);
--> statement-breakpoint
CREATE INDEX `generated_exports_expiry_idx` ON `generated_exports` (`status`,`expires_at`);--> statement-breakpoint
CREATE TABLE `question_invalidations` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_question_id` text NOT NULL,
	`reason_code` text NOT NULL,
	`reason_detail` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`exam_question_id`) REFERENCES `exam_questions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_invalidations_question_uq` ON `question_invalidations` (`exam_question_id`);--> statement-breakpoint
CREATE TABLE `remediation_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`opened_by_user_id` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`opened_at` text NOT NULL,
	`completed_at` text,
	`waived_at` text,
	`waived_by_user_id` text,
	`waiver_reason` text,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`opened_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`waived_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "remediation_sessions_status_ck" CHECK("remediation_sessions"."status" in ('open', 'completed', 'waived')),
	CONSTRAINT "remediation_sessions_terminal_ck" CHECK(("remediation_sessions"."status" = 'open' and "remediation_sessions"."completed_at" is null and "remediation_sessions"."waived_at" is null) or ("remediation_sessions"."status" = 'completed' and "remediation_sessions"."completed_at" is not null and "remediation_sessions"."waived_at" is null) or ("remediation_sessions"."status" = 'waived' and "remediation_sessions"."waived_at" is not null and "remediation_sessions"."waived_by_user_id" is not null and "remediation_sessions"."waiver_reason" is not null))
);
--> statement-breakpoint
CREATE INDEX `remediation_sessions_attempt_idx` ON `remediation_sessions` (`exam_attempt_id`,`status`);--> statement-breakpoint
CREATE TABLE `retention_holds` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`reason` text NOT NULL,
	`placed_by_user_id` text NOT NULL,
	`placed_at` text NOT NULL,
	`released_by_user_id` text,
	`released_at` text,
	FOREIGN KEY (`placed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`released_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "retention_holds_release_ck" CHECK(("retention_holds"."released_at" is null and "retention_holds"."released_by_user_id" is null) or ("retention_holds"."released_at" is not null and "retention_holds"."released_by_user_id" is not null))
);
--> statement-breakpoint
CREATE INDEX `retention_holds_entity_idx` ON `retention_holds` (`entity_type`,`entity_id`,`released_at`);--> statement-breakpoint
CREATE TABLE `retraining_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`assigned_by_user_id` text NOT NULL,
	`assigned_at` text NOT NULL,
	`status` text DEFAULT 'assigned' NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "retraining_assignments_status_ck" CHECK("retraining_assignments"."status" in ('assigned', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE INDEX `retraining_assignments_attempt_idx` ON `retraining_assignments` (`exam_attempt_id`);--> statement-breakpoint
CREATE TABLE `roster_members` (
	`id` text PRIMARY KEY NOT NULL,
	`class_roster_id` text NOT NULL,
	`student_user_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`added_at` text NOT NULL,
	`removed_at` text,
	FOREIGN KEY (`class_roster_id`) REFERENCES `class_rosters`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "roster_members_status_ck" CHECK("roster_members"."status" in ('active', 'removed', 'completed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roster_members_class_student_uq` ON `roster_members` (`class_roster_id`,`student_user_id`);--> statement-breakpoint
CREATE TABLE `historical_assessment_aggregates` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`calendar_year` integer NOT NULL,
	`syllabus_code` text,
	`qualification_code` text,
	`retraining` integer,
	`outcome` text,
	`group_size` integer NOT NULL,
	`attempt_count` integer NOT NULL,
	`average_score` real,
	`publication_state` text NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "historical_assessment_aggregates_values_ck" CHECK("historical_assessment_aggregates"."calendar_year" between 1900 and 9999 and "historical_assessment_aggregates"."group_size" > 0 and "historical_assessment_aggregates"."attempt_count" >= 0 and ("historical_assessment_aggregates"."average_score" is null or "historical_assessment_aggregates"."average_score" between 0 and 100)),
	CONSTRAINT "historical_assessment_aggregates_outcome_ck" CHECK("historical_assessment_aggregates"."outcome" is null or "historical_assessment_aggregates"."outcome" in ('satisfactory', 'unsatisfactory')),
	CONSTRAINT "historical_assessment_aggregates_publication_ck" CHECK(("historical_assessment_aggregates"."publication_state" = 'published' and "historical_assessment_aggregates"."group_size" >= 5) or "historical_assessment_aggregates"."publication_state" = 'suppressed')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `historical_assessment_aggregates_dimensions_uq` ON `historical_assessment_aggregates` (`import_run_id`,`calendar_year`,`syllabus_code`,`qualification_code`,`retraining`,`outcome`);--> statement-breakpoint
CREATE INDEX `historical_assessment_aggregates_report_idx` ON `historical_assessment_aggregates` (`calendar_year`,`publication_state`);--> statement-breakpoint
CREATE TABLE `historical_generation_aggregates` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`calendar_year` integer NOT NULL,
	`template_source_key` text,
	`course_type_code` text,
	`configured_length` integer,
	`group_size` integer NOT NULL,
	`generated_count` integer NOT NULL,
	`publication_state` text NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "historical_generation_aggregates_values_ck" CHECK("historical_generation_aggregates"."calendar_year" between 1900 and 9999 and "historical_generation_aggregates"."group_size" > 0 and "historical_generation_aggregates"."generated_count" >= 0 and ("historical_generation_aggregates"."configured_length" is null or "historical_generation_aggregates"."configured_length" > 0)),
	CONSTRAINT "historical_generation_aggregates_publication_ck" CHECK(("historical_generation_aggregates"."publication_state" = 'published' and "historical_generation_aggregates"."group_size" >= 5) or "historical_generation_aggregates"."publication_state" = 'suppressed')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `historical_generation_aggregates_dimensions_uq` ON `historical_generation_aggregates` (`import_run_id`,`calendar_year`,`template_source_key`,`course_type_code`,`configured_length`);--> statement-breakpoint
CREATE INDEX `historical_generation_aggregates_report_idx` ON `historical_generation_aggregates` (`calendar_year`,`publication_state`);--> statement-breakpoint
CREATE TABLE `historical_question_performance` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`question_version_id` text NOT NULL,
	`calendar_year` integer,
	`asked_count` integer NOT NULL,
	`correct_count` integer NOT NULL,
	`publication_state` text NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "historical_question_performance_values_ck" CHECK(("historical_question_performance"."calendar_year" is null or "historical_question_performance"."calendar_year" between 1900 and 9999) and "historical_question_performance"."asked_count" > 0 and "historical_question_performance"."correct_count" between 0 and "historical_question_performance"."asked_count"),
	CONSTRAINT "historical_question_performance_publication_ck" CHECK(("historical_question_performance"."publication_state" = 'published' and "historical_question_performance"."asked_count" >= 5) or "historical_question_performance"."publication_state" = 'suppressed')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `historical_question_performance_dimensions_uq` ON `historical_question_performance` (`import_run_id`,`question_version_id`,`calendar_year`);--> statement-breakpoint
CREATE INDEX `historical_question_performance_report_idx` ON `historical_question_performance` (`question_version_id`,`calendar_year`);--> statement-breakpoint
CREATE TABLE `quarantine_records` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`source_table` text NOT NULL,
	`source_id` text,
	`reason_code` text NOT NULL,
	`disposition` text DEFAULT 'quarantined' NOT NULL,
	`restricted_payload_json` text,
	`payload_fingerprint` text,
	`created_at` text NOT NULL,
	`reviewed_at` text,
	`reviewed_by_user_id` text,
	`review_note` text,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "quarantine_records_reason_ck" CHECK("quarantine_records"."reason_code" in ('missing_parent', 'curriculum_parent_mismatch', 'missing_or_invalid_variant', 'malformed_question_shape', 'duplicate_candidate', 'zero_or_sentinel_relationship', 'ambiguous_template_source', 'unreliable_historical_join', 'restricted_snapshot_only_content', 'aggregate_group_suppression', 'encoding_error', 'unknown_question_type')),
	CONSTRAINT "quarantine_records_disposition_ck" CHECK("quarantine_records"."disposition" in ('rejected', 'quarantined', 'excluded', 'suppressed', 'approved_for_future_reconciliation')),
	CONSTRAINT "quarantine_records_review_ck" CHECK(("quarantine_records"."reviewed_at" is null and "quarantine_records"."reviewed_by_user_id" is null) or ("quarantine_records"."reviewed_at" is not null and "quarantine_records"."reviewed_by_user_id" is not null)),
	CONSTRAINT "quarantine_records_snapshot_payload_ck" CHECK("quarantine_records"."reason_code" <> 'restricted_snapshot_only_content' or "quarantine_records"."restricted_payload_json" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quarantine_records_source_reason_uq` ON `quarantine_records` (`import_run_id`,`source_table`,`source_id`,`reason_code`);--> statement-breakpoint
CREATE INDEX `quarantine_records_reason_status_idx` ON `quarantine_records` (`reason_code`,`disposition`);--> statement-breakpoint
CREATE TABLE `source_table_inventories` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`source_table` text NOT NULL,
	`disposition` text NOT NULL,
	`source_count` integer NOT NULL,
	`accepted_count` integer DEFAULT 0 NOT NULL,
	`quarantined_count` integer DEFAULT 0 NOT NULL,
	`excluded_count` integer DEFAULT 0 NOT NULL,
	`aggregated_count` integer DEFAULT 0 NOT NULL,
	`suppressed_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "source_table_inventories_table_ck" CHECK("source_table_inventories"."source_table" in ('TPO', 'SPO', 'EO', 'variant', 'questions', 'test_model', 'testModel', 'createdTests', 'usedQuestions', 'studentTestRecords', 'testResults', 'instructors', 'logins', 'stamp', 'test_info')),
	CONSTRAINT "source_table_inventories_disposition_ck" CHECK("source_table_inventories"."disposition" in ('migrate', 'template_source', 'aggregate', 'aggregate_or_quarantine', 'exclude')),
	CONSTRAINT "source_table_inventories_counts_ck" CHECK("source_table_inventories"."source_count" >= 0 and "source_table_inventories"."accepted_count" >= 0 and "source_table_inventories"."quarantined_count" >= 0 and "source_table_inventories"."excluded_count" >= 0 and "source_table_inventories"."aggregated_count" >= 0 and "source_table_inventories"."suppressed_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `source_table_inventories_run_table_uq` ON `source_table_inventories` (`import_run_id`,`source_table`);--> statement-breakpoint
CREATE TABLE `source_target_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`import_run_id` text NOT NULL,
	`source_table` text NOT NULL,
	`source_id` text NOT NULL,
	`target_table` text NOT NULL,
	`target_id` text NOT NULL,
	`mapping_kind` text DEFAULT 'direct' NOT NULL,
	FOREIGN KEY (`import_run_id`) REFERENCES `import_runs`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "source_target_mappings_kind_ck" CHECK("source_target_mappings"."mapping_kind" in ('direct', 'version', 'aggregate'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `source_target_mappings_source_uq` ON `source_target_mappings` (`import_run_id`,`source_table`,`source_id`,`target_table`);--> statement-breakpoint
CREATE UNIQUE INDEX `source_target_mappings_target_uq` ON `source_target_mappings` (`import_run_id`,`target_table`,`target_id`);--> statement-breakpoint
CREATE INDEX `source_target_mappings_coverage_idx` ON `source_target_mappings` (`source_table`,`mapping_kind`);