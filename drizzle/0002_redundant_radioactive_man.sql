CREATE TABLE `shop_payment_config` (
	`id` text PRIMARY KEY NOT NULL,
	`encrypted_credentials` text NOT NULL,
	`collector_id` text NOT NULL,
	`receiver_label` text NOT NULL,
	`mode` text NOT NULL,
	`test_paid_at` text,
	`webhook_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`owner_hash` text NOT NULL,
	`buyer` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'creating' NOT NULL,
	`fulfillment` text DEFAULT 'Pendente' NOT NULL,
	`mode` text NOT NULL,
	`preference_id` text,
	`checkout_url` text,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_order_request_idx` ON `shop_orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `shop_order_created_idx` ON `shop_orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `shop_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`refunded_cents` integer DEFAULT 0 NOT NULL,
	`provider_updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shop_payment_order_idx` ON `shop_payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `shop_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`price_cents` integer,
	`image` text DEFAULT '' NOT NULL,
	`sizes` text NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`illustration` text DEFAULT 'other' NOT NULL,
	`delivery_info` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`expires_at` integer NOT NULL
);
