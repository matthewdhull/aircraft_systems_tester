PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	CONSTRAINT "quarantine_records_snapshot_payload_ck" CHECK("__new_quarantine_records"."reason_code" <> 'restricted_snapshot_only_content' or ("__new_quarantine_records"."source_table" = 'usedQuestions' and "__new_quarantine_records"."source_id" is null and "__new_quarantine_records"."restricted_payload_json" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_quarantine_records`("id", "import_run_id", "source_table", "source_id", "reason_code", "disposition", "restricted_payload_json", "payload_fingerprint", "created_at", "reviewed_at", "reviewed_by_user_id", "review_note") SELECT "id", "import_run_id", "source_table", "source_id", "reason_code", "disposition", "restricted_payload_json", "payload_fingerprint", "created_at", "reviewed_at", "reviewed_by_user_id", "review_note" FROM `quarantine_records`;--> statement-breakpoint
DROP TABLE `quarantine_records`;--> statement-breakpoint
ALTER TABLE `__new_quarantine_records` RENAME TO `quarantine_records`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `quarantine_records_source_reason_uq` ON `quarantine_records` (`import_run_id`,`source_table`,`source_id`,`reason_code`);--> statement-breakpoint
CREATE INDEX `quarantine_records_reason_status_idx` ON `quarantine_records` (`reason_code`,`disposition`);