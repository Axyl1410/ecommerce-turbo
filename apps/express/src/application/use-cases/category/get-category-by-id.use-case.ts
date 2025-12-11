import type { CategoryDetailDTO } from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Get Category By ID Use Case
 * Handles retrieving a category by ID with parent and children
 */
export class GetCategoryByIdUseCase {
	constructor(
		private categoryRepository: ICategoryRepository,
		private cacheService: ICacheService,
	) {}

	async execute(id: string): Promise<CategoryDetailDTO> {
		// Build cache key
		const cacheKey = `category:detail:id:${id}`;

		// Try to get from cache
		const cached = await this.cacheService.get<CategoryDetailDTO>(cacheKey);
		if (cached) {
			return cached;
		}

		// Get category with details from repository
		const details = await this.categoryRepository.findByIdWithDetails(id);

		if (!details) {
			throw new NotFoundError("Category", id);
		}

		const category = details.category;

		const result: CategoryDetailDTO = {
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
			parent: details.parent,
			children: details.children,
		};

		// Cache the result (5 minutes)
		await this.cacheService.set(cacheKey, result, 300);

		return result;
	}
}


