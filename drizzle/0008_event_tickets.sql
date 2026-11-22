CREATE TABLE `event_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`event_id` text NOT NULL,
	`order_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`created_at` text NOT NULL,
	`used_at` text,
	`used_by` text,
	`checkin_nonce` text,
	`revoked_at` text,
	`revoked_by` text,
	`revoke_reason` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_tickets_token_unique` ON `event_tickets` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_ticket_order_ordinal` ON `event_tickets` (`order_id`,`ordinal`);--> statement-breakpoint
CREATE INDEX `event_ticket_event` ON `event_tickets` (`event_id`,`id`);--> statement-breakpoint
CREATE TABLE `ticket_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` integer NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ticket_audit_ticket` ON `ticket_audit` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ticket_deliveries` (
	`order_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`lock_token` text,
	`locked_at` text,
	`sent_at` text,
	`last_error` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ticket_events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`starts_at` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`sales_open` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `ticket_event_id` text;--> statement-breakpoint
ALTER TABLE `shop_products` ADD `ticket_event_id` text;