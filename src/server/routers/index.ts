import { publicProcedure, router } from "../lib/trpc";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	helloFrom: publicProcedure.query(() => {
		return "CF+Hono+tRPC";
	}),
	user: userRouter,
});
export type AppRouter = typeof appRouter;
