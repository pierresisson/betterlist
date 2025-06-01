import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const lists = sqliteTable(
	"lists",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		type: text("type").notNull(), // "todo", "movie", "shopping", "travel", "ranking", etc.
		isPublic: integer("is_public", { mode: "boolean" })
			.notNull()
			.default(false),
		isTemplate: integer("is_template", { mode: "boolean" })
			.notNull()
			.default(false),
		ownerId: text("owner_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		metadata: text("metadata", { mode: "json" }).$type<{
			color?: string;
			emoji?: string;
			tags?: string[];
			settings?: Record<string, string | number | boolean>;
		}>(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("idx_lists_owner_id").on(table.ownerId),
		index("idx_lists_type").on(table.type),
		index("idx_lists_public").on(table.isPublic),
	],
);

export const listItems = sqliteTable(
	"list_items",
	{
		id: text("id").primaryKey(),
		listId: text("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		isCompleted: integer("is_completed", { mode: "boolean" })
			.notNull()
			.default(false),
		position: integer("position").notNull(),
		rank: integer("rank"), // Pour les listes de ranking
		score: real("score"), // Pour les scores/notes
		metadata: text("metadata", { mode: "json" }).$type<{
			dueDate?: string;
			priority?: "low" | "medium" | "high";
			notes?: string;
			url?: string;
			image?: string;
			customFields?: Record<string, string | number | boolean>;
		}>(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("idx_list_items_list_id").on(table.listId),
		index("idx_list_items_position").on(table.listId, table.position),
	],
);

export const listCollaborators = sqliteTable(
	"list_collaborators",
	{
		id: text("id").primaryKey(),
		listId: text("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("viewer"), // "owner", "editor", "viewer"
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("idx_list_collaborators_list_id").on(table.listId),
		index("idx_list_collaborators_user_id").on(table.userId),
	],
);

export const userStreaks = sqliteTable(
	"user_streaks",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		currentStreak: integer("current_streak").notNull().default(0),
		longestStreak: integer("longest_streak").notNull().default(0),
		lastActivityDate: integer("last_activity_date", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("idx_user_streaks_user_id").on(table.userId)],
);
