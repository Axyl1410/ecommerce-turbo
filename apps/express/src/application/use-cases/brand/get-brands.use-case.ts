import type { GetBrandsDTO, BrandListDTO } from "@/application/dto/brand.dto";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IBrandRepository } from "@/domain/repositories/brand.repository";

/**
 * Get Brands Use Case
 * Handles retrieving a list of brands with pagination, filtering, and sorting
 */
export class GetBrandsUseCase {
	constructor(
		private brandRepository: IBrandRepository,
		private cacheService: ICacheService,
	) {}

	async execute(dto: GetBrandsDTO): Promise<BrandListDTO> {
		const {
			page = 1,
			limit = 50, // Default higher limit for filter lists
			active = true, // Only show active brands by default
			search,
			sortBy = "name",
			sortOrder = "asc",
		} = dto;

		// Build cache key
		const cacheKey = this.buildCacheKey({
			page,
			limit,
			active,
			search,
		});

		// Try to get from cache
		const cached = await this.cacheService.get<BrandListDTO>(cacheKey);
		if (cached) {
			return cached;
		}

		// Get brands from repository
		const { brands, total } = await this.brandRepository.findMany({
			page,
			limit,
			active,
			search,
			sortBy,
			sortOrder,
		});

		const totalPages = Math.ceil(total / limit);

		const result: BrandListDTO = {
			brands,
			total,
			page,
			limit,
			totalPages,
		};

		// Cache the result (10 minutes - longer than products)
		await this.cacheService.set(cacheKey, result, 600);

		return result;
	}

	private buildCacheKey(params: {
		page?: number;
		limit?: number;
		active?: boolean;
		search?: string;
	}): string {
		const keyParts = ["brands"];

		if (params.page) keyParts.push(`page:${params.page}`);
		if (params.limit) keyParts.push(`limit:${params.limit}`);
		if (params.active !== undefined) keyParts.push(`active:${params.active}`);
		if (params.search) keyParts.push(`search:${params.search}`);

		return keyParts.join(":");
	}
}
