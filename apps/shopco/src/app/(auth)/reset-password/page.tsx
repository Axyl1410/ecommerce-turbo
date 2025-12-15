import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import ResetPasswordForm from "@/components/reset-password-form";

export default function ResetPasswordPage() {
	return (
		<main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
			<section className="hidden flex-col justify-between bg-black p-10 text-white lg:flex">
				<div className="text-xl font-semibold">
					<Link href="/">SHOP.CO</Link>
				</div>
				<div className="max-w-md space-y-4">
					<h1 className="text-4xl font-medium leading-tight xl:text-5xl">
						Reset your password
					</h1>
					<p>
						Enter your email address and we'll send you a link to reset your
						password.
					</p>
				</div>
				<div className="text-xs text-muted-foreground">
					© 2025 ShopCo. All rights reserved.
				</div>
			</section>

			<section className="relative flex items-center justify-center bg-linear-to-br from-indigo-500/15 via-purple-500/15 to-orange-500/15 p-6 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-orange-400/10 lg:p-10">
				<div className="w-full max-w-md">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Reset Password</CardTitle>
							<CardDescription>
								Enter your email address and we'll send you a reset link.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResetPasswordForm />
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}
