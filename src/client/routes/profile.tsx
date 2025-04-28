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
			navigate({
				to: "/sign-in",
			});
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
				<div className="mx-auto w-full max-w-xl space-y-8">
					<div className="text-center text-muted-foreground">Loading...</div>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
				<div className="mx-auto w-full max-w-xl space-y-8">
					<div className="text-center text-muted-foreground">Loading...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
			<Profile />
		</div>
	);
}
