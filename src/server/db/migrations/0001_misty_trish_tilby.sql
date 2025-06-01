CREATE TABLE `list_collaborators` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_list_collaborators_list_id` ON `list_collaborators` (`list_id`);--> statement-breakpoint
CREATE INDEX `idx_list_collaborators_user_id` ON `list_collaborators` (`user_id`);--> statement-breakpoint
CREATE TABLE `list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`content` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`position` integer NOT NULL,
	`rank` integer,
	`score` real,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_list_items_list_id` ON `list_items` (`list_id`);--> statement-breakpoint
CREATE INDEX `idx_list_items_position` ON `list_items` (`list_id`,`position`);--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`is_template` integer DEFAULT false NOT NULL,
	`owner_id` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lists_owner_id` ON `lists` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_lists_type` ON `lists` (`type`);--> statement-breakpoint
CREATE INDEX `idx_lists_public` ON `lists` (`is_public`);--> statement-breakpoint
CREATE TABLE `user_streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_activity_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_user_streaks_user_id` ON `user_streaks` (`user_id`);