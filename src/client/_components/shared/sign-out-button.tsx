import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

export function SignOutButton() {
	return (
		<Button variant="outline" onClick={() => authClient.signOut()}>
			Sign Out
		</Button>
	);
}
