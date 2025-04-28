import { Github } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/_components/shared/theme-toggle";
import { Button } from "@/_components/ui/button";
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
				{ to: "/sign-in", label: "Login" },
			];

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-1">
					{links.map(({ to, label }) => {
						return (
							<Button key={to} className="text-lg" variant="ghost" asChild>
								<Link to={to}>{label}</Link>
							</Button>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					{session && <SignOutButton />}
					<Button variant="outline" size="icon" asChild>
						<a
							href="https://github.com/oscarhernandeziv/better-cloud/tree/main"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="View source code on GitHub"
						>
							<Github className="h-5 w-5" />
						</a>
					</Button>
					<ThemeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
