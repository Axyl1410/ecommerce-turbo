import type { CreateProductDTO, ProductDetailDTO } from "@workspace/types";
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
    private getProductByIdUseCase: GetProductByIdUseCase
  ) {}

  async execute(dto: CreateProductDTO): Promise<ProductDetailDTO> {
    // 1. Validate required fields
    if (!dto.name || dto.name.trim() === "") {
      throw new ApplicationError(
        "Product name is required",
        "NAME_REQUIRED",
        400
      );
    }

    // 2. Generate slug if not provided
    const slug =
      dto.slug?.trim() ||
      dto.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    if (!slug) {
      throw new ApplicationError(
        "Product slug is invalid",
        "SLUG_INVALID",
        400
      );
    }

    // 3. Check if slug already exists
    const slugExists = await this.productRepository.existsBySlug(slug);
    if (slugExists) {
      throw new ApplicationError(
        "Product with this slug already exists",
        "SLUG_EXISTS",
        409
      );
    }

    // 4. Create product with variants and images
    const productId = await this.productRepository.createWithDetails({
      ...dto,
      slug,
    });

    // 5. Invalidate product list cache
    await this.invalidateListCache();

    // 6. Get full product detail
    return this.getProductByIdUseCase.execute(productId);
  }

  private async invalidateListCache(): Promise<void> {
    // TODO: Implement cache invalidation (e.g., Redis)
    // Example:
    // await this.cacheService.delByPattern("product:list:*");
  }
}
