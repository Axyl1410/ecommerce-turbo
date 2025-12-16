import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function WelcomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return redirect("/sign-in");
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
			<div className="relative mx-auto w-full max-w-2xl text-center">
				{/* Main Title */}
				<div className="mb-6">
					<div className="mt-4 flex items-center justify-center gap-2">
						<div className="h-px w-8 bg-linear-to-r from-transparent to-primary/50"></div>
						<Sparkles className="h-4 w-4 text-primary" />
						<div className="h-px w-8 bg-linear-to-l from-transparent to-primary/50"></div>
					</div>
				</div>
				<p className="mt-3 text-muted-foreground">
					Hi{" "}
					<span className="font-medium text-foreground">
						{session.user.name || session.user.email || "there"}
					</span>
					, your account has been successfully verified and is ready to use.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					You can now enjoy shopping with us and access all features.
				</p>

				<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button asChild>
						<Link href="/">Start Shopping</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/shop">Browse Products</Link>
					</Button>
				</div>

				<div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
			</div>
		</div>
	);
}
