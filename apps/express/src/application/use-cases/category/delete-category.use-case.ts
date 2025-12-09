import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { ApplicationError } from "@/shared/errors/application.error";

/**
 * Delete Category Use Case
 * Handles deleting a category
 */
export class DeleteCategoryUseCase {
	constructor(
		private categoryRepository: ICategoryRepository,
		private cacheService: ICacheService,
	) {}

	async execute(id: string): Promise<void> {
		// Check if category exists
		const existing = await this.categoryRepository.findById(id);
		if (!existing) {
			throw new ApplicationError("Category not found", "CATEGORY_NOT_FOUND", 404);
		}

		// Get category slug before deletion for cache invalidation
		const slug = existing.getSlug();

		// Delete category (repository will handle setting parentId = null for children)
		await this.categoryRepository.delete(id);

		// Invalidate cache
		await this.cacheService.delete(`category:detail:id:${id}`);
		await this.cacheService.delete(`category:detail:slug:${slug}`);

		// Invalidate list cache
		// In production, you might want to use Redis SCAN to find all category:list:* keys
	}
}

