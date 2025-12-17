import { WishlistPageContent } from "@/components/wishlist-page/wishlist-page-content";

export const metadata = {
	title: "My Wishlist | ShopCo",
	description: "View and manage your saved items",
};

export default function WishlistPage() {
	return (
		<div className="min-h-screen bg-white">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<WishlistPageContent />
			</div>
		</div>
	);
}
