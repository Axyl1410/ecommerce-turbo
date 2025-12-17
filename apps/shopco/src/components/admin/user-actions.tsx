"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { admin } from "@/lib/auth-client";
import { toast } from "sonner";

type UserActionsProps = {
	userId: string;
	actionType: "ban" | "unban" | "delete" | "setRole" | "setPassword";
	onClose: () => void;
	onBan: () => void;
	onUnban: () => void;
	onDelete: () => void;
	onSetRole: (role: string) => void;
	onSetPassword?: (password: string) => void;
};

export default function UserActions({
	userId,
	actionType,
	onClose,
	onBan,
	onUnban,
	onDelete,
	onSetRole,
	onSetPassword,
}: UserActionsProps) {
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<string>("user");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");

	// Set role mutation
	const setRoleMutation = useMutation({
		mutationFn: async (role: string) => {
			const result = await admin.setRole({
				userId,
				role: role as "user" | "admin",
			});
			if (result?.error) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: () => {
			toast.success("User role updated successfully");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update user role");
		},
	});

	const handleSetRole = () => {
		setRoleMutation.mutate(selectedRole);
	};

	const handleSetPassword = () => {
		if (!password || password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (onSetPassword) {
			onSetPassword(password);
		}
	};

	if (actionType === "delete") {
		return (
			<AlertDialog open onOpenChange={onClose}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user account and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	if (actionType === "ban") {
		return (
			<AlertDialog open onOpenChange={onClose}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Ban User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to ban this user? They will not be able to
							access their account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={onBan}>Ban User</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	if (actionType === "unban") {
		return (
			<AlertDialog open onOpenChange={onClose}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unban User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unban this user? They will be able to
							access their account again.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={onUnban}>Unban User</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	if (actionType === "setRole") {
		return (
			<Dialog open onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set User Role</DialogTitle>
						<DialogDescription>
							Change the role of this user. Admin users have full access to the
							admin panel.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<Select value={selectedRole} onValueChange={setSelectedRole}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							onClick={handleSetRole}
							disabled={setRoleMutation.isPending}
						>
							{setRoleMutation.isPending ? "Updating..." : "Update Role"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	if (actionType === "setPassword") {
		return (
			<Dialog open onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set User Password</DialogTitle>
						<DialogDescription>
							Set a new password for this user. The password must be at least 6
							characters long.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">New Password</label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter new password"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Confirm Password</label>
							<Input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={handleSetPassword}>Set Password</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return null;
}

