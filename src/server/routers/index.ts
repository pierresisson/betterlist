import { publicProcedure, router } from "../lib/trpc";
import { listsRouter } from "./lists";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	helloFrom: publicProcedure.query(() => {
		return "CF+Hono+tRPC";
	}),
	user: userRouter,
	lists: listsRouter,
});
export type AppRouter = typeof appRouter;
