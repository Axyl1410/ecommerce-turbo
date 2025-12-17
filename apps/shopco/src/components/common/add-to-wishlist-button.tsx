"use client";

import { Heart } from "lucide-react";
import { useCallback } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToWishlistButtonProps {
	productId: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "outline" | "ghost";
	showLabel?: boolean;
	className?: string;
}

/**
 * Add to Wishlist Button Component
 *
 * Shows a heart icon that toggles between filled and outline
 * when clicked. Manages wishlist state and loading/error states.
 *
 * @example
 * ```tsx
 * <AddToWishlistButton productId="prod-123" />
 * ```
 */
export function AddToWishlistButton({
	productId,
	size = "md",
	variant = "ghost",
	showLabel = false,
	className,
}: AddToWishlistButtonProps) {
	const { isInWishlist, toggleWishlist, loading } = useWishlist();
	const isFavorite = isInWishlist(productId);

	const handleToggle = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			try {
				await toggleWishlist(productId);
			} catch (error) {
				console.error("Failed to toggle wishlist:", error);
			}
		},
		[productId, toggleWishlist],
	);

	const iconSize = size === "sm" ? 18 : size === "lg" ? 24 : 20;

	return (
		<Button
			onClick={handleToggle}
			disabled={loading}
			variant={variant}
			size={size} 
			className={cn(
				"transition-colors duration-200",
				isFavorite && "text-red-500",
				className,
			)}
			aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
			title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
		>
			<Heart
				size={iconSize}
				className={cn("transition-all duration-200", {
					"fill-current": isFavorite,
				})}
			/>
			{showLabel && (
				<span className="ml-2">
					{isFavorite ? "Saved" : "Save"}
				</span>
			)}
		</Button>
	);
}
