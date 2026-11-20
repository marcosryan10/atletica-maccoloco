CREATE TABLE `shop_manual_config` (
	`id` text PRIMARY KEY NOT NULL,
	`pix_key` text DEFAULT '' NOT NULL,
	`receiver_name` text DEFAULT '' NOT NULL,
	`receiver_city` text DEFAULT '' NOT NULL,
	`pix_enabled` integer DEFAULT 0 NOT NULL,
	`cash_enabled` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `payment_method` text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `pix_payload` text;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `receiver_name` text;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `delivery_info` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `confirmed_at` text;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `confirmed_by` text;--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `payment_note` text;