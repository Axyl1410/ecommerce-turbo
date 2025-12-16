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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		setIsLoading(true);

		try {
			const result = await authClient.requestPasswordReset({
				email: data.email,
			});

			if (result.error) {
				toast.error(result.error.message);
				return;
			}

			setIsSubmitted(true);
			toast.success("Please check your email for reset instructions.");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
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
					<h3 className="text-lg font-medium">Check your email</h3>
					<p className="text-sm text-muted-foreground">
						We've sent you a password reset link. Please check your email and
						follow the instructions.
					</p>
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => setIsSubmitted(false)}
				>
					Send another email
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
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter your email address"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Sending..." : "Send Reset Link"}
				</Button>
			</form>
		</Form>
	);
};

export default ResetPasswordForm;
