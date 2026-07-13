CREATE TABLE `password_action_tokens` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`revoked_at` text,
	`created_by_user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "password_action_tokens_purpose_ck" CHECK("password_action_tokens"."purpose" in ('initialize', 'reset')),
	CONSTRAINT "password_action_tokens_window_ck" CHECK("password_action_tokens"."created_at" < "password_action_tokens"."expires_at")
);
--> statement-breakpoint
CREATE INDEX `password_action_tokens_user_idx` ON `password_action_tokens` (`user_id`,`purpose`);--> statement-breakpoint
CREATE INDEX `password_action_tokens_expiry_idx` ON `password_action_tokens` (`expires_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`revocation_reason` text,
	`rotated_from_hash` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sessions_window_ck" CHECK("__new_sessions"."created_at" <= "__new_sessions"."last_seen_at" and "__new_sessions"."last_seen_at" <= "__new_sessions"."expires_at"),
	CONSTRAINT "sessions_revocation_ck" CHECK(("__new_sessions"."revoked_at" is null and "__new_sessions"."revocation_reason" is null) or ("__new_sessions"."revoked_at" is not null and "__new_sessions"."revocation_reason" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id_hash", "user_id", "created_at", "last_seen_at", "expires_at", "revoked_at", "revocation_reason", "rotated_from_hash") SELECT "id_hash", "user_id", "created_at", "last_seen_at", "expires_at", "revoked_at", CASE WHEN "revoked_at" IS NULL THEN NULL ELSE 'pre_phase4_revocation' END, NULL FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `sessions` (`expires_at`);
