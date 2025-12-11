/**
 * Category Route Parameters
 */

/**
 * Get Category by ID Parameters
 */
export interface GetCategoryByIdParams {
	id: string;
}

/**
 * Get Category by Slug Parameters
 */
export interface GetCategoryBySlugParams {
	slug: string;
}

/**
 * Update Category Parameters
 */
export interface UpdateCategoryParams {
	id: string;
}

/**
 * Delete Category Parameters
 */
export interface DeleteCategoryParams {
	id: string;
}

/**
 * Product Route Parameters
 */

/**
 * Get Product by ID Parameters
 */
export interface GetProductByIdParams {
	id: string;
}

/**
 * Get Product by Slug Parameters
 */
export interface GetProductBySlugParams {
	slug: string;
}

/**
 * Update Product Parameters
 */
export interface UpdateProductParams {
	id: string;
}

/**
 * Delete Product Parameters
 */
export interface DeleteProductParams {
	id: string;
}

/**
 * Cart Route Parameters
 */

/**
 * Update Cart Item Parameters
 */
export interface UpdateCartItemParams {
	itemId: string;
}

/**
 * Remove Cart Item Parameters
 */
export interface RemoveCartItemParams {
	itemId: string;
}

