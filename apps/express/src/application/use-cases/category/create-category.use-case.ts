import type {
	CategoryDetailDTO,
	CreateCategoryDTO,
} from "@/application/dto/category.dto";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import type { GetCategoryByIdUseCase } from "./get-category-by-id.use-case";

/**
 * Create Category Use Case
 * Handles creating a new category
 */
export class CreateCategoryUseCase {
	constructor(
		private categoryRepository: ICategoryRepository,
		private cacheService: ICacheService,
		private getCategoryByIdUseCase: GetCategoryByIdUseCase,
	) {}

	async execute(dto: CreateCategoryDTO): Promise<CategoryDetailDTO> {
		// Check if slug already exists
		const slugExists = await this.categoryRepository.existsBySlug(dto.slug);
		if (slugExists) {
			throw new ApplicationError(
				"Category with this slug already exists",
				"SLUG_EXISTS",
				409,
			);
		}

		// Validate parentId if provided
		if (dto.parentId) {
			const parent = await this.categoryRepository.findById(dto.parentId);
			if (!parent) {
				throw new ApplicationError(
					"Parent category not found",
					"PARENT_NOT_FOUND",
					404,
				);
			}
		}

		// Create category
		const category = await this.categoryRepository.create(dto);

		// Invalidate category list cache
		await this.invalidateListCache();

		// Get the full category details
		const categoryDetails = await this.getCategoryByIdUseCase.execute(
			category.id,
		);

		return categoryDetails;
	}

	private async invalidateListCache(): Promise<void> {
		// In production, you might want to use Redis SCAN to find all category:list:* keys
		// For now, we'll just log that cache should be invalidated
		// Specific cache keys are handled per operation
	}
}
