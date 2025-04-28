import { Profile } from "@/_components/profile";
import { useSession } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = useSession();
	const navigate = Route.useNavigate();

	useEffect(() => {
		if (!session && !isPending) {
			navigate({ to: "/sign-in" });
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<div className="container mx-auto flex min-h-screen w-full min-w-0 max-w-[90vw] items-center justify-center px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return <Profile />;
}
