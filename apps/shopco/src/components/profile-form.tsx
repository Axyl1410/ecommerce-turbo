"use client";

import React from "react";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient, useSession } from "@/lib/auth-client";

const profileSchema = z.object({
	name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
	email: z.string().email("Valid email is required"),
	image: z
		.string()
		.optional()
		.refine(
			(val) => !val || val === "" || z.string().url().safeParse(val).success,
			"Must be a valid URL"
		),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
	const session = useSession();
	const user = session?.data?.user;

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			image: user?.image ?? "",
		},
	});

	// Update form when user data changes
	React.useEffect(() => {
		if (user) {
			form.reset({
				name: user.name ?? "",
				email: user.email ?? "",
				image: user.image ?? "",
			});
		}
	}, [user, form]);

	const onSubmit = async (values: ProfileFormValues) => {
		try {
			const { error } = await authClient.updateUser({
				name: values.name,
				image: values.image || undefined,
			});

			if (error) {
				toast.error(error.message || "Failed to update profile");
			} else {
				toast.success("Profile updated successfully");
				// Session will automatically refresh via Better Auth hooks
				if (session?.refetch) {
					session.refetch();
				}
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to update profile";
			toast.error(message);
		}
	};

	const loading = form.formState.isSubmitting;

	return (
		<Form {...(form as any)}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control as any}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="Your name"
									disabled={loading}
									autoComplete="name"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control as any}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="email"
									placeholder="your@email.com"
									disabled={true}
									autoComplete="email"
									className="bg-muted"
								/>
							</FormControl>
							<FormMessage />
							<p className="text-xs text-muted-foreground">
								Email cannot be changed here. Use the change email feature if available.
							</p>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control as any}
					name="image"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Profile Image URL</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="url"
									placeholder="https://example.com/avatar.jpg"
									disabled={loading}
									autoComplete="photo"
								/>
							</FormControl>
							<FormMessage />
							<p className="text-xs text-muted-foreground">
								Enter a URL to your profile image
							</p>
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? "Updating..." : "Update Profile"}
				</Button>
			</form>
		</Form>
	);
}

