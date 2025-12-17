"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function WishlistPageContent() {
	const { wishlist, loading, removeProduct } = useWishlist();

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-lg text-gray-500">Loading wishlist...</p>
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
	const handleRemove = async () => {
		try {
			await onRemove(item.productId);
		} catch (error) {
			console.error("Failed to remove from wishlist:", error);
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
			<Link href={`/product/${item.productSlug}`}>
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
				<Link href={`/product/${item.productSlug}`}>
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
					<Link href={`/product/${item.productSlug}`} className="flex-1">
						<Button variant="outline" size="sm" className="w-full">
							View Details
						</Button>
					</Link>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemove}
						className="text-red-500 hover:bg-red-50 hover:text-red-600"
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}
