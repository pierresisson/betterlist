import { CreateListModal } from "@client/components/lists/CreateListModal";
import { ListCard } from "@client/components/lists/ListCard";
import { Badge } from "@client/components/ui/badge";
import { Button } from "@client/components/ui/button";
import { trpc } from "@client/lib/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus } from "lucide-react";
import { useState } from "react";

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

const typeFilters = [
	{ value: "", label: "All", count: 0 },
	{ value: "todo", label: "To-Do", count: 0 },
	{ value: "movie", label: "Movies", count: 0 },
	{ value: "shopping", label: "Shopping", count: 0 },
	{ value: "travel", label: "Travel", count: 0 },
	{ value: "reading", label: "Reading", count: 0 },
	{ value: "gaming", label: "Gaming", count: 0 },
	{ value: "bucket", label: "Bucket List", count: 0 },
	{ value: "recipe", label: "Recipes", count: 0 },
	{ value: "challenge", label: "Challenges", count: 0 },
	{ value: "gift", label: "Gift Ideas", count: 0 },
	{ value: "ranking", label: "Rankings", count: 0 },
];

function MyLists() {
	const [selectedType, setSelectedType] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const {
		data: lists,
		isLoading,
		error,
	} = useQuery(
		trpc.lists.getUserLists.queryOptions({ type: selectedType || undefined }),
	);

	const filteredFilters = typeFilters
		.map((filter) => ({
			...filter,
			count:
				filter.value === ""
					? (lists || []).length
					: (lists || []).filter((list) => list.type === filter.value).length,
		}))
		.filter((filter) => filter.value === "" || filter.count > 0);

	if (isLoading) {
		return (
			<div className="min-h-full bg-white">
				<div className="p-6">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="font-semibold text-2xl text-gray-900">My Lists</h1>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map(() => (
							<div
								key={crypto.randomUUID()}
								className="h-32 animate-pulse rounded-lg bg-gray-200"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-full bg-white">
				<div className="p-6">
					<h1 className="mb-4 font-semibold text-2xl text-gray-900">
						My Lists
					</h1>
					<div className="text-red-600">
						Error loading lists: {error.message}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-white">
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="font-semibold text-2xl text-gray-900">My Lists</h1>
					<Button
						onClick={() => setIsCreateModalOpen(true)}
						className="bg-[#d97706] hover:bg-[#d97706]/90"
					>
						<Plus className="mr-2 h-4 w-4" />
						New List
					</Button>
				</div>

				<div className="mb-6">
					<div className="mb-3 flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-500" />
						<span className="font-medium text-gray-700 text-sm">
							Filter by type:
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{filteredFilters.map((filter) => (
							<Badge
								key={filter.value}
								variant={
									selectedType === filter.value ? "default" : "secondary"
								}
								className={`cursor-pointer transition-colors ${
									selectedType === filter.value
										? "bg-[#d97706] hover:bg-[#d97706]/90"
										: "hover:bg-gray-200"
								}`}
								onClick={() => setSelectedType(filter.value)}
							>
								{filter.label} ({filter.count})
							</Badge>
						))}
					</div>
				</div>

				{lists && lists.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{lists.map((list) => (
							<ListCard
								key={list.id}
								id={list.id}
								title={list.title}
								description={list.description || undefined}
								type={list.type}
								metadata={list.metadata || undefined}
								isPublic={list.isPublic}
								updatedAt={new Date(list.updatedAt)}
								itemCount={0}
							/>
						))}
					</div>
				) : (
					<div className="py-12 text-center">
						<div className="mb-4 text-6xl">📋</div>
						<h3 className="mb-2 font-medium text-gray-900 text-lg">
							{selectedType ? "No lists of this type" : "No lists created yet"}
						</h3>
						<p className="mb-6 text-gray-500">
							{selectedType
								? "Try a different filter or create your first list of this type."
								: "Start by creating your first list to organize your ideas."}
						</p>
						<Button
							onClick={() => setIsCreateModalOpen(true)}
							className="bg-[#d97706] hover:bg-[#d97706]/90"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create my first list
						</Button>
					</div>
				)}
			</div>

			<CreateListModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			/>
		</div>
	);
}
