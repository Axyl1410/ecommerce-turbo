import type {
	ProductDetailDTO,
	UpdateProductDTO,
} from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import type { GetProductByIdUseCase } from "./get-product-by-id.use-case";

/**
 * Update Product Use Case
 * Handles updating an existing product
 */
export class UpdateProductUseCase {
	constructor(
		private productRepository: IProductRepository,
		private cacheService: ICacheService,
		private getProductByIdUseCase: GetProductByIdUseCase,
	) {}

	async execute(id: string, dto: UpdateProductDTO): Promise<ProductDetailDTO> {
		// Check if product exists
		const existing = await this.productRepository.findById(id);
		if (!existing) {
			throw new NotFoundError("Product", id);
		}

		// If slug is being updated, check if new slug already exists
		if (dto.slug && dto.slug !== existing.getSlug()) {
			const slugExists = await this.productRepository.existsBySlug(
				dto.slug,
				id,
			);
			if (slugExists) {
				throw new ApplicationError(
					"Product with this slug already exists",
					"SLUG_EXISTS",
					409,
				);
			}
		}

		// Update product
		await this.productRepository.update(id, dto);

		// Invalidate caches
		await this.cacheService.delete(`product:id:${id}`);
		await this.cacheService.delete(`product:slug:${existing.getSlug()}`);
		if (dto.slug && dto.slug !== existing.getSlug()) {
			await this.cacheService.delete(`product:slug:${dto.slug}`);
		}
		await this.invalidateListCache();

		// Get updated product
		const product = await this.getProductByIdUseCase.execute(id);

		return product;
	}

	private async invalidateListCache(): Promise<void> {
		// In production, you might want to use Redis SCAN to find all product:list:* keys
		// For now, we'll just log that cache should be invalidated
	}
}
