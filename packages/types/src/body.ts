import type { ProductStatus } from "./enums.js";

/**
 * Category Request Bodies
 */

/**
 * Create Category Request Body
 */
export interface CreateCategoryBody {
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	parentId?: string | null;
	sortOrder?: number | null;
	active?: boolean;
}

/**
 * Update Category Request Body
 */
export interface UpdateCategoryBody {
	name?: string;
	slug?: string;
	description?: string | null;
	imageUrl?: string | null;
	parentId?: string | null;
	sortOrder?: number | null;
	active?: boolean;
}

/**
 * Product Request Bodies
 */

/**
 * Create Product Request Body
 */
export interface CreateProductBody {
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
 * Update Product Request Body
 */
export interface UpdateProductBody {
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
 * Cart Request Bodies
 */

/**
 * Add Cart Item Request Body
 */
export interface AddCartItemBody {
	variantId: string;
	quantity: number;
}

/**
 * Update Cart Item Request Body
 */
export interface UpdateCartItemBody {
	quantity: number;
}
