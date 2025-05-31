import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../db/schema/auth";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const userRouter = router({
	getUserName: publicProcedure.query(async ({ ctx }) => {
		const userData = await ctx.db
			.select({ name: user.name })
			.from(user)
			.limit(1)
			.get();
		return userData?.name || "User";
	}),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db
			.select()
			.from(user)
			.where(eq(user.id, ctx.session.userId))
			.get();
	}),
	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				image: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db
				.update(user)
				.set({
					name: input.name,
					image: input.image,
					updatedAt: new Date(),
				})
				.where(eq(user.id, ctx.session.userId))
				.returning()
				.get();
		}),
});
