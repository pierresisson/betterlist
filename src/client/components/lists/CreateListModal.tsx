import { Badge } from "@client/components/ui/badge";
import { Button } from "@client/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@client/components/ui/dialog";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { Textarea } from "@client/components/ui/textarea";
import { trpc, trpcClient } from "@client/lib/trpc-client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Globe,
	List,
	Lock,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const createListSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title is too long"),
	description: z.string().optional(),
	type: z.enum([
		"todo",
		"movie",
		"shopping",
		"travel",
		"reading",
		"gaming",
		"bucket",
		"recipe",
		"challenge",
		"gift",
		"ranking",
	]),
	isPublic: z.boolean(),
	quickStartItems: z.string().optional(),
});

type CreateListForm = z.infer<typeof createListSchema>;

interface CreateListModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const listTypes = [
	{
		value: "travel",
		label: "Travel",
		emoji: "✈️",
		description: "Places and travel planning",
		color: "from-blue-400 to-blue-600",
		features: ["Notes", "Images", "Location", "Date", "Priority", "Price"],
	},
	{
		value: "reading",
		label: "Books",
		emoji: "📚",
		description: "Books and reading progress",
		color: "from-green-400 to-green-600",
		features: ["Progress", "Rating", "Author"],
	},
	{
		value: "movie",
		label: "Movies",
		emoji: "🎬",
		description: "Films to watch and ratings",
		color: "from-purple-400 to-purple-600",
		features: ["Ratings", "Genre", "Watch status"],
	},
	{
		value: "recipe",
		label: "Food",
		emoji: "🍽️",
		description: "Cooking recipes and ingredients",
		color: "from-orange-400 to-orange-600",
		features: ["Ingredients", "Time", "Difficulty"],
	},
	{
		value: "shopping",
		label: "Shopping",
		emoji: "🛒",
		description: "Items to buy and stores",
		color: "from-pink-400 to-pink-600",
		features: ["Quantity", "Price", "Store"],
	},
	{
		value: "gaming",
		label: "Gaming",
		emoji: "🎮",
		description: "Games to play and completed",
		color: "from-indigo-400 to-indigo-600",
		features: ["Platform", "Progress", "Rating"],
	},
	{
		value: "todo",
		label: "Tasks",
		emoji: "✅",
		description: "Tasks and daily organization",
		color: "from-cyan-400 to-cyan-600",
		features: ["Priority", "Due dates", "Categories"],
	},
	{
		value: "bucket",
		label: "Goals",
		emoji: "🎯",
		description: "Life goals and aspirations",
		color: "from-red-400 to-red-600",
		features: ["Priority", "Target date", "Status"],
	},
	{
		value: "gift",
		label: "Custom",
		emoji: "💡",
		description: "Create your own list type",
		color: "from-gray-400 to-gray-600",
		features: ["Flexible", "Customizable", "Adaptable"],
	},
	// Hidden by default
	{
		value: "challenge",
		label: "Challenges",
		emoji: "🏆",
		description: "Personal challenges and goals",
		color: "from-yellow-400 to-yellow-600",
		features: ["Progress", "Deadline", "Reward"],
	},
	{
		value: "ranking",
		label: "Rankings",
		emoji: "🏅",
		description: "Ranked lists and comparisons",
		color: "from-teal-400 to-teal-600",
		features: ["Rank", "Score", "Criteria"],
	},
];

export function CreateListModal({ open, onOpenChange }: CreateListModalProps) {
	const [selectedType, setSelectedType] = useState<string>("");
	const [showAllTypes, setShowAllTypes] = useState(false);
	const queryClient = useQueryClient();

	const createListMutation = useMutation({
		mutationFn: async (data: CreateListForm) => {
			const selectedTypeData = listTypes.find((t) => t.value === selectedType);

			return trpcClient.lists.createList.mutate({
				title: data.title,
				description: data.description,
				type: data.type,
				isPublic: data.isPublic,
				metadata: {
					emoji: selectedTypeData?.emoji,
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["lists"] });
			toast.success("🎉 List created successfully!", {
				description: "Your new list is ready to be filled!",
			});
			onOpenChange(false);
			form.reset();
			setSelectedType("");
			setShowAllTypes(false);
		},
		onError: (error) => {
			toast.error("❌ Error", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			isPublic: false,
			quickStartItems: "",
		},
		onSubmit: async ({ value }) => {
			const validation = createListSchema.safeParse({
				...value,
				type: selectedType || "todo", // Default to todo if no type selected
			});

			if (!validation.success) {
				const firstError = validation.error.errors[0];
				toast.error("❌ Validation", {
					description: firstError.message,
				});
				return;
			}

			createListMutation.mutate(validation.data);
		},
	});

	const handleQuickCreate = () => {
		form.handleSubmit();
	};

	const handleClose = () => {
		onOpenChange(false);
		form.reset();
		setSelectedType("");
		setShowAllTypes(false);
	};

	const visibleTypes = showAllTypes ? listTypes : listTypes.slice(0, 9);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto rounded-lg">
				<DialogClose onClose={handleClose} />
				<div className="space-y-4">
					<div className="space-y1">
						<DialogTitle className="font-semibold text-gray-900 text-xl">
							Create a new list
						</DialogTitle>
						<DialogDescription className="text-gray-600 text-sm">
							Get started quickly - you can add more details later
						</DialogDescription>
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
								{visibleTypes.map((type) => (
									<button
										key={type.value}
										type="button"
										onClick={() => setSelectedType(type.value)}
										className={`group relative rounded-lg border-2 p-4 text-left transition-all duration-200 hover:shadow-md ${
											selectedType === type.value
												? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg"
												: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
										}`}
									>
										{selectedType === type.value && (
											<div className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
												<CheckCircle2 className="h-4 w-4 text-white" />
											</div>
										)}
										<div className="flex items-start gap-3">
											<div
												className={`h-10 w-10 bg-gradient-to-br ${type.color} flex items-center justify-center rounded-lg text-xl shadow-sm`}
											>
												{type.emoji}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="mb-1 font-semibold text-base text-gray-900 leading-tight">
													{type.label}
												</h3>
												<p className="mb-2 text-gray-600 text-sm leading-relaxed">
													{type.description}
												</p>
												<div className="flex flex-wrap gap-1">
													{type.features.slice(0, 3).map((feature) => (
														<span
															key={feature}
															className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600 text-xs"
														>
															{feature}
														</span>
													))}
												</div>
											</div>
										</div>
									</button>
								))}
								{!showAllTypes && listTypes.length > 9 && (
									<button
										type="button"
										onClick={() => setShowAllTypes(true)}
										className="group relative rounded-lg border-2 border-gray-200 p-4 text-center transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
									>
										<div className="flex h-full flex-col items-center justify-center">
											<ChevronDown className="mb-2 h-8 w-8 text-gray-400" />
											<div className="font-medium text-gray-600 text-sm">
												Show More
											</div>
											<div className="text-gray-500 text-xs">
												+{listTypes.length - 9} templates
											</div>
										</div>
									</button>
								)}
							</div>
							{showAllTypes && (
								<div className="text-center">
									<button
										type="button"
										onClick={() => setShowAllTypes(false)}
										className="inline-flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800"
									>
										<ChevronUp className="h-4 w-4" />
										Show Less
									</button>
								</div>
							)}
						</div>

						{/* List Details */}
						<div className="space-y-4">
							<form.Field name="title">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor="title"
											className="font-medium text-gray-900 text-sm"
										>
											List Title *
										</Label>
										<Input
											id="title"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter your list title..."
											className="h-10 rounded-lg border border-gray-300 text-sm focus:border-blue-500"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="description">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor="description"
											className="font-medium text-gray-900 text-sm"
										>
											Description (optional)
										</Label>
										<Textarea
											id="description"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="What's this list about?"
											className="min-h-[60px] resize-none rounded-lg border border-gray-300 text-sm focus:border-blue-500"
											rows={2}
										/>
									</div>
								)}
							</form.Field>
						</div>

						{/* Quick Start */}
						<div className="space-y-4">
							<form.Field name="quickStartItems">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor="quickStartItems"
											className="font-medium text-gray-900 text-sm"
										>
											Quick Start (optional)
										</Label>
										<div className="mb-2 text-gray-600 text-xs">
											Add a few items to get started (one per line):
										</div>
										<Textarea
											id="quickStartItems"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder={
												selectedType === "travel"
													? "Tokyo, Japan\nParis, France\nBali, Indonesia"
													: "Item 1\nItem 2\nItem 3"
											}
											className="min-h-[80px] resize-none rounded-lg border border-gray-300 font-mono text-sm focus:border-blue-500"
											rows={4}
										/>
										<div className="text-gray-500 text-xs">
											You can add more details, images, and organize items later
										</div>
									</div>
								)}
							</form.Field>
						</div>

						{/* Public Toggle */}
						<div className="space-y-4">
							<form.Field name="isPublic">
								{(field) => (
									<div className="flex items-center justify-between py-2">
										<div className="flex items-center gap-2">
											<Globe className="h-4 w-4 text-gray-500" />
											<div>
												<div className="font-medium text-gray-900 text-sm">
													Make list public
												</div>
												<div className="text-gray-500 text-xs">
													Others can discover and view your list
												</div>
											</div>
										</div>
										<label className="relative inline-flex cursor-pointer items-center">
											<input
												type="checkbox"
												checked={field.state.value}
												onChange={(e) => field.handleChange(e.target.checked)}
												className="peer sr-only"
											/>
											<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
										</label>
									</div>
								)}
							</form.Field>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 border-t pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								disabled={createListMutation.isPending}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={handleQuickCreate}
								disabled={createListMutation.isPending}
								className="flex-1"
							>
								⚡ Quick Create
							</Button>
							<Button
								type="submit"
								className="flex-1 bg-green-500 text-white hover:bg-green-600"
								disabled={createListMutation.isPending}
							>
								{createListMutation.isPending ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Creating...
									</div>
								) : (
									<div className="flex items-center gap-2">
										Create & Edit
										<span className="ml-1">→</span>
									</div>
								)}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
