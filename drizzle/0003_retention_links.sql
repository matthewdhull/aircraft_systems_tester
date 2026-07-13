PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exam_attempts` (
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
	FOREIGN KEY (`prior_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exam_attempts_number_ck" CHECK("__new_exam_attempts"."attempt_number" > 0),
	CONSTRAINT "exam_attempts_status_ck" CHECK("__new_exam_attempts"."status" in ('in_progress', 'submitted', 'expired', 'voided')),
	CONSTRAINT "exam_attempts_window_ck" CHECK("__new_exam_attempts"."deadline_at" > "__new_exam_attempts"."started_at"),
	CONSTRAINT "exam_attempts_submission_reason_ck" CHECK("__new_exam_attempts"."submission_reason" is null or "__new_exam_attempts"."submission_reason" in ('student', 'deadline', 'administrative')),
	CONSTRAINT "exam_attempts_outcome_ck" CHECK("__new_exam_attempts"."original_outcome" is null or "__new_exam_attempts"."original_outcome" in ('satisfactory', 'unsatisfactory')),
	CONSTRAINT "exam_attempts_corrected_outcome_ck" CHECK("__new_exam_attempts"."corrected_outcome" is null or "__new_exam_attempts"."corrected_outcome" in ('satisfactory', 'unsatisfactory')),
	CONSTRAINT "exam_attempts_original_score_ck" CHECK("__new_exam_attempts"."original_denominator" is null or ("__new_exam_attempts"."original_denominator" > 0 and "__new_exam_attempts"."original_correct_count" between 0 and "__new_exam_attempts"."original_denominator" and "__new_exam_attempts"."original_score_percent" between 0 and 100)),
	CONSTRAINT "exam_attempts_corrected_score_ck" CHECK("__new_exam_attempts"."corrected_denominator" is null or ("__new_exam_attempts"."corrected_denominator" > 0 and "__new_exam_attempts"."corrected_correct_count" between 0 and "__new_exam_attempts"."corrected_denominator" and "__new_exam_attempts"."corrected_score_percent" between 0 and 100))
);
--> statement-breakpoint
INSERT INTO `__new_exam_attempts`("id", "exam_instance_id", "roster_member_id", "prior_attempt_id", "attempt_number", "status", "started_at", "deadline_at", "submitted_at", "submission_reason", "original_correct_count", "original_denominator", "original_score_percent", "original_outcome", "corrected_correct_count", "corrected_denominator", "corrected_score_percent", "corrected_outcome", "retention_until", "legal_hold") SELECT "id", "exam_instance_id", "roster_member_id", "prior_attempt_id", "attempt_number", "status", "started_at", "deadline_at", "submitted_at", "submission_reason", "original_correct_count", "original_denominator", "original_score_percent", "original_outcome", "corrected_correct_count", "corrected_denominator", "corrected_score_percent", "corrected_outcome", "retention_until", "legal_hold" FROM `exam_attempts`;--> statement-breakpoint
DROP TABLE `exam_attempts`;--> statement-breakpoint
ALTER TABLE `__new_exam_attempts` RENAME TO `exam_attempts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `exam_attempts_exam_member_number_uq` ON `exam_attempts` (`exam_instance_id`,`roster_member_id`,`attempt_number`);--> statement-breakpoint
CREATE INDEX `exam_attempts_status_deadline_idx` ON `exam_attempts` (`status`,`deadline_at`);--> statement-breakpoint
CREATE INDEX `exam_attempts_retention_idx` ON `exam_attempts` (`legal_hold`,`retention_until`);--> statement-breakpoint
CREATE TABLE `__new_quarantine_records` (
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
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "quarantine_records_reason_ck" CHECK("__new_quarantine_records"."reason_code" in ('missing_parent', 'curriculum_parent_mismatch', 'missing_or_invalid_variant', 'malformed_question_shape', 'duplicate_candidate', 'zero_or_sentinel_relationship', 'ambiguous_template_source', 'unreliable_historical_join', 'restricted_snapshot_only_content', 'aggregate_group_suppression', 'encoding_error', 'unknown_question_type')),
	CONSTRAINT "quarantine_records_disposition_ck" CHECK("__new_quarantine_records"."disposition" in ('rejected', 'quarantined', 'excluded', 'suppressed', 'approved_for_future_reconciliation')),
	CONSTRAINT "quarantine_records_review_ck" CHECK(("__new_quarantine_records"."reviewed_at" is null and "__new_quarantine_records"."reviewed_by_user_id" is null) or ("__new_quarantine_records"."reviewed_at" is not null and "__new_quarantine_records"."reviewed_by_user_id" is not null)),
	CONSTRAINT "quarantine_records_snapshot_payload_ck" CHECK("__new_quarantine_records"."reason_code" <> 'restricted_snapshot_only_content' or "__new_quarantine_records"."restricted_payload_json" is not null)
);
--> statement-breakpoint
INSERT INTO `__new_quarantine_records`("id", "import_run_id", "source_table", "source_id", "reason_code", "disposition", "restricted_payload_json", "payload_fingerprint", "created_at", "reviewed_at", "reviewed_by_user_id", "review_note") SELECT "id", "import_run_id", "source_table", "source_id", "reason_code", "disposition", "restricted_payload_json", "payload_fingerprint", "created_at", "reviewed_at", "reviewed_by_user_id", "review_note" FROM `quarantine_records`;--> statement-breakpoint
DROP TABLE `quarantine_records`;--> statement-breakpoint
ALTER TABLE `__new_quarantine_records` RENAME TO `quarantine_records`;--> statement-breakpoint
CREATE UNIQUE INDEX `quarantine_records_source_reason_uq` ON `quarantine_records` (`import_run_id`,`source_table`,`source_id`,`reason_code`);--> statement-breakpoint
CREATE INDEX `quarantine_records_reason_status_idx` ON `quarantine_records` (`reason_code`,`disposition`);