import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { IBrandRepository } from "@/domain/repositories/brand.repository";

/**
 * Get Brands Use Case
 * Simple helper use case to load brands for product CRUD screens
 */
export class GetBrandsUseCase {
	constructor(
		private readonly brandRepository: IBrandRepository,
		private readonly cacheService: ICacheService,
	) {}

	async execute(params: {
		page?: number;
		limit?: number;
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}) {
		const {
			page = 1,
			limit = 50,
			active = true,
			search,
			sortBy = "name",
			sortOrder = "asc",
		} = params;

		const cacheKey = this.buildCacheKey({
			page,
			limit,
			active,
			search,
			sortBy,
			sortOrder,
		});

		const cached = await this.cacheService.get<{
			brands: Array<{
				id: string;
				name: string;
				slug: string;
				logoUrl: string | null;
			}>;
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		}>(cacheKey);

		if (cached) {
			return cached;
		}

		const { brands, total } = await this.brandRepository.findMany({
			page,
			limit,
			active,
			search,
			sortBy,
			sortOrder,
		});

		const totalPages = Math.ceil(total / limit);

		const result = {
			brands: brands.map((b) => ({
				id: b.id,
				name: b.name,
				slug: b.getSlug(),
				logoUrl: b.logoUrl,
			})),
			total,
			page,
			limit,
			totalPages,
		};

		await this.cacheService.set(cacheKey, result, 300);

		return result;
	}

	private buildCacheKey(params: {
		page: number;
		limit: number;
		active: boolean;
		search?: string;
		sortBy: "name" | "createdAt" | "updatedAt";
		sortOrder: "asc" | "desc";
	}) {
		const { page, limit, active, search, sortBy, sortOrder } = params;

		const parts = [
			"brand:list",
			`page:${page}`,
			`limit:${limit}`,
			`active:${active}`,
			`sortBy:${sortBy}`,
			`sortOrder:${sortOrder}`,
			search ? `search:${search}` : "",
		].filter(Boolean);

		return parts.join(":");
	}
}


