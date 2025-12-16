import type { Metadata, Viewport } from "next";
import TopBanner from "@/components/layout/Banner/TopBanner";
import Footer from "@/components/layout/Footer";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";

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
	return (
		<>
			<TopBanner />
			<TopNavbar />
			{children}
			<Footer />
		</>
	);
}
