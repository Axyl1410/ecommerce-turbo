import type { Brand } from "../entities/brand.entity";

/**
 * Brand Repository Interface
 * Defines the contract for brand data access
 */
export interface IBrandRepository {
	/**
	 * Find brand by ID
	 */
	findById(id: string): Promise<Brand | null>;

	/**
	 * Find brand by slug
	 */
	findBySlug(slug: string): Promise<Brand | null>;

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
		brands: Brand[];
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
	}): Promise<Brand>;

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
	): Promise<Brand>;

	/**
	 * Delete a brand
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if brand with slug exists
	 */
	existsBySlug(slug: string, excludeId?: string): Promise<boolean>;

	/**
	 * Get all brands (for dropdowns / validation)
	 */
	findAll(): Promise<Brand[]>;
}




