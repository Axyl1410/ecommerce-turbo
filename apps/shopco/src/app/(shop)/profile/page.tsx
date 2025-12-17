"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { useSession } from "@/lib/auth-client";
import ProfileForm from "@/components/profile-form";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export default function ProfilePage() {
	const session = useSession();
	const user = session?.data?.user;

	// Layout handles authentication check, so we can assume user exists here
	if (!user) {
		return null;
	}

	return (
		<main className=" bg-background py-8">
			<div className="max-w-frame mx-auto px-4 xl:px-0">
				<div className="mx-auto max-w-2xl">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-4">
								<Avatar className="size-16">
									<AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
									<AvatarFallback className="text-lg">
										{user.name ? getInitials(user.name) : "U"}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-2xl">Profile Settings</CardTitle>
									<CardDescription>
										Manage your account information and preferences
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<ProfileForm />
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}

