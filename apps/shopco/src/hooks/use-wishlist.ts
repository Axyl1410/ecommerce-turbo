"use client";

import { useCallback, useEffect, useState } from "react";
import {
	addToWishlist,
	getUserWishlist,
	isProductInWishlist,
	removeFromWishlist,
	type WishlistItemDTO,
} from "@/lib/wishlist.service";

export function useWishlist() {
	const [wishlist, setWishlist] = useState<WishlistItemDTO[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch wishlist
	const fetchWishlist = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getUserWishlist();
			setWishlist(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch wishlist");
		} finally {
			setLoading(false);
		}
	}, []);

	// Add product to wishlist
	const addProduct = useCallback(
		async (productId: string) => {
			try {
				setError(null);
				await addToWishlist(productId);
				// Refresh wishlist after adding
				await fetchWishlist();
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to add product";
				setError(message);
				throw new Error(message);
			}
		},
		[fetchWishlist],
	);

	// Remove product from wishlist
	const removeProduct = useCallback(
		async (productId: string) => {
			try {
				setError(null);
				await removeFromWishlist(productId);
				// Update local state instead of re-fetching
				setWishlist((prev) =>
					prev.filter((item) => item.productId !== productId),
				);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to remove product";
				setError(message);
				throw new Error(message);
			}
		},
		[],
	);

	// Check if product is in wishlist
	const isInWishlist = useCallback(
		(productId: string) => {
			return wishlist.some((item) => item.productId === productId);
		},
		[wishlist],
	);

	// Toggle product in/out of wishlist
	const toggleWishlist = useCallback(
		async (productId: string) => {
			if (isInWishlist(productId)) {
				await removeProduct(productId);
			} else {
				await addProduct(productId);
			}
		},
		[isInWishlist, addProduct, removeProduct],
	);

	// Load wishlist on mount
	useEffect(() => {
		fetchWishlist();
	}, [fetchWishlist]);

	return {
		wishlist,
		loading,
		error,
		addProduct,
		removeProduct,
		isInWishlist,
		toggleWishlist,
		fetchWishlist,
	};
}
