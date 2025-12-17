import type { BrandRow } from "@workspace/types";

/**
 * Brand Repository Interface
 * Defines the contract for brand data access
 */
export interface IBrandRepository {
	/**
	 * Find brand by ID
	 */
	findById(id: string): Promise<BrandRow | null>;

	/**
	 * Find brand by slug
	 */
	findBySlug(slug: string): Promise<BrandRow | null>;

	/**
	 * Find brands with pagination, filtering, and sorting
	 */
	findMany(params: {
		page?: number;
		limit?: number;
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		brands: BrandRow[];
		total: number;
	}>;

	/**
	 * Create a new brand
	 */
	create(data: {
		name: string;
		slug: string;
		description?: string | null;
		logoUrl?: string | null;
		active?: boolean;
	}): Promise<string>; // Returns brand ID

	/**
	 * Update an existing brand
	 */
	update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			logoUrl?: string | null;
			active?: boolean;
		},
	): Promise<void>;

	/**
	 * Delete a brand by ID
	 */
	delete(id: string): Promise<void>;
}
