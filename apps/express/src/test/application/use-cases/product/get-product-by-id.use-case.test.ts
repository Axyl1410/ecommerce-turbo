import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import { buildProductProps } from "@/test/domain/entities/helpers";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { Product } from "@/domain/entities/product.entity";

const productRepositoryMock = (): jest.Mocked<IProductRepository> =>
	({
		findById: jest.fn(),
		findBySlug: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		existsBySlug: jest.fn(),
		findByIdWithDetails: jest.fn(),
		findBySlugWithDetails: jest.fn(),
		createWithDetails: jest.fn(),
	}) as unknown as jest.Mocked<IProductRepository>;

const cacheServiceMock = (): jest.Mocked<ICacheService> =>
	({
		get: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		deleteMultiple: jest.fn(),
	}) as unknown as jest.Mocked<ICacheService>;

describe("GetProductByIdUseCase", () => {
	it("returns product from cache when available", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductByIdUseCase(repo, cache);

		const cachedProduct = {
			id: "prod-1",
			name: "Product",
			slug: "product",
		} as any;

		cache.get.mockResolvedValue(cachedProduct);

		const result = await useCase.execute("prod-1");

		expect(cache.get).toHaveBeenCalledWith("product:id:prod-1");
		expect(repo.findByIdWithDetails).not.toHaveBeenCalled();
		expect(result).toEqual(cachedProduct);
	});

	it("returns product from repository when not in cache", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductByIdUseCase(repo, cache);

		const props = buildProductProps({ id: "prod-1" });
		const product = Product.create(
			props.id,
			props.name,
			props.slug,
			props.description,
			props.brandId,
			props.categoryId,
			props.defaultImage,
			props.seoMetaTitle,
			props.seoMetaDesc,
			props.status,
			props.createdAt,
			props.updatedAt,
		);

		const productDetails = {
			product,
			brand: null,
			category: null,
			variants: [],
			images: [],
		};

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(productDetails);

		const result = await useCase.execute("prod-1");

		expect(cache.get).toHaveBeenCalledWith("product:id:prod-1");
		expect(repo.findByIdWithDetails).toHaveBeenCalledWith("prod-1");
		expect(cache.set).toHaveBeenCalledWith(
			"product:id:prod-1",
			expect.any(Object),
			300,
		);
		expect(result.id).toBe("prod-1");
	});

	it("throws NotFoundError when product does not exist", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductByIdUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow("Product");
	});
});

