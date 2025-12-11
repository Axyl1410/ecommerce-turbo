import type { ICacheService } from "@/application/interfaces/cache.interface";
import { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
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

describe("DeleteProductUseCase", () => {
	it("deletes product successfully", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteProductUseCase(repo, cache);

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

		repo.findById.mockResolvedValue(product);
		repo.delete.mockResolvedValue();

		await useCase.execute("prod-1");

		expect(repo.findById).toHaveBeenCalledWith("prod-1");
		expect(repo.delete).toHaveBeenCalledWith("prod-1");
		expect(cache.delete).toHaveBeenCalledWith("product:id:prod-1");
		expect(cache.delete).toHaveBeenCalledWith("product:slug:product-slug");
	});

	it("throws NotFoundError when product does not exist", async () => {
		const repo = productRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteProductUseCase(repo, cache);

		repo.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			NotFoundError,
		);
		expect(repo.delete).not.toHaveBeenCalled();
	});
});
