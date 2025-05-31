import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/leaderboard")({
	component: Leaderboard,
	head: () => ({
		meta: [
			{
				title: "Leaderboard - BetterList",
			},
		],
	}),
});

function Leaderboard() {
	return (
		<div className="min-h-full bg-white">
			<div className="p-8">
				<h1 className="font-semibold text-2xl text-gray-900">Leaderboards</h1>
			</div>
		</div>
	);
}
