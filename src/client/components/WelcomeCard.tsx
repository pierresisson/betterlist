import { Avatar, AvatarFallback } from "@client/components/ui/avatar";
import { Card, CardContent } from "@client/components/ui/card";
import { trpc } from "@client/lib/trpc-client";
import { useQuery } from "@tanstack/react-query";

interface WelcomeCardProps {
	userName?: string;
	activeChallenges?: number;
	newCollaborations?: number;
	currentStreak?: number;
}

export function WelcomeCard({
	activeChallenges = 2,
	newCollaborations = 3,
	currentStreak = 7,
}: WelcomeCardProps) {
	const userName = useQuery(trpc.user.getUserName.queryOptions());
	return (
		<Card
			className="border-betterlist-primary/20 bg-betterlist-badge-yellow"
			style={{ borderRadius: "0.5rem" }}
		>
			<CardContent className="px-4 py-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div>
							<h1 className="mb-1 font-bold text-betterlist-dark text-xl">
								Welcome back, {userName.isLoading ? "..." : userName.data}!
							</h1>
							<p className="text-betterlist-dark/70 text-sm">
								You have {activeChallenges} active challenges and{" "}
								{newCollaborations} new collaborations
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="text-right">
							<p className="text-betterlist-dark/60 text-xs">Current streak</p>
							<p className="font-bold text-betterlist-primary text-xl">
								{currentStreak} days
							</p>
						</div>
						<div
							className="bg-betterlist-primary p-2.5"
							style={{ borderRadius: "50%" }}
						>
							<svg
								className="h-5 w-5 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								aria-label="Lightning bolt"
							>
								<title>Lightning bolt</title>
								<path
									fillRule="evenodd"
									d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
