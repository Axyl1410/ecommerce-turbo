"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import type { admin } from "@/lib/auth-client";

const userFormSchema = z.object({
	name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
	email: z.string().email("Valid email is required"),
	image: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
	role: z.enum(["user", "admin"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type User = NonNullable<
	Awaited<ReturnType<typeof admin.listUsers>>["data"]
>["users"][number];

type UserFormProps = {
	user?: User;
	onSubmit: (values: UserFormValues) => Promise<void>;
	isLoading?: boolean;
};

export default function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
	const form = useForm<UserFormValues>({
		resolver: zodResolver(userFormSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			image: user?.image ?? "",
			role: (user?.role as "user" | "admin") ?? "user",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name ?? "",
				email: user.email ?? "",
				image: user.image ?? "",
				role: (user.role as "user" | "admin") ?? "user",
			});
		}
	}, [user, form]);

	const handleSubmit = async (values: UserFormValues) => {
		await onSubmit(values);
	};

	return (
		<Form {...(form as any)}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control as any}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="User name"
									disabled={isLoading}
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
									placeholder="user@example.com"
									disabled={true}
									autoComplete="email"
									className="bg-muted"
								/>
							</FormControl>
							<FormMessage />
							<p className="text-xs text-muted-foreground">
								Email cannot be changed here
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
									disabled={isLoading}
									autoComplete="photo"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control as any}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Role</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Saving..." : "Save Changes"}
				</Button>
			</form>
		</Form>
	);
}

