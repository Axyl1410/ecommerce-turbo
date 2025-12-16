/** biome-ignore-all lint/a11y/noSvgWithoutTitle: SVG icons are decorative and don't need titles */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const newPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			),
		confirmPassword: z.string().min(8, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

const NewPasswordForm = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const token = searchParams.get("token");

	const form = useForm<NewPasswordFormData>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: NewPasswordFormData) => {
		if (!token) {
			toast.error("No reset token found. Please request a new password reset.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token: token,
			});

			if (result.error) {
				toast.error(result.error.message);
				return;
			}

			setIsSuccess(true);
			toast.success(
				"Your password has been updated. You can now sign in with your new password.",
			);

			// Redirect to sign in after 2 seconds
			setTimeout(() => {
				router.push("/sign-in");
			}, 2000);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<svg
						className="h-6 w-6 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-medium">
						Password Updated Successfully!
					</h3>
					<p className="text-sm text-muted-foreground">
						Your password has been reset. Redirecting to sign in...
					</p>
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => router.push("/sign-in")}
				>
					Go to Sign In
				</Button>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
					<svg
						className="h-6 w-6 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-medium">Invalid Reset Link</h3>
					<p className="text-sm text-muted-foreground">
						This password reset link is invalid or has expired. Please request a
						new one.
					</p>
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => router.push("/reset-password")}
				>
					Request New Reset Link
				</Button>
			</div>
		);
	}

	return (
		<Form {...(form as any)}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					// Cast to align react-hook-form types between app and UI package
					control={form.control as any}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="Enter your new password"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					// Cast to align react-hook-form types between app and UI package
					control={form.control as any}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm New Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="Confirm your new password"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-2 text-xs text-muted-foreground">
					<p>Password requirements:</p>
					<ul className="list-inside list-disc space-y-1">
						<li>At least 8 characters</li>
						<li>One uppercase letter</li>
						<li>One lowercase letter</li>
						<li>One number</li>
					</ul>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Updating Password..." : "Update Password"}
				</Button>
			</form>
		</Form>
	);
};

export default NewPasswordForm;
