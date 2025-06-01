import { Badge } from "@client/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@client/components/ui/card";
import { Link } from "@tanstack/react-router";

interface ListCardProps {
	id: string;
	title: string;
	description?: string;
	type: string;
	metadata?: {
		color?: string;
		emoji?: string;
		tags?: string[];
	};
	itemCount?: number;
	isPublic?: boolean;
	updatedAt: Date;
}

const typeConfig = {
	todo: { label: "To-Do", emoji: "📝", color: "bg-blue-100 text-blue-800" },
	movie: {
		label: "Films",
		emoji: "🎥",
		color: "bg-purple-100 text-purple-800",
	},
	shopping: {
		label: "Courses",
		emoji: "🛒",
		color: "bg-green-100 text-green-800",
	},
	travel: {
		label: "Voyage",
		emoji: "🗺️",
		color: "bg-orange-100 text-orange-800",
	},
	reading: {
		label: "Lecture",
		emoji: "📚",
		color: "bg-amber-100 text-amber-800",
	},
	gaming: {
		label: "Jeux",
		emoji: "🎮",
		color: "bg-indigo-100 text-indigo-800",
	},
	bucket: { label: "Objectifs", emoji: "🎯", color: "bg-red-100 text-red-800" },
	recipe: {
		label: "Recettes",
		emoji: "🍽️",
		color: "bg-yellow-100 text-yellow-800",
	},
	challenge: {
		label: "Défis",
		emoji: "🏆",
		color: "bg-pink-100 text-pink-800",
	},
	gift: { label: "Cadeaux", emoji: "🎁", color: "bg-rose-100 text-rose-800" },
	ranking: {
		label: "Classement",
		emoji: "🏅",
		color: "bg-cyan-100 text-cyan-800",
	},
};

export function ListCard({
	id,
	title,
	description,
	type,
	metadata,
	itemCount = 0,
	isPublic = false,
	updatedAt,
}: ListCardProps) {
	const config = typeConfig[type as keyof typeof typeConfig] || {
		label: type,
		emoji: "📋",
		color: "bg-gray-100 text-gray-800",
	};

	const displayEmoji = metadata?.emoji || config.emoji;

	return (
		<div className="group block cursor-pointer">
			<Card className="h-full transition-all duration-200 hover:scale-105 hover:shadow-md">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<span className="text-2xl">{displayEmoji}</span>
							<div>
								<CardTitle className="text-lg group-hover:text-[#d97706]">
									{title}
								</CardTitle>
								<Badge variant="secondary" className={config.color}>
									{config.label}
								</Badge>
							</div>
						</div>
						{isPublic && (
							<Badge variant="outline" className="text-xs">
								Public
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{description && (
						<p className="mb-3 line-clamp-2 text-gray-600 text-sm">
							{description}
						</p>
					)}
					<div className="flex items-center justify-between text-gray-500 text-xs">
						<span>
							{itemCount} élément{itemCount !== 1 ? "s" : ""}
						</span>
						<span>Modifié {new Date(updatedAt).toLocaleDateString()}</span>
					</div>
					{metadata?.tags && metadata.tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1">
							{metadata.tags.slice(0, 3).map((tag) => (
								<Badge key={tag} variant="outline" className="text-xs">
									{tag}
								</Badge>
							))}
							{metadata.tags.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{metadata.tags.length - 3}
								</Badge>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
