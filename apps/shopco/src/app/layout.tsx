import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import HolyLoader from "holy-loader";
import { satoshi } from "@/styles/fonts";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "Shopco",
	description: "Shopco - E-commerce platform",
};

export const viewport: Viewport = {
	themeColor: "#000000",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={satoshi.className}>
				<HolyLoader color="#868686" />
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
