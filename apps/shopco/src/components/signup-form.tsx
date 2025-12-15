"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

type SignupFormProps = React.HTMLAttributes<HTMLDivElement>;

const signupSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email({ message: "Valid email is required" }),
	password: z.string().min(6, "Min 6 characters"),
});

export function SignupForm({ className, ...props }: SignupFormProps) {
	const router = useRouter();
	const [showVerificationDialog, setShowVerificationDialog] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof signupSchema>) {
		try {
			const { error: signUpError } = await authClient.signUp.email({
				email: values.email,
				password: values.password,
				name: values.name,
			});
			if (signUpError) {
				toast.error(signUpError.message || "Failed to sign up");
			} else {
				setUserEmail(values.email);
				setShowVerificationDialog(true);
				form.reset();
			}
		} catch (_err) {
			toast.error("Failed to sign up");
		}
	}

	const signInWith = async (provider: "google" | "github" | "discord") => {
		const { error } = await authClient.signIn.social({ provider });
		if (error) toast.error(error.message || "Failed to continue");
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
						name="name"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel htmlFor="name">Name</FormLabel>
								<FormControl>
									<Input
										id="name"
										type="text"
										placeholder="Your name"
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
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating account..." : "Create account"}
					</Button>
				</form>
			</Form>

			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						href="/sign-in"
						className="text-primary underline underline-offset-4"
					>
						Sign in
					</Link>
				</p>
				<p className="text-sm text-muted-foreground">
					Forgot your password?{" "}
					<Link
						href="/reset-password"
						className="text-primary underline underline-offset-4"
					>
						Reset it here
					</Link>
				</p>
			</div>

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

			<Dialog
				open={showVerificationDialog}
				onOpenChange={setShowVerificationDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Check your email</DialogTitle>
						<DialogDescription>
							We've sent a verification link to <strong>{userEmail}</strong>.
							Please check your email and click the link to verify your account.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col space-y-2">
						<Button
							onClick={() => setShowVerificationDialog(false)}
							className="w-full"
						>
							Got it
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowVerificationDialog(false);
								router.push("/sign-in");
							}}
							className="w-full"
						>
							Go to sign in
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default SignupForm;
