import type {
	ApiResponse,
	GetProductsDTO,
	ProductDetailDTO,
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
	 * Get product by ID (detail)
	 */
	getProductById: async (
		id: string,
	): Promise<ApiResponse<ProductDetailDTO>> => {
		const response = await apiClient.get<ApiResponse<ProductDetailDTO>>(
			`/products/${id}`,
		);
		return response.data;
	},

	/**
	 * Get product by slug (detail)
	 */
	getProductBySlug: async (
		slug: string,
	): Promise<ApiResponse<ProductDetailDTO>> => {
		const response = await apiClient.get<ApiResponse<ProductDetailDTO>>(
			`/products/slug/${slug}`,
		);
		return response.data;
	},
};
