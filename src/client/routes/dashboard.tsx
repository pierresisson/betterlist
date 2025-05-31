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
				<h1 className="font-semibold text-2xl text-gray-900">Dashboard</h1>
			</div>
		</div>
	);
}
