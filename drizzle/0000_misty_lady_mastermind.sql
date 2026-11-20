CREATE TABLE `athlete_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`course` text NOT NULL,
	`semester` text NOT NULL,
	`sports` text NOT NULL,
	`experience` text NOT NULL,
	`availability` text NOT NULL,
	`status` text DEFAULT 'Nova' NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`date` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
