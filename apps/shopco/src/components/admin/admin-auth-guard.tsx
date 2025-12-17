"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@workspace/ui/components/empty";
import { Button } from "@workspace/ui/components/button";
import { User, ShieldAlert } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function AdminAuthGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = useSession();
	const router = useRouter();
	const user = session?.data?.user;

	// Show loading state
	if (session?.isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>Loading...</p>
			</div>
		);
	}

	// Show empty state if not authenticated
	if (!user) {
		return (
			<main className="bg-background py-8">
				<div className="max-w-frame mx-auto px-4 xl:px-0">
					<div className="mx-auto max-w-2xl">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<User className="size-6" />
								</EmptyMedia>
								<EmptyTitle>Not Authenticated</EmptyTitle>
								<EmptyDescription>
									You need to sign in to access the admin panel.
								</EmptyDescription>
							</EmptyHeader>
							<div className="flex gap-4 justify-center">
								<Button asChild>
									<Link href="/sign-in">Sign In</Link>
								</Button>
								<Button asChild variant="outline">
									<Link href="/">Go Home</Link>
								</Button>
							</div>
						</Empty>
					</div>
				</div>
			</main>
		);
	}

	// Show empty state if not admin
	if (user.role !== "admin") {
		return (
			<main className="bg-background py-8">
				<div className="max-w-frame mx-auto px-4 xl:px-0">
					<div className="mx-auto max-w-2xl">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<ShieldAlert className="size-6" />
								</EmptyMedia>
								<EmptyTitle>Access Denied</EmptyTitle>
								<EmptyDescription>
									You don't have permission to access this page. Admin role is
									required.
								</EmptyDescription>
							</EmptyHeader>
							<div className="flex gap-4 justify-center">
								<Button asChild>
									<Link href="/">Go Home</Link>
								</Button>
								<Button asChild variant="outline">
									<Link href="/profile">View Profile</Link>
								</Button>
							</div>
						</Empty>
					</div>
				</div>
			</main>
		);
	}

	// Render children if authenticated and authorized
	return <>{children}</>;
}

