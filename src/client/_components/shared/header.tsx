import { useSession } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/_components/shared/theme-toggle";
import { SignOutButton } from "./sign-out-button";

export default function Header() {
	const { data: session } = useSession();

	const links = session
		? [
				{ to: "/", label: "Home" },
				{ to: "/guestbook", label: "Guestbook" },
				{ to: "/profile", label: "Profile" },
			]
		: [
				{ to: "/", label: "Home" },
				{ to: "/sign-in", label: "Sign In" },
			];

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					{session && <SignOutButton />}
					<ThemeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
