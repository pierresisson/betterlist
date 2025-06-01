import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { DBInstance } from "../db";
import {
	listCollaborators,
	listItems,
	lists,
	userStreaks,
} from "../db/schema/lists";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

const createListSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().optional(),
	type: z.enum([
		"todo",
		"movie",
		"shopping",
		"travel",
		"reading",
		"gaming",
		"bucket",
		"recipe",
		"challenge",
		"gift",
		"ranking",
	]),
	isPublic: z.boolean().default(false),
	metadata: z
		.object({
			color: z.string().optional(),
			emoji: z.string().optional(),
			tags: z.array(z.string()).optional(),
			settings: z
				.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
				.optional(),
		})
		.optional(),
});

const addItemSchema = z.object({
	listId: z.string(),
	content: z.string().min(1),
	metadata: z
		.object({
			dueDate: z.string().optional(),
			priority: z.enum(["low", "medium", "high"]).optional(),
			notes: z.string().optional(),
			url: z.string().optional(),
			image: z.string().optional(),
			customFields: z
				.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
				.optional(),
		})
		.optional(),
});

export const listsRouter = router({
	createList: protectedProcedure
		.input(createListSchema)
		.mutation(async ({ ctx, input }) => {
			const listId = randomUUID();
			const now = new Date();

			await ctx.db.insert(lists).values({
				id: listId,
				title: input.title,
				description: input.description,
				type: input.type,
				isPublic: input.isPublic,
				ownerId: ctx.session.userId,
				metadata: input.metadata,
				createdAt: now,
				updatedAt: now,
			});

			return { id: listId };
		}),

	getUserLists: protectedProcedure
		.input(
			z
				.object({
					type: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(lists.ownerId, ctx.session.userId)];

			if (input?.type) {
				conditions.push(eq(lists.type, input.type));
			}

			return await ctx.db
				.select()
				.from(lists)
				.where(and(...conditions))
				.orderBy(desc(lists.updatedAt));
		}),

	getListWithItems: protectedProcedure
		.input(z.object({ listId: z.string() }))
		.query(async ({ ctx, input }) => {
			const list = await ctx.db
				.select()
				.from(lists)
				.where(eq(lists.id, input.listId))
				.get();

			if (!list) throw new Error("Liste non trouvée");

			const hasAccess = list.ownerId === ctx.session.userId || list.isPublic;
			if (!hasAccess) {
				const collaboration = await ctx.db
					.select()
					.from(listCollaborators)
					.where(
						and(
							eq(listCollaborators.listId, input.listId),
							eq(listCollaborators.userId, ctx.session.userId),
						),
					)
					.get();

				if (!collaboration) throw new Error("Accès refusé");
			}

			const items = await ctx.db
				.select()
				.from(listItems)
				.where(eq(listItems.listId, input.listId))
				.orderBy(listItems.position);

			return { ...list, items };
		}),

	addItem: protectedProcedure
		.input(addItemSchema)
		.mutation(async ({ ctx, input }) => {
			const list = await ctx.db
				.select()
				.from(lists)
				.where(eq(lists.id, input.listId))
				.get();

			if (!list || list.ownerId !== ctx.session.userId) {
				throw new Error("Accès refusé");
			}

			const maxPosition = await ctx.db
				.select({ max: listItems.position })
				.from(listItems)
				.where(eq(listItems.listId, input.listId))
				.get();

			const itemId = randomUUID();
			const now = new Date();

			await ctx.db.insert(listItems).values({
				id: itemId,
				listId: input.listId,
				content: input.content,
				position: (maxPosition?.max || 0) + 1,
				isCompleted: false,
				metadata: input.metadata,
				createdAt: now,
				updatedAt: now,
			});

			await ctx.db
				.update(lists)
				.set({ updatedAt: now })
				.where(eq(lists.id, input.listId));

			return { id: itemId };
		}),

	toggleItem: protectedProcedure
		.input(
			z.object({
				itemId: z.string(),
				isCompleted: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const item = await ctx.db
				.select({
					id: listItems.id,
					listId: listItems.listId,
					ownerId: lists.ownerId,
				})
				.from(listItems)
				.innerJoin(lists, eq(listItems.listId, lists.id))
				.where(eq(listItems.id, input.itemId))
				.get();

			if (!item || item.ownerId !== ctx.session.userId) {
				throw new Error("Accès refusé");
			}

			const now = new Date();

			await ctx.db
				.update(listItems)
				.set({
					isCompleted: input.isCompleted,
					updatedAt: now,
				})
				.where(eq(listItems.id, input.itemId));

			await ctx.db
				.update(lists)
				.set({ updatedAt: now })
				.where(eq(lists.id, item.listId));

			if (input.isCompleted) {
				await updateUserStreak(ctx.db, ctx.session.userId);
			}

			return { success: true };
		}),

	deleteList: protectedProcedure
		.input(z.object({ listId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const list = await ctx.db
				.select()
				.from(lists)
				.where(eq(lists.id, input.listId))
				.get();

			if (!list || list.ownerId !== ctx.session.userId) {
				throw new Error("Accès refusé");
			}

			await ctx.db.delete(lists).where(eq(lists.id, input.listId));

			return { success: true };
		}),

	getUserStreak: protectedProcedure.query(async ({ ctx }) => {
		const streak = await ctx.db
			.select()
			.from(userStreaks)
			.where(eq(userStreaks.userId, ctx.session.userId))
			.get();

		return (
			streak || {
				currentStreak: 0,
				longestStreak: 0,
				lastActivityDate: null,
			}
		);
	}),
});

async function updateUserStreak(db: DBInstance, userId: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const streak = await db
		.select()
		.from(userStreaks)
		.where(eq(userStreaks.userId, userId))
		.get();

	if (!streak) {
		await db.insert(userStreaks).values({
			id: randomUUID(),
			userId,
			currentStreak: 1,
			longestStreak: 1,
			lastActivityDate: today,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return;
	}

	const lastActivity = streak.lastActivityDate
		? new Date(streak.lastActivityDate)
		: null;
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	let newCurrentStreak = streak.currentStreak;

	if (!lastActivity || lastActivity.getTime() === yesterday.getTime()) {
		newCurrentStreak = streak.currentStreak + 1;
	} else if (lastActivity.getTime() !== today.getTime()) {
		newCurrentStreak = 1;
	}

	const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

	await db
		.update(userStreaks)
		.set({
			currentStreak: newCurrentStreak,
			longestStreak: newLongestStreak,
			lastActivityDate: today,
			updatedAt: new Date(),
		})
		.where(eq(userStreaks.userId, userId));
}
