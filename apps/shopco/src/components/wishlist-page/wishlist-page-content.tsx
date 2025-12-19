"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks/redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useState } from "react";

export function WishlistPageContent() {
	const { wishlist, loading, error, removeProduct } = useWishlist();

	if (loading) {
		return <WishlistSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-red-100 p-4 mb-4">
					<Heart size={48} className="text-red-500" />
				</div>
				<h2 className="mb-2 text-2xl font-semibold text-gray-700">
					Failed to Load Wishlist
				</h2>
				<p className="mb-6 text-gray-500 max-w-md">{error}</p>
				<Button onClick={() => window.location.reload()}>Try Again</Button>
			</div>
		);
	}

	if (wishlist.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<Heart size={48} className="mb-4 text-gray-300" />
				<h2 className="mb-2 text-2xl font-semibold text-gray-700">
					Your wishlist is empty
				</h2>
				<p className="mb-6 text-gray-500">
					Start adding products to your wishlist to save them for later.
				</p>
				<Link href="/shop">
					<Button>Continue Shopping</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="mb-2 text-3xl font-bold">My Wishlist</h1>
				<p className="text-gray-600">{wishlist.length} items</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{wishlist.map((item) => (
					<WishlistItem
						key={item.id}
						item={item}
						onRemove={removeProduct}
					/>
				))}
			</div>
		</div>
	);
}

interface WishlistItemProps {
	item: {
		id: string;
		productId: string;
		productName: string;
		productSlug: string;
		productImage: string | null;
		price: number;
		salePrice: number | null;
		createdAt: string;
	};
	onRemove: (productId: string) => Promise<void>;
}

function WishlistItem({ item, onRemove }: WishlistItemProps) {
	const dispatch = useAppDispatch();
	const [isRemoving, setIsRemoving] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	const handleRemove = async () => {
		try {
			setIsRemoving(true);
			await onRemove(item.productId);
		} catch (error) {
			console.error("Failed to remove from wishlist:", error);
			alert("Failed to remove item from wishlist");
		} finally {
			setIsRemoving(false);
		}
	};

	const handleAddToCart = () => {
		try {
			setIsAddingToCart(true);
			dispatch(
				addToCart({
					id: item.productId,
					name: item.productName,
					slug: item.productSlug,
					srcUrl: item.productImage || "/images/placeholder.png",
					price: item.price,
					attributes: [],
					discount: {
						amount: item.salePrice
							? item.price - item.salePrice
							: 0,
						percentage: item.salePrice
							? Math.round(((item.price - item.salePrice) / item.price) * 100)
							: 0,
					},
					quantity: 1,
				}),
			);
			setTimeout(() => setIsAddingToCart(false), 500);
		} catch (error) {
			console.error("Failed to add to cart:", error);
			setIsAddingToCart(false);
		}
	};

	const displayPrice = item.salePrice ?? item.price;
	const originalPrice = item.salePrice ? item.price : null;
	const discount = originalPrice
		? Math.round(((originalPrice - item.salePrice!) / originalPrice) * 100)
		: null;

	return (
		<div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg">
			{/* Image Container */}
			<Link href={`/shop/product/${item.productSlug}`}>
				<div className="relative aspect-square overflow-hidden bg-gray-100">
					{item.productImage ? (
						<Image
							src={item.productImage}
							alt={item.productName}
							fill
							className="object-cover transition-transform duration-200 group-hover:scale-105"
						/>
					) : (
						<div className="flex items-center justify-center h-full bg-gray-200">
							<span className="text-gray-400">No image</span>
						</div>
					)}

					{/* Discount Badge */}
					{discount && (
						<div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
							-{discount}%
						</div>
					)}

					{/* Remove Button */}
					<button
						onClick={(e) => {
							e.preventDefault();
							handleRemove();
						}}
						className="absolute left-2 top-2 rounded-full bg-white p-2 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
						title="Remove from wishlist"
					>
						<Trash2 size={18} className="text-red-500" />
					</button>
				</div>
			</Link>

			{/* Product Info */}
			<div className="p-4">
				<Link href={`/shop/product/${item.productSlug}`}>
					<h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-blue-600">
						{item.productName}
					</h3>
				</Link>

				{/* Price */}
				<div className="mb-3 flex items-center gap-2">
					<span className="text-lg font-bold text-gray-900">
						{formatPrice(displayPrice)}
					</span>
					{originalPrice && (
						<span className="text-sm text-gray-500 line-through">
							{formatPrice(originalPrice)}
						</span>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2">
					<Button
						onClick={handleAddToCart}
						disabled={isAddingToCart}
						size="sm"
						className="flex-1"
					>
						<ShoppingCart size={16} className="mr-1" />
						{isAddingToCart ? "Adding..." : "Add to Cart"}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemove}
						disabled={isRemoving}
						className="text-red-500 hover:bg-red-50 hover:text-red-600"
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}

// Loading Skeleton Component
function WishlistSkeleton() {
	return (
		<div className="space-y-6">
			<div>
				<div className="mb-2 h-9 w-48 animate-pulse rounded bg-gray-200" />
				<div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[...Array(8)].map((_, index) => (
					<div
						key={index}
						className="overflow-hidden rounded-lg border border-gray-200 bg-white"
					>
						<div className="aspect-square animate-pulse bg-gray-200" />
						<div className="p-4 space-y-3">
							<div className="h-5 w-full animate-pulse rounded bg-gray-200" />
							<div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
							<div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
							<div className="flex gap-2">
								<div className="h-9 flex-1 animate-pulse rounded bg-gray-200" />
								<div className="h-9 w-9 animate-pulse rounded bg-gray-200" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
