import type { ProductDetailDTO } from "@/application/dto/product.dto";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Get Product By Slug Use Case
 * Handles retrieving a product by slug with full details
 */
export class GetProductBySlugUseCase {
	constructor(
		private productRepository: IProductRepository,
		private cacheService: ICacheService,
	) {}

	async execute(slug: string): Promise<ProductDetailDTO> {
		const cacheKey = `product:slug:${slug}`;

		// Try to get from cache
		const cached = await this.cacheService.get<ProductDetailDTO>(cacheKey);
		if (cached) {
			return cached;
		}

		// Get product with details from repository
		const details = await this.productRepository.findBySlugWithDetails(slug);

		if (!details) {
			throw new NotFoundError("Product", slug);
		}

		// Map to DTO
		const result: ProductDetailDTO = {
			id: details.product.id,
			name: details.product.name,
			slug: details.product.getSlug(),
			description: details.product.description,
			brandId: details.product.brandId,
			categoryId: details.product.categoryId,
			defaultImage: details.product.defaultImage,
			seoMetaTitle: details.product.seoMetaTitle,
			seoMetaDesc: details.product.seoMetaDesc,
			status: details.product.getStatus() as "DRAFT" | "PUBLISHED" | "ARCHIVED",
			createdAt: details.product.createdAt,
			updatedAt: details.product.updatedAt,
			brand: details.brand,
			category: details.category,
			variants: details.variants,
			images: details.images,
		};

		// Cache the result (5 minutes)
		await this.cacheService.set(cacheKey, result, 300);

		return result;
	}
}
