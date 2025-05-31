import { WelcomeCard } from "@client/components/WelcomeCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
	head: () => ({
		meta: [
			{
				title: "Dashboard - BetterList",
			},
		],
	}),
});

function Dashboard() {
	return (
		<div className="min-h-full bg-white">
			<div className="p-8">
				<WelcomeCard />
			</div>
		</div>
	);
}
