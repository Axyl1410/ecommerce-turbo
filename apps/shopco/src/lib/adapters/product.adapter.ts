import type { ProductDTO, ProductSearchItemDTO } from "@workspace/types";
import type { Product } from "@/types/product.types";

/**
 * Maps backend ProductSearchItemDTO (with price) to frontend Product type
 */
export function mapProductSearchItemToProduct(
	dto: ProductSearchItemDTO,
): Product {
	// Try to parse ID as number, fallback to hash of string ID for uniqueness
	const numericId = Number.parseInt(dto.id, 10);
	const id = Number.isNaN(numericId)
		? Math.abs(hashString(dto.id))
		: numericId;

	// Round prices to 2 decimal places to avoid floating point errors
	const price = Math.round(dto.price * 100) / 100;
	const salePrice = dto.salePrice
		? Math.round(dto.salePrice * 100) / 100
		: null;

	const discount =
		salePrice && salePrice < price
			? {
					amount: Math.round(((price - salePrice) / price) * 100),
					label: `-${Math.round(((price - salePrice) / price) * 100)}%`,
				}
			: { amount: 0, label: "" };

	return {
		id,
		title: dto.name,
		srcUrl: dto.defaultImage || "/images/placeholder-product.png",
		gallery: [],
		price: salePrice || price, // Use sale price if available
		discount,
		rating: 0, // Backend doesn't provide rating yet
	};
}

/**
 * Fallback for basic ProductDTO without price info
 */
export function mapProductDTOToProduct(dto: ProductDTO): Product {
	const numericId = Number.parseInt(dto.id, 10);
	const id = Number.isNaN(numericId)
		? Math.abs(hashString(dto.id))
		: numericId;

	return {
		id,
		title: dto.name,
		srcUrl: dto.defaultImage || "/images/placeholder-product.png",
		gallery: [],
		price: 0,
		discount: { amount: 0, label: "" },
		rating: 0,
	};
}

/**
 * Simple string hash function for creating numeric IDs from UUIDs
 */
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

/**
 * Maps array of ProductSearchItemDTOs to frontend Products
 */
export function mapProductSearchItemsToProducts(
	dtos: ProductSearchItemDTO[],
): Product[] {
	return dtos.map(mapProductSearchItemToProduct);
}

/**
 * Maps array of ProductDTOs to frontend Products (fallback)
 */
export function mapProductDTOsToProducts(dtos: ProductDTO[]): Product[] {
	return dtos.map(mapProductDTOToProduct);
}
