"use client";

import React from "react";
import Link from "next/link";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty";
import { Button } from "@workspace/ui/components/button";
import { useSession } from "@/lib/auth-client";
import { User } from "lucide-react";

export default function ProfileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = useSession();
    const user = session?.data?.user;

    // Show loading state
    if (session?.isPending) {
        return (
            <div className="flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    // Show empty state if not authenticated
    if (!user) {
        return (
            <main className=" bg-background py-8">
                <div className="max-w-frame mx-auto px-4 xl:px-0">
                    <div className="mx-auto max-w-2xl">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <User className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>Not Signed In</EmptyTitle>
                                <EmptyDescription>
                                    You need to sign in to view and edit your profile information.
                                </EmptyDescription>
                            </EmptyHeader>
                            <div className="flex gap-4 justify-center">
                                <Button asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                            </div>
                        </Empty>
                    </div>
                </div>
            </main>
        );
    }

    // Render children if authenticated
    return <>{children}</>;
}
