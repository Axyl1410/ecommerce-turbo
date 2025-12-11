import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetProductBySlugUseCase } from "@/application/use-cases/product/get-product-by-slug.use-case";
import { Product } from "@/domain/entities/product.entity";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { buildProductProps } from "@/test/domain/entities/helpers";

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

describe("GetProductBySlugUseCase", () => {
	it("returns product from cache when available", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductBySlugUseCase(repo, cache);

		const cachedProduct = {
			id: "prod-1",
			name: "Product",
			slug: "product",
		} as any;

		cache.get.mockResolvedValue(cachedProduct);

		const result = await useCase.execute("product");

		expect(cache.get).toHaveBeenCalledWith("product:slug:product");
		expect(repo.findBySlugWithDetails).not.toHaveBeenCalled();
		expect(result).toEqual(cachedProduct);
	});

	it("returns product from repository when not in cache", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductBySlugUseCase(repo, cache);

		const props = buildProductProps({ id: "prod-1", slug: "product" });
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
		repo.findBySlugWithDetails.mockResolvedValue(productDetails);

		const result = await useCase.execute("product");

		expect(cache.get).toHaveBeenCalledWith("product:slug:product");
		expect(repo.findBySlugWithDetails).toHaveBeenCalledWith("product");
		expect(cache.set).toHaveBeenCalledWith(
			"product:slug:product",
			expect.any(Object),
			300,
		);
		expect(result.slug).toBe("product");
	});

	it("throws NotFoundError when product does not exist", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductBySlugUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findBySlugWithDetails.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow("Product");
	});
});
