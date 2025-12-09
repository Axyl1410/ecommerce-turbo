import type { ICacheService } from "@/application/interfaces/cache.interface";
import { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import { buildProductProps } from "@/test/domain/entities/helpers";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { ApplicationError } from "@/shared/errors/application.error";
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

const getProductByIdUseCaseMock = (): jest.Mocked<GetProductByIdUseCase> =>
	({
		execute: jest.fn(),
	}) as unknown as jest.Mocked<GetProductByIdUseCase>;

describe("UpdateProductUseCase", () => {
	it("updates product successfully", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new UpdateProductUseCase(repo, cache, getProductById);

		const props = buildProductProps({ id: "prod-1", slug: "old-slug" });
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

		const updatedProduct = {
			id: "prod-1",
			name: "Updated Product",
			slug: "old-slug",
		} as any;

		repo.findById.mockResolvedValue(product);
		repo.update.mockResolvedValue(product);
		getProductById.execute.mockResolvedValue(updatedProduct);

		const result = await useCase.execute("prod-1", {
			name: "Updated Product",
		});

		expect(repo.findById).toHaveBeenCalledWith("prod-1");
		expect(repo.update).toHaveBeenCalledWith("prod-1", {
			name: "Updated Product",
		});
		expect(cache.delete).toHaveBeenCalledWith("product:id:prod-1");
		expect(result).toEqual(updatedProduct);
	});

	it("throws NotFoundError when product does not exist", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new UpdateProductUseCase(repo, cache, getProductById);

		repo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("non-existent", { name: "Updated" }),
		).rejects.toBeInstanceOf(NotFoundError);
		expect(repo.update).not.toHaveBeenCalled();
	});

	it("throws ApplicationError when new slug already exists", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new UpdateProductUseCase(repo, cache, getProductById);

		const props = buildProductProps({ id: "prod-1", slug: "old-slug" });
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

		repo.findById.mockResolvedValue(product);
		repo.existsBySlug.mockResolvedValue(true);

		await expect(
			useCase.execute("prod-1", { slug: "existing-slug" }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute("prod-1", { slug: "existing-slug" }),
		).rejects.toThrow("Product with this slug already exists");

		const error = await useCase
			.execute("prod-1", { slug: "existing-slug" })
			.catch((e) => e);
		expect(error.statusCode).toBe(409);
		expect(error.code).toBe("SLUG_EXISTS");
		expect(repo.update).not.toHaveBeenCalled();
	});

	it("allows updating slug to same value", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new UpdateProductUseCase(repo, cache, getProductById);

		const props = buildProductProps({ id: "prod-1", slug: "product-slug" });
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

		const updatedProduct = { id: "prod-1", slug: "product-slug" } as any;

		repo.findById.mockResolvedValue(product);
		repo.update.mockResolvedValue(product);
		getProductById.execute.mockResolvedValue(updatedProduct);

		await useCase.execute("prod-1", { slug: "product-slug" });

		expect(repo.existsBySlug).not.toHaveBeenCalled();
		expect(repo.update).toHaveBeenCalled();
	});

	it("invalidates cache for both old and new slug when slug changes", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const getProductById = getProductByIdUseCaseMock();
		const useCase = new UpdateProductUseCase(repo, cache, getProductById);

		const props = buildProductProps({ id: "prod-1", slug: "old-slug" });
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

		const updatedProduct = { id: "prod-1", slug: "new-slug" } as any;

		repo.findById.mockResolvedValue(product);
		repo.existsBySlug.mockResolvedValue(false);
		repo.update.mockResolvedValue(product);
		getProductById.execute.mockResolvedValue(updatedProduct);

		await useCase.execute("prod-1", { slug: "new-slug" });

		expect(cache.delete).toHaveBeenCalledWith("product:id:prod-1");
		expect(cache.delete).toHaveBeenCalledWith("product:slug:old-slug");
		expect(cache.delete).toHaveBeenCalledWith("product:slug:new-slug");
	});
});

