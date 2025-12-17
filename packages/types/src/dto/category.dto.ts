import type { CategoryInsert, CategoryRow } from "../drizzle/type.js";

/**
 * Get Categories Input DTO
 */
export interface GetCategoriesDTO {
	page?: number;
	limit?: number;
	parentId?: string | null;
	active?: boolean;
	search?: string;
	sortBy?: "name" | "createdAt" | "updatedAt" | "sortOrder";
	sortOrder?: "asc" | "desc";
}

/**
 * Create Category Input DTO
 */
export type CreateCategoryDTO = Omit<
	CategoryInsert,
	"id" | "createdAt" | "updatedAt"
>;

/**
 * Update Category Input DTO
 */
export type UpdateCategoryDTO = Partial<
	Omit<CategoryInsert, "id" | "createdAt" | "updatedAt">
>;

/**
 * Category Output DTO
 */
export type CategoryDTO = CategoryRow;

/**
 * Category Detail Output DTO (with relations)
 */
export interface CategoryDetailDTO extends CategoryDTO {
	parent?: {
		id: string;
		name: string;
		slug: string;
	} | null;
	children: Array<{
		id: string;
		name: string;
		slug: string;
	}>;
}

/**
 * Category List Output DTO
 */
export interface CategoryListDTO {
	categories: CategoryDTO[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
