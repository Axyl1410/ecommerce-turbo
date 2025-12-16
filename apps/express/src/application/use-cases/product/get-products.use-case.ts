import type { GetProductsDTO, ProductListDTO } from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IProductRepository } from "@/domain/repositories/product.repository";

/**
 * Get Products Use Case
 * Handles retrieving a list of products with pagination, filtering, and sorting
 */
export class GetProductsUseCase {
	constructor(
		private productRepository: IProductRepository,
		private cacheService: ICacheService,
	) {}

	async execute(dto: GetProductsDTO): Promise<ProductListDTO> {
		const {
			page = 1,
			limit = 10,
			status,
			categoryId,
			brandId,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = dto;

		// Build cache key
		const cacheKey = this.buildCacheKey({
			page,
			limit,
			status,
			categoryId,
			brandId,
			search,
		});

		// Try to get from cache
		const cached = await this.cacheService.get<ProductListDTO>(cacheKey);
		if (cached) {
			return cached;
		}

		// Get products from repository
		const { products, total } = await this.productRepository.findMany({
			page,
			limit,
			status,
			categoryId,
			brandId,
			search,
			sortBy,
			sortOrder,
		});

		const totalPages = Math.ceil(total / limit);

		// Map domain entities to DTOs
		const productDTOs = products.map((p) => this.toDTO(p));

		const result: ProductListDTO = {
			products: productDTOs,
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
		status?: string;
		categoryId?: string;
		brandId?: string;
		search?: string;
	}): string {
		const {
			page = 1,
			limit = 10,
			status,
			categoryId,
			brandId,
			search,
		} = params;
		const parts = [
			"product:list",
			`page:${page}`,
			`limit:${limit}`,
			status ? `status:${status}` : "",
			categoryId ? `category:${categoryId}` : "",
			brandId ? `brand:${brandId}` : "",
			search ? `search:${search}` : "",
		].filter(Boolean);
		return parts.join(":");
	}

	private toDTO(product: {
		id: string;
		name: string;
		getSlug(): string;
		description: string | null;
		brandId: string | null;
		categoryId: string | null;
		defaultImage: string | null;
		seoMetaTitle: string | null;
		seoMetaDesc: string | null;
		getStatus(): string;
		createdAt: Date;
		updatedAt: Date;
	}) {
		return {
			id: product.id,
			name: product.name,
			slug: product.getSlug(),
			description: product.description,
			brandId: product.brandId,
			categoryId: product.categoryId,
			defaultImage: product.defaultImage,
			seoMetaTitle: product.seoMetaTitle,
			seoMetaDesc: product.seoMetaDesc,
			status: product.getStatus() as "DRAFT" | "PUBLISHED" | "ARCHIVED",
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		};
	}
}
