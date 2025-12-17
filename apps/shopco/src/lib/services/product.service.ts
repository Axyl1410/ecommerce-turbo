import type {
	ApiResponse,
	GetProductsDTO,
	ProductDTO,
	ProductSearchListDTO,
} from "@workspace/types";
import { apiClient } from "../api";

export const productService = {
	/**
	 * Search and list products with filters and pagination (includes prices)
	 */
	searchProducts: async (
		params: GetProductsDTO,
	): Promise<ApiResponse<ProductSearchListDTO>> => {
		const response = await apiClient.get<ApiResponse<ProductSearchListDTO>>(
			"/products",
			{
				params,
			},
		);
		return response.data;
	},

	/**
	 * Get product by ID
	 */
	getProductById: async (id: string): Promise<ApiResponse<ProductDTO>> => {
		const response = await apiClient.get<ApiResponse<ProductDTO>>(
			`/products/${id}`,
		);
		return response.data;
	},

	/**
	 * Get product by slug
	 */
	getProductBySlug: async (slug: string): Promise<ApiResponse<ProductDTO>> => {
		const response = await apiClient.get<ApiResponse<ProductDTO>>(
			`/products/slug/${slug}`,
		);
		return response.data;
	},
};
