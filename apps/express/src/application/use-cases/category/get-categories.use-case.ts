import type { CategoryListDTO, GetCategoriesDTO } from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";

/**
 * Get Categories Use Case
 * Handles retrieving a list of categories with pagination, filtering, and sorting
 */
export class GetCategoriesUseCase {
	constructor(
		private categoryRepository: ICategoryRepository,
		private cacheService: ICacheService,
	) {}

	async execute(dto: GetCategoriesDTO): Promise<CategoryListDTO> {
		const {
			page = 1,
			limit = 10,
			parentId,
			active,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = dto;

		// Build cache key
		const cacheKey = this.buildCacheKey({
			page,
			limit,
			parentId,
			active,
			search,
		});

		// Try to get from cache
		const cached = await this.cacheService.get<CategoryListDTO>(cacheKey);
		if (cached) {
			return cached;
		}

		// Get categories from repository
		const { categories, total } = await this.categoryRepository.findMany({
			page,
			limit,
			parentId,
			active,
			search,
			sortBy,
			sortOrder,
		});

		const totalPages = Math.ceil(total / limit);

		// Map domain entities to DTOs
		const categoryDTOs = categories.map((c) => this.toDTO(c));

		const result: CategoryListDTO = {
			categories: categoryDTOs,
			total,
			page,
			limit,
			totalPages,
		};

		// Cache the result (5 minutes)
		await this.cacheService.set(cacheKey, result, 300);

		return result;
	}

	private buildCacheKey(params: {
		page?: number;
		limit?: number;
		parentId?: string | null;
		active?: boolean;
		search?: string;
	}): string {
		const { page = 1, limit = 10, parentId, active, search } = params;
		const parts = [
			"category:list",
			`page:${page}`,
			`limit:${limit}`,
			parentId !== undefined ? `parentId:${parentId ?? "null"}` : "",
			active !== undefined ? `active:${active}` : "",
			search ? `search:${search}` : "",
		].filter(Boolean);
		return parts.join(":");
	}

	private toDTO(category: {
		id: string;
		name: string;
		getSlug(): string;
		description: string | null;
		imageUrl: string | null;
		parentId: string | null;
		sortOrder: number | null;
		isActive(): boolean;
		createdAt: Date;
		updatedAt: Date;
	}) {
		return {
			id: category.id,
			name: category.name,
			slug: category.getSlug(),
			description: category.description,
			imageUrl: category.imageUrl,
			parentId: category.parentId,
			sortOrder: category.sortOrder,
			active: category.isActive(),
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	}
}
