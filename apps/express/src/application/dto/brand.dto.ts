import type { BrandRow } from "@workspace/types";

/**
 * Get Brands Input DTO
 */
export interface GetBrandsDTO {
	page?: number;
	limit?: number;
	active?: boolean;
	search?: string;
	sortBy?: "name" | "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

/**
 * Brand Output DTO
 */
export type BrandDTO = BrandRow;

/**
 * Brand List Output DTO
 */
export interface BrandListDTO {
	brands: BrandDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
