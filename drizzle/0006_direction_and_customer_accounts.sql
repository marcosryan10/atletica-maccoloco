CREATE TABLE `customer_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text NOT NULL,
	`event_key` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_notifications_event_key_unique` ON `customer_notifications` (`event_key`);--> statement-breakpoint
CREATE INDEX `customer_notification_owner` ON `customer_notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `direction_access` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`auth_user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `direction_access_email_unique` ON `direction_access` (`email`);--> statement-breakpoint
CREATE TABLE `direction_access_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`member_id` text NOT NULL,
	`action` text NOT NULL,
	`permissions` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `direction_access_audit_member` ON `direction_access_audit` (`member_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `customer_user_id` text;