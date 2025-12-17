"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function UserDropdown() {
    const session = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const user = session?.data?.user;

    const handleLogout = async () => {
        setLoading(true);
        try {
            const { error } = await authClient.signOut();
            if (error) {
                toast.error(error.message || "Failed to sign out");
            } else {
                toast.success("Signed out");
                router.push("/sign-in");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign out";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="p-0 outline-none focus:outline-none">
                {user ? (
                    <Avatar className="size-[30px]">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                        <AvatarFallback className="text-[10px]">
                            {user.name ? getInitials(user.name) : "U"}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <Image
                        priority
                        src="/icons/user.svg"
                        height={100}
                        width={100}
                        alt="user"
                        className="max-w-[22px] max-h-[22px]"
                    />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {user ? (
                    <>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user.name ?? "User"}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer">
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/wishlist" className="cursor-pointer">
                                Wishlist
                            </Link>
                        </DropdownMenuItem>
                        {(user as { role?: string })?.role === "admin" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/admin" className="cursor-pointer">
                                        Admin Panel
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            disabled={loading}
                            className="cursor-pointer"
                        >
                            {loading ? "Signing out..." : "Sign out"}
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/sign-in" className="cursor-pointer">
                                Sign in
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/sign-up" className="cursor-pointer">
                                Sign up
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

