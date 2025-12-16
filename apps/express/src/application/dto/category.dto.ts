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
export interface CreateCategoryDTO {
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	parentId?: string | null;
	sortOrder?: number | null;
	active?: boolean;
}

/**
 * Update Category Input DTO
 */
export interface UpdateCategoryDTO {
	name?: string;
	slug?: string;
	description?: string | null;
	imageUrl?: string | null;
	parentId?: string | null;
	sortOrder?: number | null;
	active?: boolean;
}

/**
 * Category Output DTO
 */
export interface CategoryDTO {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	parentId: string | null;
	sortOrder: number | null;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

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



