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
  `created_at` integer NOT NULL,
  FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON UPDATE no action ON DELETE no action
);
