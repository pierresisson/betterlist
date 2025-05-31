import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/challenges")({
	component: Challenges,
	head: () => ({
		meta: [
			{
				title: "Challenges - BetterList",
			},
		],
	}),
});

function Challenges() {
	return (
		<div className="min-h-full bg-white">
			<div className="p-8">
				<h1 className="font-semibold text-2xl text-gray-900">Challenges</h1>
			</div>
		</div>
	);
}
