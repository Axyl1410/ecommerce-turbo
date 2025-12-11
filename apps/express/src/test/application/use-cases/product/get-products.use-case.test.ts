import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetProductsUseCase } from "@/application/use-cases/product/get-products.use-case";
import { Product } from "@/domain/entities/product.entity";
import type { IProductRepository } from "@/domain/repositories/product.repository";
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

describe("GetProductsUseCase", () => {
	it("returns products from cache when available", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		const cachedList = {
			products: [],
			total: 0,
			page: 1,
			limit: 10,
			totalPages: 0,
		};

		cache.get.mockResolvedValue(cachedList);

		const result = await useCase.execute({});

		expect(cache.get).toHaveBeenCalled();
		expect(repo.findMany).not.toHaveBeenCalled();
		expect(result).toEqual(cachedList);
	});

	it("returns products from repository with default pagination", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

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

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [product],
			total: 1,
		});

		const result = await useCase.execute({});

		expect(repo.findMany).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			status: undefined,
			categoryId: undefined,
			brandId: undefined,
			search: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});
		expect(result.total).toBe(1);
		expect(result.page).toBe(1);
		expect(result.limit).toBe(10);
		expect(result.totalPages).toBe(1);
	});

	it("handles pagination correctly", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 25,
		});

		const result = await useCase.execute({ page: 2, limit: 10 });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				page: 2,
				limit: 10,
			}),
		);
		expect(result.totalPages).toBe(3);
	});

	it("handles filtering by status", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 0,
		});

		await useCase.execute({ status: "PUBLISHED" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "PUBLISHED",
			}),
		);
	});

	it("handles filtering by categoryId and brandId", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 0,
		});

		await useCase.execute({
			categoryId: "cat-1",
			brandId: "brand-1",
		});

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				categoryId: "cat-1",
				brandId: "brand-1",
			}),
		);
	});

	it("handles search query", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 0,
		});

		await useCase.execute({ search: "test" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				search: "test",
			}),
		);
	});

	it("handles sorting", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 0,
		});

		await useCase.execute({
			sortBy: "name",
			sortOrder: "asc",
		});

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				sortBy: "name",
				sortOrder: "asc",
			}),
		);
	});

	it("caches the result", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetProductsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			products: [],
			total: 0,
		});

		await useCase.execute({});

		expect(cache.set).toHaveBeenCalledWith(
			expect.stringContaining("product:list"),
			expect.any(Object),
			300,
		);
	});
});
