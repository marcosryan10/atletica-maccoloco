CREATE TABLE `payment_config_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`receiver_fingerprint` text NOT NULL,
	`pix_enabled` integer NOT NULL,
	`cash_enabled` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `payment_config_audit_created` ON `payment_config_audit` (`created_at`);