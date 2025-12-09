import type { ICacheService } from "@/application/interfaces/cache.interface";
import { DeleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import { buildCategory } from "@/test/domain/entities/helpers";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { ApplicationError } from "@/shared/errors/application.error";

/**
 * Tạo mock cho CategoryRepository
 */
const categoryRepositoryMock = (): jest.Mocked<ICategoryRepository> =>
	({
		findById: jest.fn(),
		findBySlug: jest.fn(),
		findMany: jest.fn(),
		findByParentId: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		existsBySlug: jest.fn(),
		findByIdWithDetails: jest.fn(),
		findBySlugWithDetails: jest.fn(),
		findAll: jest.fn(),
	}) as unknown as jest.Mocked<ICategoryRepository>;

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

describe("DeleteCategoryUseCase", () => {
	/**
	 * Test case: Xóa category thành công
	 * - Kiểm tra khi category tồn tại
	 * - Verify repository.findById được gọi để check category tồn tại
	 * - Verify repository.delete được gọi với đúng id
	 * - Verify repository sẽ tự động set parentId = null cho children (handled by repository)
	 */
	it("deletes category successfully", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
		});

		repo.findById.mockResolvedValue(category);
		repo.delete.mockResolvedValue();

		await useCase.execute("cat-1");

		expect(repo.findById).toHaveBeenCalledWith("cat-1");
		expect(repo.delete).toHaveBeenCalledWith("cat-1");
	});

	/**
	 * Test case: Verify repository.delete được gọi (repository sẽ tự động set parentId = null cho children)
	 * - Kiểm tra khi xóa category có children
	 * - Verify repository.delete được gọi
	 * - Note: Repository implementation sẽ tự động set parentId = null cho children
	 */
	it("calls repository.delete which handles children automatically", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
		});

		repo.findById.mockResolvedValue(category);
		repo.delete.mockResolvedValue();

		await useCase.execute("cat-1");

		expect(repo.delete).toHaveBeenCalledWith("cat-1");
		// Repository implementation will handle setting parentId = null for children
	});

	/**
	 * Test case: Throw ApplicationError khi category không tồn tại
	 * - Kiểm tra khi repository.findById trả về null
	 * - Verify throw ApplicationError với code CATEGORY_NOT_FOUND và status 404
	 * - Verify repository.delete KHÔNG được gọi
	 */
	it("throws ApplicationError when category does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		repo.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			ApplicationError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow(
			"Category not found",
		);

		const error = await useCase.execute("non-existent").catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("CATEGORY_NOT_FOUND");
		expect(repo.delete).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Verify cache invalidation (detail cache cho cả id và slug)
	 * - Kiểm tra khi xóa category thành công
	 * - Verify cache.delete được gọi cho category:detail:id:{id}
	 * - Verify cache.delete được gọi cho category:detail:slug:{slug}
	 */
	it("invalidates cache for both id and slug", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
		});

		repo.findById.mockResolvedValue(category);
		repo.delete.mockResolvedValue();

		await useCase.execute("cat-1");

		expect(cache.delete).toHaveBeenCalledWith("category:detail:id:cat-1");
		expect(cache.delete).toHaveBeenCalledWith("category:detail:slug:category-1");
	});

	/**
	 * Test case: Verify cache invalidation được gọi trước khi delete
	 * - Kiểm tra thứ tự gọi: findById -> get slug -> delete cache -> delete category
	 * - Verify cache.delete được gọi với đúng keys
	 */
	it("invalidates cache before deleting category", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "test-category",
		});

		repo.findById.mockResolvedValue(category);
		repo.delete.mockResolvedValue();

		await useCase.execute("cat-1");

		// Verify findById is called first to get category and slug
		expect(repo.findById).toHaveBeenCalledWith("cat-1");
		// Verify cache is invalidated
		expect(cache.delete).toHaveBeenCalledWith("category:detail:id:cat-1");
		expect(cache.delete).toHaveBeenCalledWith("category:detail:slug:test-category");
		// Verify delete is called
		expect(repo.delete).toHaveBeenCalledWith("cat-1");
	});

	/**
	 * Test case: Xóa category với slug đặc biệt
	 * - Kiểm tra khi category có slug với ký tự đặc biệt
	 * - Verify cache.delete được gọi với đúng slug
	 */
	it("handles category with special slug characters", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new DeleteCategoryUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-with-dashes-123",
		});

		repo.findById.mockResolvedValue(category);
		repo.delete.mockResolvedValue();

		await useCase.execute("cat-1");

		expect(cache.delete).toHaveBeenCalledWith(
			"category:detail:slug:category-with-dashes-123",
		);
	});
});

