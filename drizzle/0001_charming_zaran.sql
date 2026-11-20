CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
