"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { admin } from "@/lib/auth-client";
import UserTable from "@/components/admin/user-table";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import UserActions from "@/components/admin/user-actions";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [searchValue, setSearchValue] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [bannedFilter, setBannedFilter] = useState<string>("all");
	const [actionUserId, setActionUserId] = useState<string | null>(null);
	const [actionType, setActionType] = useState<
		"ban" | "unban" | "delete" | "setRole" | null
	>(null);

	const offset = (page - 1) * ITEMS_PER_PAGE;

	// Fetch users
	const { data, isLoading, error } = useQuery({
		queryKey: [
			"admin-users",
			page,
			searchValue,
			roleFilter,
			bannedFilter,
		],
		queryFn: async () => {
			const result = await admin.listUsers({
				query: {
					limit: ITEMS_PER_PAGE,
					offset,
					searchValue: searchValue || undefined,
					searchField: "email",
					sortBy: "createdAt",
					sortDirection: "desc",
				},
			});

			if (result?.error) {
				throw new Error(result.error.message);
			}

			let users = result?.data?.users ?? [];

			// Apply role filter
			if (roleFilter !== "all") {
				users = users.filter((user) => user.role === roleFilter);
			}

			// Apply banned filter
			if (bannedFilter === "banned") {
				users = users.filter((user) => user.banned);
			} else if (bannedFilter === "active") {
				users = users.filter((user) => !user.banned);
			}

			return {
				users,
				total: result?.data?.total ?? 0,
			};
		},
	});

	const users = data?.users ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

	// Ban user mutation
	const banMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await admin.banUser({
				userId,
				banReason: "Banned by admin",
			});
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User banned successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setActionUserId(null);
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to ban user");
		},
	});

	// Unban user mutation
	const unbanMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await admin.unbanUser({ userId });
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User unbanned successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setActionUserId(null);
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unban user");
		},
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await admin.removeUser({ userId });
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setActionUserId(null);
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete user");
		},
	});

	const handleBan = (userId: string) => {
		setActionUserId(userId);
		setActionType("ban");
	};

	const handleUnban = (userId: string) => {
		setActionUserId(userId);
		setActionType("unban");
	};

	const handleDelete = (userId: string) => {
		setActionUserId(userId);
		setActionType("delete");
	};

	const handleSetRole = (userId: string) => {
		setActionUserId(userId);
		setActionType("setRole");
	};

	const handleSearch = (value: string) => {
		setSearchValue(value);
		setPage(1); // Reset to first page on search
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Users</h1>
				<p className="text-muted-foreground">
					Manage users and their permissions
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
					<CardDescription>
						Search, filter, and manage users in the system
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search and Filters */}
					<div className="flex flex-col gap-4 md:flex-row">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by email..."
								value={searchValue}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-9"
							/>
						</div>
						<div className="flex gap-2">
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger className="w-[140px]">
									<Filter className="mr-2 size-4" />
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
							<Select value={bannedFilter} onValueChange={setBannedFilter}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="banned">Banned</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* User Table */}
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading users...
						</div>
					) : error ? (
						<div className="text-center py-8 text-destructive">
							Error loading users: {error instanceof Error ? error.message : "Unknown error"}
						</div>
					) : (
						<>
							<UserTable
								users={users}
								onBan={handleBan}
								onUnban={handleUnban}
								onDelete={handleDelete}
								onSetRole={handleSetRole}
							/>

							{/* Pagination */}
							{totalPages > 1 && (
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() => setPage((p) => Math.max(1, p - 1))}
												className={
													page === 1
														? "pointer-events-none opacity-50"
														: "cursor-pointer"
												}
											/>
										</PaginationItem>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(pageNum) => (
												<PaginationItem key={pageNum}>
													<PaginationLink
														onClick={() => setPage(pageNum)}
														isActive={page === pageNum}
														className="cursor-pointer"
													>
														{pageNum}
													</PaginationLink>
												</PaginationItem>
											)
										)}
										<PaginationItem>
											<PaginationNext
												onClick={() =>
													setPage((p) => Math.min(totalPages, p + 1))
												}
												className={
													page === totalPages
														? "pointer-events-none opacity-50"
														: "cursor-pointer"
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Action Dialogs */}
			{actionUserId && actionType && (
				<UserActions
					userId={actionUserId}
					actionType={actionType}
					onClose={() => {
						setActionUserId(null);
						setActionType(null);
					}}
					onBan={() => banMutation.mutate(actionUserId)}
					onUnban={() => unbanMutation.mutate(actionUserId)}
					onDelete={() => deleteMutation.mutate(actionUserId)}
					onSetRole={(role) => {
						// Will be handled in UserActions component
					}}
				/>
			)}
		</div>
	);
}

