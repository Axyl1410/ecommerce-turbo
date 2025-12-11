import type { ICacheService } from "@/application/interfaces/cache.interface";
import { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import type { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import { Product } from "@/domain/entities/product.entity";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { buildProductProps } from "@/test/domain/entities/helpers";

/**
 * Tạo mock cho ProductRepository
 */
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

/**
 * Tạo mock cho CacheService
 */
const cacheServiceMock = (): jest.Mocked<ICacheService> =>
	({
		get: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		deleteMultiple: jest.fn(),
	}) as unknown as jest.Mocked<ICacheService>;

/**
 * Tạo mock cho GetProductByIdUseCase
 */
const getProductByIdUseCaseMock = (): jest.Mocked<GetProductByIdUseCase> =>
	({
		execute: jest.fn(),
	}) as unknown as jest.Mocked<GetProductByIdUseCase>;

describe("CreateProductUseCase", () => {
	it("creates product successfully", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new CreateProductUseCase(repo, cache, getProductById);

		const productId = "prod-1";
		const productDetail = {
			id: productId,
			name: "New Product",
			slug: "new-product",
			description: "Description",
			brandId: "brand-1",
			categoryId: "cat-1",
			defaultImage: "https://example.com/image.png",
			seoMetaTitle: "Meta title",
			seoMetaDesc: "Meta desc",
			status: "DRAFT" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
			brand: null,
			category: null,
			variants: [],
			images: [],
		};

		repo.existsBySlug.mockResolvedValue(false);
		repo.createWithDetails.mockResolvedValue(productId);
		getProductById.execute.mockResolvedValue(productDetail);

		const result = await useCase.execute({
			name: "New Product",
			slug: "new-product",
		});

		expect(repo.existsBySlug).toHaveBeenCalledWith("new-product");
		expect(repo.createWithDetails).toHaveBeenCalled();
		expect(getProductById.execute).toHaveBeenCalledWith(productId);
		expect(result).toEqual(productDetail);
	});

	it("throws ApplicationError when slug already exists", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new CreateProductUseCase(repo, cache, getProductById);

		repo.existsBySlug.mockResolvedValue(true);

		await expect(
			useCase.execute({
				name: "Product",
				slug: "existing-slug",
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				name: "Product",
				slug: "existing-slug",
			}),
		).rejects.toThrow("Product with this slug already exists");

		const error = await useCase
			.execute({
				name: "Product",
				slug: "existing-slug",
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(409);
		expect(error.code).toBe("SLUG_EXISTS");
		expect(repo.createWithDetails).not.toHaveBeenCalled();
	});

	it("creates product with variants and images", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new CreateProductUseCase(repo, cache, getProductById);

		const productId = "prod-1";
		const productDetail = {
			id: productId,
			name: "Product",
			slug: "product",
			variants: [],
			images: [],
		} as any;

		repo.existsBySlug.mockResolvedValue(false);
		repo.createWithDetails.mockResolvedValue(productId);
		getProductById.execute.mockResolvedValue(productDetail);

		await useCase.execute({
			name: "Product",
			slug: "product",
			variants: [
				{
					price: 1999,
					stockQuantity: 10,
				},
			],
			images: [
				{
					url: "https://example.com/image.png",
				},
			],
		});

		expect(repo.createWithDetails).toHaveBeenCalledWith(
			expect.objectContaining({
				variants: expect.any(Array),
				images: expect.any(Array),
			}),
		);
	});
});
