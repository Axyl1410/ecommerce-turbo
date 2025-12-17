"use client";

import Link from "next/link";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Edit, Ban, Trash2, Shield } from "lucide-react";
import type { admin } from "@/lib/auth-client";

type User = NonNullable<
	Awaited<ReturnType<typeof admin.listUsers>>["data"]
>["users"][number];

type UserTableProps = {
	users: User[];
	onBan?: (userId: string) => void;
	onUnban?: (userId: string) => void;
	onDelete?: (userId: string) => void;
	onSetRole?: (userId: string) => void;
};

export default function UserTable({
	users,
	onBan,
	onUnban,
	onDelete,
	onSetRole,
}: UserTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Created At</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6} className="text-center text-muted-foreground">
							No users found
						</TableCell>
					</TableRow>
				) : (
					users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<Badge variant={user.role === "admin" ? "default" : "secondary"}>
									{user.role ?? "user"}
								</Badge>
							</TableCell>
							<TableCell>
								{user.banned ? (
									<Badge variant="destructive">Banned</Badge>
								) : (
									<Badge variant="outline">Active</Badge>
								)}
							</TableCell>
							<TableCell>
								{new Date(user.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="size-4" />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem asChild>
											<Link href={`/admin/users/${user.id}`}>
												<Edit className="mr-2 size-4" />
												Edit
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onSetRole?.(user.id)}
										>
											<Shield className="mr-2 size-4" />
											Set Role
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										{user.banned ? (
											<DropdownMenuItem
												onClick={() => onUnban?.(user.id)}
											>
												<Ban className="mr-2 size-4" />
												Unban
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem onClick={() => onBan?.(user.id)}>
												<Ban className="mr-2 size-4" />
												Ban
											</DropdownMenuItem>
										)}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete?.(user.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 size-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}

