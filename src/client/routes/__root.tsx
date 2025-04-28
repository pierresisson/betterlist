import { ThemeProvider } from "@/_components/shared/theme-provider";
import { Toaster } from "@/_components/ui/sonner";
import { useSession } from "@/lib/auth-client";
import type { trpc } from "@/lib/trpc-client";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";
import Header from "@/_components/shared/header";
import Loader from "@/_components/shared/loader";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Better-Cloud",
			},
			{
				name: "description",
				content:
					"Better-Cloud is a starter kit for full-stack React Vite apps deployed to Cloudflare Workers",
			},
		],
	}),
});

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isPending } = useSession();

	if (isPending) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader />
			</div>
		);
	}

	return children;
}

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<AuthGuard>{isFetching ? <Loader /> : <Outlet />}</AuthGuard>
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
