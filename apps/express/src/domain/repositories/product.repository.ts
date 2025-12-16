import type { ProductStatusEnumType as ProductStatus } from "@workspace/types";
import type { Product } from "../entities/product.entity";

/**
 * Product Repository Interface
 * Defines the contract for product data access (port)
 */
export interface IProductRepository {
	/**
	 * Find product by ID
	 */
	findById(id: string): Promise<Product | null>;

	/**
	 * Find product by slug
	 */
	findBySlug(slug: string): Promise<Product | null>;

	/**
	 * Find products with pagination, filtering, and sorting
	 */
	findMany(params: {
		page?: number;
		limit?: number;
		status?: ProductStatus;
		categoryId?: string;
		brandId?: string;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		products: Product[];
		total: number;
	}>;

	/**
	 * Create a new product
	 */
	create(data: {
		name: string;
		slug: string;
		description?: string | null;
		brandId?: string | null;
		categoryId?: string | null;
		defaultImage?: string | null;
		seoMetaTitle?: string | null;
		seoMetaDesc?: string | null;
		status?: ProductStatus;
	}): Promise<Product>;

	/**
	 * Update an existing product
	 */
	update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			brandId?: string | null;
			categoryId?: string | null;
			defaultImage?: string | null;
			seoMetaTitle?: string | null;
			seoMetaDesc?: string | null;
			status?: ProductStatus;
		},
	): Promise<Product>;

	/**
	 * Delete a product
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if product with slug exists
	 */
	existsBySlug(slug: string, excludeId?: string): Promise<boolean>;

	/**
	 * Find product by ID with full details (variants, images, brand, category)
	 */
	findByIdWithDetails(id: string): Promise<{
		product: Product;
		brand: { id: string; name: string; slug: string } | null;
		category: { id: string; name: string; slug: string } | null;
		variants: Array<{
			id: string;
			productId: string;
			sku: string | null;
			attributes: Record<string, unknown> | null;
			price: number;
			salePrice: number | null;
			stockQuantity: number;
			weight: number | null;
			barcode: string | null;
			images: Array<{
				id: string;
				productId: string;
				variantId: string | null;
				url: string;
				altText: string | null;
				sortOrder: number | null;
			}>;
		}>;
		images: Array<{
			id: string;
			productId: string;
			variantId: string | null;
			url: string;
			altText: string | null;
			sortOrder: number | null;
		}>;
	} | null>;

	/**
	 * Find product by slug with full details
	 */
	findBySlugWithDetails(slug: string): Promise<{
		product: Product;
		brand: { id: string; name: string; slug: string } | null;
		category: { id: string; name: string; slug: string } | null;
		variants: Array<{
			id: string;
			productId: string;
			sku: string | null;
			attributes: Record<string, unknown> | null;
			price: number;
			salePrice: number | null;
			stockQuantity: number;
			weight: number | null;
			barcode: string | null;
			images: Array<{
				id: string;
				productId: string;
				variantId: string | null;
				url: string;
				altText: string | null;
				sortOrder: number | null;
			}>;
		}>;
		images: Array<{
			id: string;
			productId: string;
			variantId: string | null;
			url: string;
			altText: string | null;
			sortOrder: number | null;
		}>;
	} | null>;

	/**
	 * Create product with variants and images
	 */
	createWithDetails(data: {
		name: string;
		slug: string;
		description?: string | null;
		brandId?: string | null;
		categoryId?: string | null;
		defaultImage?: string | null;
		seoMetaTitle?: string | null;
		seoMetaDesc?: string | null;
		status?: ProductStatus;
		variants?: Array<{
			sku?: string | null;
			attributes?: Record<string, unknown> | null;
			price: number;
			salePrice?: number | null;
			stockQuantity: number;
			weight?: number | null;
			barcode?: string | null;
		}>;
		images?: Array<{
			url: string;
			altText?: string | null;
			sortOrder?: number | null;
			variantId?: string | null;
		}>;
	}): Promise<string>; // Returns product ID
}
