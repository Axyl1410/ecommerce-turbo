import type {
	BrandRow,
	CategoryRow,
	ProductImageRow,
	ProductInsert,
	ProductRow,
	ProductVariantRow,
} from "../drizzle/type.js";

/**
 * Get Products Input DTO
 */
export interface GetProductsDTO {
	page?: number;
	limit?: number;
	status?: ProductRow["status"];
	categoryId?: string;
	brandId?: string;
	search?: string;
	sortBy?: "name" | "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

/**
 * Create Product Input DTO
 */
export type CreateProductDTO = Omit<
	ProductInsert,
	"id" | "createdAt" | "updatedAt"
> & {
	// NOTE: variant/image tables contain decimal columns in DB; API uses number.
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
};

/**
 * Update Product Input DTO
 */
export type UpdateProductDTO = Partial<
	Omit<ProductInsert, "id" | "createdAt" | "updatedAt">
>;

/**
 * Product Output DTO
 */
export type ProductDTO = ProductRow;

/**
 * Product Search Item Output DTO (with minimal variant info for list view)
 */
export interface ProductSearchItemDTO extends ProductDTO {
	price: number; // Price from first/default variant
	salePrice: number | null; // Sale price from first/default variant
	variantCount: number; // Total number of variants
}

/**
 * Product Detail Output DTO (with relations)
 */
export interface ProductDetailDTO extends ProductDTO {
	brand?: Pick<BrandRow, "id" | "name" | "slug"> | null;
	category?: Pick<CategoryRow, "id" | "name" | "slug"> | null;
	variants: Array<
		Omit<ProductVariantRow, "price" | "salePrice" | "attributes"> & {
			attributes: Record<string, unknown> | null;
			price: number;
			salePrice: number | null;
			images: Array<Pick<ProductImageRow, "id" | "productId" | "variantId" | "url" | "altText" | "sortOrder">>;
		}
	>;
	images: Array<
		Pick<ProductImageRow, "id" | "productId" | "variantId" | "url" | "altText" | "sortOrder">
	>;
}

/**
 * Product List Item DTO (for product list cards)
 * Contains essential fields for displaying product in list view with pricing and rating
 */
export type ProductListItemDTO = Pick<
	ProductRow,
	"id" | "name" | "slug" | "defaultImage"
> & {
	/**
	 * Cheapest variant price
	 */
	price: number;
	/**
	 * Cheapest variant sale price
	 */
	salePrice: number | null;
	/**
	 * Average rating (0-5)
	 */
	ratingAvg: number;
	/**
	 * Total number of reviews
	 */
	ratingCount: number;
};

/**
 * Product List Output DTO
 */
export interface ProductListDTO {
	products: ProductListItemDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/**
 * Product Search List Output DTO (with prices)
 */
export interface ProductSearchListDTO {
	products: ProductSearchItemDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
