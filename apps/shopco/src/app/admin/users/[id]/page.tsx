"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { admin } from "@/lib/auth-client";
import { apiClient } from "@/lib/api";
import UserForm from "@/components/admin/user-form";
import UserActions from "@/components/admin/user-actions";
import { toast } from "sonner";
import { ArrowLeft, Key, Trash2, Ban } from "lucide-react";
import { useState } from "react";

type UserDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default function UserDetailPage({ params }: UserDetailPageProps) {
	const { id } = use(params);
	const router = useRouter();
	const queryClient = useQueryClient();
	const [actionType, setActionType] = useState<
		"ban" | "unban" | "delete" | "setPassword" | null
	>(null);

	// Fetch user details
	const { data: userData, isLoading } = useQuery({
		queryKey: ["admin-user", id],
		queryFn: async () => {
			const result = await admin.listUsers({
				query: {
					limit: 1,
					offset: 0,
					filterField: "id",
					filterValue: id,
					filterOperator: "eq",
				},
			});

			if (result?.error) {
				throw new Error(result.error.message);
			}

			const user = result?.data?.users?.[0];
			if (!user) {
				throw new Error("User not found");
			}

			return user;
		},
	});

	// Fetch user accounts to check if user has password account
	const { data: accountsData } = useQuery({
		queryKey: ["admin-user-accounts", id],
		queryFn: async () => {
			try {
				const response = await apiClient.get<{
					data: {
						accounts: Array<{
							id: string;
							providerId: string;
							accountId: string;
							createdAt: string;
						}>;
					};
				}>(`/api/v1/admin/users/${id}/accounts`);
				return response.data.data.accounts || [];
			} catch (error) {
				// If API doesn't exist or fails, return empty array
				return [];
			}
		},
		enabled: !!userData, // Only fetch when user data is loaded
	});

	// Check if user has password account (providerId === "credential")
	const hasPasswordAccount = accountsData?.some(
		(account: { providerId: string }) => account.providerId === "credential"
	) ?? false;

	const user = userData;

	// Update user mutation
	const updateMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			image?: string;
			role: "user" | "admin";
		}) => {
			const updateResult = await admin.updateUser({
				userId: id,
				data: {
					name: values.name,
					image: values.image || undefined,
				},
			});

			if (updateResult?.error) {
				throw new Error(updateResult.error.message);
			}

			// Update role if changed
			if (values.role !== user?.role) {
				const roleResult = await admin.setRole({
					userId: id,
					role: values.role,
				});

				if (roleResult?.error) {
					throw new Error(roleResult.error.message);
				}
			}
		},
		onSuccess: () => {
			toast.success("User updated successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update user");
		},
	});

	// Set password mutation
	const setPasswordMutation = useMutation({
		mutationFn: async (newPassword: string) => {
			const result = await admin.setUserPassword({
				userId: id,
				newPassword,
			});

			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("Password updated successfully");
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update password");
		},
	});

	// Ban/Unban mutations
	const banMutation = useMutation({
		mutationFn: async (banReason: string) => {
			const result = await admin.banUser({
				userId: id,
				banReason,
			});
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User banned successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to ban user");
		},
	});

	const unbanMutation = useMutation({
		mutationFn: async () => {
			const result = await admin.unbanUser({ userId: id });
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User unbanned successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setActionType(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unban user");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const result = await admin.removeUser({ userId: id });
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User deleted successfully");
			router.push("/admin/users");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete user");
		},
	});

	const handleSubmit = async (values: {
		name: string;
		email: string;
		image?: string;
		role: "user" | "admin";
	}) => {
		await updateMutation.mutateAsync({
			name: values.name,
			image: values.image,
			role: values.role,
		});
	};

	if (isLoading) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Loading user...
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-8 text-destructive">
				User not found
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/admin/users">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
					<p className="text-muted-foreground">
						Manage user information and permissions
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>
						Update user details and role
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UserForm
						user={user}
						onSubmit={handleSubmit}
						isLoading={updateMutation.isPending}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
					<CardDescription>
						Manage user account and permissions
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					{hasPasswordAccount && (
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => setActionType("setPassword")}
						>
							<Key className="mr-2 size-4" />
							Set Password
						</Button>
					)}
					{user.banned ? (
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => setActionType("unban")}
						>
							<Ban className="mr-2 size-4" />
							Unban User
						</Button>
					) : (
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => setActionType("ban")}
						>
							<Ban className="mr-2 size-4" />
							Ban User
						</Button>
					)}
					<Button
						variant="destructive"
						className="w-full justify-start"
						onClick={() => setActionType("delete")}
					>
						<Trash2 className="mr-2 size-4" />
						Delete User
					</Button>
				</CardContent>
			</Card>

			{/* Action Dialogs */}
			{actionType && (
				<UserActions
					userId={id}
					actionType={actionType}
					onClose={() => setActionType(null)}
					onBan={(banReason) => banMutation.mutate(banReason)}
					onUnban={() => unbanMutation.mutate()}
					onDelete={() => deleteMutation.mutate()}
					onSetRole={(role) => {
						// This is handled in UserActions component
					}}
					onSetPassword={(password) => {
						setPasswordMutation.mutate(password);
					}}
				/>
			)}
		</div>
	);
}

