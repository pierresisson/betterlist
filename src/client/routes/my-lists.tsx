import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-lists")({
	component: MyLists,
	head: () => ({
		meta: [
			{
				title: "My Lists - BetterList",
			},
		],
	}),
});

function MyLists() {
	return (
		<div className="min-h-full bg-white">
			<div className="p-8">
				<h1 className="font-semibold text-2xl text-gray-900">My Lists</h1>
			</div>
		</div>
	);
}
