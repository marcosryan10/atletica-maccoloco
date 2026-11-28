CREATE TABLE `bar_passes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`entrance_ticket_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`last_served_at` integer,
	`last_served_by` text,
	`redemption_nonce` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bar_passes_token_unique` ON `bar_passes` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `bar_passes_entrance_ticket_id_unique` ON `bar_passes` (`entrance_ticket_id`);--> statement-breakpoint
CREATE TABLE `bar_redemptions` (
	`id` text PRIMARY KEY NOT NULL,
	`pass_id` integer NOT NULL,
	`actor` text NOT NULL,
	`served_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bar_redemptions_pass` ON `bar_redemptions` (`pass_id`,`served_at`);--> statement-breakpoint
ALTER TABLE `shop_orders` ADD `includes_open_bar` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_products` ADD `includes_open_bar` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ticket_events` ADD `bar_starts_at` text;--> statement-breakpoint
ALTER TABLE `ticket_events` ADD `bar_ends_at` text;
--> statement-breakpoint
UPDATE ticket_events SET bar_starts_at='2027-01-16T17:00:00.000Z',bar_ends_at='2027-01-16T19:00:00.000Z' WHERE id='c04674c3-7120-4e12-b00f-624ff36cc453';
--> statement-breakpoint
UPDATE shop_products SET includes_open_bar=1 WHERE id='f0781071-2c7c-4200-b6fb-2496d5317952' AND ticket_event_id='c04674c3-7120-4e12-b00f-624ff36cc453';
--> statement-breakpoint
UPDATE shop_orders SET includes_open_bar=1 WHERE product_id='f0781071-2c7c-4200-b6fb-2496d5317952' AND ticket_event_id='c04674c3-7120-4e12-b00f-624ff36cc453';
--> statement-breakpoint
INSERT OR IGNORE INTO bar_passes(token,entrance_ticket_id,created_at)
SELECT lower(hex(randomblob(32))),t.id,strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id WHERE o.includes_open_bar=1 AND o.status='paid' AND o.mode='live' AND t.revoked_at IS NULL;
