import { authClient } from "@client/lib/auth-client";
import { Link } from "@tanstack/react-router";

export function Header() {
	const { data: session } = authClient.useSession();

	const navigationLinks = [
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/my-lists", label: "My Lists" },
		{ to: "/challenges", label: "Challenges" },
		{ to: "/leaderboard", label: "Leaderboards" },
	];

	return (
		<header className="border-gray-200 border-b bg-white px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-8">
					<Link to="/" className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d97706]">
							<span className="font-bold text-lg text-white">✓</span>
						</div>
						<span className="font-semibold text-gray-900 text-xl">
							BetterList
						</span>
					</Link>

					<nav className="flex items-center space-x-6">
						{navigationLinks.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className="font-medium text-gray-700 transition-colors hover:text-[#d97706]"
								activeProps={{
									className: "text-[#d97706] font-medium",
								}}
							>
								{label}
							</Link>
						))}
					</nav>
				</div>

				<div className="flex items-center space-x-4">
					{session ? (
						<>
							<div className="flex items-center space-x-2 rounded-full bg-[#fffbeb] px-3 py-1">
								<div className="h-3 w-3 rounded-full bg-yellow-400" />
								<span className="font-medium text-gray-900 text-sm">
									1,247 points
								</span>
							</div>

							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
								<span className="font-medium text-gray-600 text-sm">
									{session.user?.email?.charAt(0).toUpperCase()}
								</span>
							</div>
						</>
					) : (
						<Link
							to="/sign-in"
							className="rounded-lg bg-[#d97706] px-4 py-2 font-medium text-white transition-colors hover:bg-[#b45309]"
						>
							Sign In
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
