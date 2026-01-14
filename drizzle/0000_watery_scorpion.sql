CREATE TABLE `community_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`lists_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lists_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_lists_community_id_lists_id_unique` ON `community_lists` (`community_id`,`lists_id`);--> statement-breakpoint
CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon_url` text,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `community_members` (
	`user_id` text NOT NULL,
	`community_id` text NOT NULL,
	`authority` text,
	`joined_at` integer DEFAULT (strftime('%s','now')),
	PRIMARY KEY(`user_id`, `community_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fav_list` (
	`list_item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`list_item_id`) REFERENCES `list_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fav_list_list_item_id_user_id_unique` ON `fav_list` (`list_item_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `genre` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genre_name_unique` ON `genre` (`name`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`url` text,
	`image_url` text,
	`genre_id` text,
	`created_at` integer DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`lists_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lists_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_item_id_lists_id_unique` ON `list_items` (`item_id`,`lists_id`);--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `me_too` (
	`list_item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`list_item_id`) REFERENCES `list_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `me_too_list_item_id_user_id_unique` ON `me_too` (`list_item_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `sns_url` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sns_url_user_id_url_unique` ON `sns_url` (`user_id`,`url`);--> statement-breakpoint
CREATE TABLE `threads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`reply_id` text,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `list_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reply_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`auth_provider` text,
	`auth_id` text,
	`username` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`icon_url` text,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_id_unique` ON `users` (`auth_id`);