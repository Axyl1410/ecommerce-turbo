import { apiClient, API_URL } from "@/lib/api";

export type WishlistItemDTO = {
	id: string;
	productId: string;
	productName: string;
	productSlug: string;
	productImage: string | null;
	price: number;
	salePrice: number | null;
	createdAt: string;
};

/**
 * Get user's wishlist
 */
export async function getUserWishlist(): Promise<WishlistItemDTO[]> {
	const response = await apiClient.get<{ data: WishlistItemDTO[] }>(
		"/wishlist",
	);
	return response.data.data;
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string): Promise<void> {
	await apiClient.post("/wishlist", { productId });
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string): Promise<void> {
	await apiClient.delete(`/wishlist/${productId}`);
}

/**
 * Check if product is in wishlist (by fetching full list)
 */
export async function isProductInWishlist(
	productId: string,
): Promise<boolean> {
	try {
		const wishlist = await getUserWishlist();
		return wishlist.some((item) => item.productId === productId);
	} catch {
		return false;
	}
}
