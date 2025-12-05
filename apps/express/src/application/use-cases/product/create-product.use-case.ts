import type {
	CreateProductDTO,
	ProductDetailDTO,
} from "@/application/dto/product.dto";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import type { GetProductByIdUseCase } from "./get-product-by-id.use-case";

/**
 * Create Product Use Case
 * Handles creating a new product with variants and images
 */
export class CreateProductUseCase {
	constructor(
		private productRepository: IProductRepository,
		private cacheService: ICacheService,
		private getProductByIdUseCase: GetProductByIdUseCase,
	) {}

	async execute(dto: CreateProductDTO): Promise<ProductDetailDTO> {
		// Check if slug already exists
		const slugExists = await this.productRepository.existsBySlug(dto.slug);
		if (slugExists) {
			throw new ApplicationError(
				"Product with this slug already exists",
				"SLUG_EXISTS",
				409,
			);
		}

		// Create product with variants and images
		const productId = await this.productRepository.createWithDetails(dto);

		// Invalidate product list cache
		await this.invalidateListCache();

		// Get the full product details
		const product = await this.getProductByIdUseCase.execute(productId);

		return product;
	}

	private async invalidateListCache(): Promise<void> {
		// In production, you might want to use Redis SCAN to find all product:list:* keys
		// For now, we'll just log that cache should be invalidated
		// Specific cache keys are handled per operation
	}
}
