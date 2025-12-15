import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
	title: "Shopco - Authentication",
	description: "Authentication pages for Shopco",
};

export const viewport: Viewport = {
	themeColor: "#000000",
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
