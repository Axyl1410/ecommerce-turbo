import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session) {
        return <div>Not authenticated</div>
    }

	return <>{children}</>;
}