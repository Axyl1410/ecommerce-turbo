import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import SignupForm from "@/components/signup-form";

export default function SignUpPage() {
	return (
		<main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
			<section className="hidden flex-col justify-between bg-black p-10 text-white lg:flex">
				<div className="text-xl font-semibold">
					<Link href={"/"}>SHOP.CO</Link>
				</div>
				<div className="max-w-md space-y-4">
					<h1 className="text-4xl font-medium leading-tight xl:text-5xl">
						Create your ShopCo account
					</h1>
					<p>Track orders, save favorites, and checkout faster.</p>
				</div>
				<div className="text-xs text-muted-foreground">
					© 2025 ShopCo. All rights reserved.
				</div>
			</section>

			<section className="relative flex items-center justify-center bg-linear-to-br from-indigo-500/15 via-purple-500/15 to-orange-500/15 p-6 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-orange-400/10 lg:p-10">
				<div className="w-full max-w-md">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Sign up</CardTitle>
							<CardDescription>
								Create your account to get started.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SignupForm />
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}
