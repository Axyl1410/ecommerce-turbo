import type {
	UpdateCategoryDTO,
	CategoryDetailDTO,
} from "@/application/dto/category.dto";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import type { GetCategoryByIdUseCase } from "./get-category-by-id.use-case";

/**
 * Update Category Use Case
 * Handles updating an existing category
 */
export class UpdateCategoryUseCase {
	constructor(
		private categoryRepository: ICategoryRepository,
		private cacheService: ICacheService,
		private getCategoryByIdUseCase: GetCategoryByIdUseCase,
	) {}

	async execute(
		id: string,
		dto: UpdateCategoryDTO,
	): Promise<CategoryDetailDTO> {
		// Check if category exists
		const existing = await this.categoryRepository.findById(id);
		if (!existing) {
			throw new ApplicationError("Category not found", "CATEGORY_NOT_FOUND", 404);
		}

		// Validate slug if provided
		if (dto.slug) {
			const slugExists = await this.categoryRepository.existsBySlug(
				dto.slug,
				id,
			);
			if (slugExists) {
				throw new ApplicationError(
					"Category with this slug already exists",
					"SLUG_EXISTS",
					409,
				);
			}
		}

		// Validate parentId if provided
		if (dto.parentId !== undefined) {
			// Cannot set parentId to itself
			if (dto.parentId === id) {
				throw new ApplicationError(
					"Cannot set category as its own parent",
					"CIRCULAR_REFERENCE",
					400,
				);
			}

			// If parentId is not null, validate it exists
			if (dto.parentId !== null) {
				const parent = await this.categoryRepository.findById(dto.parentId);
				if (!parent) {
					throw new ApplicationError(
						"Parent category not found",
						"PARENT_NOT_FOUND",
						404,
					);
				}

				// Check for circular reference: cannot set parentId to a descendant
				const allCategories = await this.categoryRepository.findAll();
				const currentCategory = allCategories.find((c) => c.id === id);
				if (currentCategory) {
					const parentCategory = allCategories.find(
						(c) => c.id === dto.parentId,
					);
					if (parentCategory) {
						// Check if the parent is a descendant of current category
						if (parentCategory.isDescendantOf(id, allCategories)) {
							throw new ApplicationError(
								"Cannot set parent to a descendant category (circular reference)",
								"CIRCULAR_REFERENCE",
								400,
							);
						}
					}
				}
			}
		}

		// Update category
		await this.categoryRepository.update(id, dto);

		// Invalidate category list cache and detail cache
		await this.invalidateCache(id);

		// Get the updated category details
		const categoryDetails = await this.getCategoryByIdUseCase.execute(id);

		return categoryDetails;
	}

	private async invalidateCache(categoryId: string): Promise<void> {
		// Invalidate detail cache
		const category = await this.categoryRepository.findById(categoryId);
		if (category) {
			await this.cacheService.delete(`category:detail:id:${categoryId}`);
			await this.cacheService.delete(
				`category:detail:slug:${category.getSlug()}`,
			);
		}

		// Invalidate list cache (all variations)
		// In production, you might want to use Redis SCAN to find all category:list:* keys
	}
}

