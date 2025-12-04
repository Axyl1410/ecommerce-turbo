import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Delete Product Use Case
 * Handles deleting a product
 */
export class DeleteProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private cacheService: ICacheService
  ) {}

  async execute(id: string): Promise<void> {
    // Check if product exists and get slug for cache invalidation
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product", id);
    }

    const slug = product.getSlug();

    // Delete product
    await this.productRepository.delete(id);

    // Invalidate caches
    await this.cacheService.delete(`product:id:${id}`);
    await this.cacheService.delete(`product:slug:${slug}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache(): Promise<void> {
    // In production, you might want to use Redis SCAN to find all product:list:* keys
    // For now, we'll just log that cache should be invalidated
  }
}

