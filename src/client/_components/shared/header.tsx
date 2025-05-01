import { ChevronDown, Github } from "lucide-react";
import { useState } from "react";

import { useSession } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/_components/shared/theme-toggle";
import { Button } from "@/_components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";

export default function Header() {
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);

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
				{/* Mobile Navigation Menu */}
				<div className="md:hidden">
					<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="flex items-center gap-1 text-lg"
							>
								Menu
								<ChevronDown
									className={`h-4 w-4 transition-transform duration-200 ${
										isOpen ? "rotate-180" : ""
									}`}
								/>
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							{links.map(({ to, label }) => (
								<DropdownMenuItem key={to} asChild className="text-lg">
									<Link to={to} className="w-full">
										{label}
									</Link>
								</DropdownMenuItem>
							))}
							{session && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<SignOutButton />
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-1 md:flex">
					{links.map(({ to, label }) => (
						<Button key={to} className="text-lg" variant="ghost" asChild>
							<Link to={to}>{label}</Link>
						</Button>
					))}
				</nav>

				<div className="flex items-center gap-2">
					{/* Desktop Sign Out Button */}
					{session && (
						<div className="hidden md:block">
							<SignOutButton />
						</div>
					)}
					{/* GitHub and ThemeToggle remain visible */}
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
