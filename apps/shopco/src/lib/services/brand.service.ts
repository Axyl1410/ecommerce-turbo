import type { ApiResponse } from "@workspace/types";
import { apiClient } from "../api";

/**
 * Brand DTO types (matching backend)
 */
export interface BrandDTO {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logoUrl: string | null;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface BrandListDTO {
	brands: BrandDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface GetBrandsDTO {
	page?: number;
	limit?: number;
	active?: boolean;
	search?: string;
	sortBy?: "name" | "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

/**
 * Brand API Service
 */
export const brandService = {
	/**
	 * Get list of brands with pagination and filtering
	 */
	async getBrands(params?: GetBrandsDTO): Promise<ApiResponse<BrandListDTO>> {
		const response = await apiClient.get<ApiResponse<BrandListDTO>>("/brands", {
			params,
		});
		return response.data;
	},
};
