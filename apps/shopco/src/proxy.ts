import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		// THIS IS NOT SECURE!
		// This is the recommended approach to optimistically redirect users
		// We recommend handling auth checks in each page/route
		if (!session) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		return NextResponse.next();
	} catch (error) {
		console.error(error);
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
}

export const config = {
	// Only protect the admin area; everything else stays public
	matcher: ["/admin/:path*"],
};
