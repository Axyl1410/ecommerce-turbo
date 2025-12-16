import type { Category } from "../entities/category.entity";

/**
 * Category Repository Interface
 * Defines the contract for category data access (port)
 */
export interface ICategoryRepository {
	/**
	 * Find category by ID
	 */
	findById(id: string): Promise<Category | null>;

	/**
	 * Find category by slug
	 */
	findBySlug(slug: string): Promise<Category | null>;

	/**
	 * Find categories with pagination, filtering, and sorting
	 */
	findMany(params: {
		page?: number;
		limit?: number;
		parentId?: string | null;
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt" | "sortOrder";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		categories: Category[];
		total: number;
	}>;

	/**
	 * Find categories by parent ID
	 */
	findByParentId(parentId: string | null): Promise<Category[]>;

	/**
	 * Create a new category
	 */
	create(data: {
		name: string;
		slug: string;
		description?: string | null;
		imageUrl?: string | null;
		parentId?: string | null;
		sortOrder?: number | null;
		active?: boolean;
	}): Promise<Category>;

	/**
	 * Update an existing category
	 */
	update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			imageUrl?: string | null;
			parentId?: string | null;
			sortOrder?: number | null;
			active?: boolean;
		},
	): Promise<Category>;

	/**
	 * Delete a category
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if category with slug exists
	 */
	existsBySlug(slug: string, excludeId?: string): Promise<boolean>;

	/**
	 * Find category by ID with parent and children
	 */
	findByIdWithDetails(id: string): Promise<{
		category: Category;
		parent: { id: string; name: string; slug: string } | null;
		children: Array<{ id: string; name: string; slug: string }>;
	} | null>;

	/**
	 * Find category by slug with parent and children
	 */
	findBySlugWithDetails(slug: string): Promise<{
		category: Category;
		parent: { id: string; name: string; slug: string } | null;
		children: Array<{ id: string; name: string; slug: string }>;
	} | null>;

	/**
	 * Get all categories (for validation purposes)
	 */
	findAll(): Promise<Category[]>;
}
