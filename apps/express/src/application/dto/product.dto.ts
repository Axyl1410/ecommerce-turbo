import type { ProductStatusEnumType as ProductStatus } from "@workspace/types";

/**
 * Get Products Input DTO
 */
export interface GetProductsDTO {
	page?: number;
	limit?: number;
	status?: ProductStatus;
	categoryId?: string;
	brandId?: string;
	search?: string;
	sortBy?: "name" | "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

/**
 * Create Product Input DTO
 */
export interface CreateProductDTO {
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
}

/**
 * Update Product Input DTO
 */
export interface UpdateProductDTO {
	name?: string;
	slug?: string;
	description?: string | null;
	brandId?: string | null;
	categoryId?: string | null;
	defaultImage?: string | null;
	seoMetaTitle?: string | null;
	seoMetaDesc?: string | null;
	status?: ProductStatus;
}

/**
 * Product Output DTO
 */
export interface ProductDTO {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	brandId: string | null;
	categoryId: string | null;
	defaultImage: string | null;
	seoMetaTitle: string | null;
	seoMetaDesc: string | null;
	status: ProductStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Product Detail Output DTO (with relations)
 */
export interface ProductDetailDTO extends ProductDTO {
	brand?: {
		id: string;
		name: string;
		slug: string;
	} | null;
	category?: {
		id: string;
		name: string;
		slug: string;
	} | null;
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
}

/**
 * Product List Output DTO
 */
export interface ProductListDTO {
	products: ProductDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
