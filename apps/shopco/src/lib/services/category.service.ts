import type { ApiResponse, CategoryListDTO, GetCategoriesDTO } from "@workspace/types";
import { apiClient } from "../api";

/**
 * Category API Service
 */
export const categoryService = {
	/**
	 * Get list of categories with pagination and filtering
	 */
	async getCategories(params?: GetCategoriesDTO): Promise<ApiResponse<CategoryListDTO>> {
		const response = await apiClient.get<ApiResponse<CategoryListDTO>>("/categories", {
			params,
		});
		return response.data;
	},

	/**
	 * Get category by ID
	 */
	async getCategoryById(id: string): Promise<ApiResponse<unknown>> {
		const response = await apiClient.get<ApiResponse<unknown>>(`/categories/${id}`);
		return response.data;
	},

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<ApiResponse<unknown>> {
		const response = await apiClient.get<ApiResponse<unknown>>(`/categories/slug/${slug}`);
		return response.data;
	},
};
