"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = React.HTMLAttributes<HTMLDivElement>;

const loginSchema = z.object({
	email: z.string().email("Valid email is required"),
	password: z.string().min(6, "Min 6 characters"),
	rememberMe: z.boolean(),
});

export function LoginForm({ className, ...props }: LoginFormProps) {
	const router = useRouter();
	const form = useForm<
		z.infer<typeof loginSchema>,
		unknown,
		z.infer<typeof loginSchema>
	>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		try {
			const { error: signInError } = await authClient.signIn.email({
				email: values.email,
				password: values.password,
				rememberMe: values.rememberMe,
			});
			if (signInError) {
				toast.error(signInError.message || "Failed to sign in");
			} else {
				toast.success("Signed in successfully");
				router.push("/");
			}
		} catch (_err) {
			toast.error("Failed to sign in");
		}
	}

	const signInWith = async (provider: "google" | "github" | "discord") => {
		const { error } = await authClient.signIn.social({ provider });
		if (error) toast.error(error.message || "Failed to sign in");
	};

	const loading = form.formState.isSubmitting;

	return (
		<div className={cn("w-full max-w-sm space-y-4", className)} {...props}>
			<Form {...(form as any)}>
				<form
					onSubmit={form.handleSubmit(onSubmit, () => {
						const errs = form.formState.errors as Record<
							string,
							{ message?: string }
						>;
						const first = Object.values(errs)[0]?.message;
						if (first) toast.error(first);
					})}
					className="space-y-4"
				>
					<FormField
						// Cast to align react-hook-form types between app and UI package
						control={form.control as any}
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel htmlFor="email">Email</FormLabel>
								<FormControl>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
										autoComplete="email"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						// Cast to align react-hook-form types between app and UI package
						control={form.control as any}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel htmlFor="password">Password</FormLabel>
								<FormControl>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex items-center justify-between gap-4">
						<FormField
							// Cast to align react-hook-form types between app and UI package
							control={form.control as any}
							name="rememberMe"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center space-x-2 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(v) => field.onChange(Boolean(v))}
											tabIndex={-1}
										/>
									</FormControl>
									<FormLabel>Remember me</FormLabel>
								</FormItem>
							)}
						/>
						<Link
							href="/reset-password"
							className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
							tabIndex={-1}
						>
							Forgot password?
						</Link>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</Form>

			<p className="text-sm text-muted-foreground">
				Don't have an account?{" "}
				<Link
					href="/sign-up"
					className="text-primary underline underline-offset-4"
				>
					Create one
				</Link>
			</p>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator className="w-full" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => signInWith("google")}
					disabled={loading}
				>
					Google
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => signInWith("github")}
					disabled={loading}
				>
					GitHub
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => signInWith("discord")}
					disabled={loading}
				>
					Discord
				</Button>
			</div>
		</div>
	);
}

export default LoginForm;
