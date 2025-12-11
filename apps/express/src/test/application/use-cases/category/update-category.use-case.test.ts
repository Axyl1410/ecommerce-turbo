import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import { UpdateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { buildCategory } from "@/test/domain/entities/helpers";

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

/**
 * Tạo mock cho GetCategoryByIdUseCase
 */
const getCategoryByIdUseCaseMock = (): jest.Mocked<GetCategoryByIdUseCase> =>
	({
		execute: jest.fn(),
	}) as unknown as jest.Mocked<GetCategoryByIdUseCase>;

describe("UpdateCategoryUseCase", () => {
	/**
	 * Test case: Update category thành công (update name, description, etc.)
	 * - Kiểm tra khi update các field thông thường
	 * - Verify repository.findById được gọi để check category tồn tại
	 * - Verify repository.update được gọi với đúng data
	 * - Verify getCategoryByIdUseCase được gọi để trả về updated category
	 */
	it("updates category successfully", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({
			id: "cat-1",
			name: "Old Name",
		});
		const updated = buildCategory({
			id: "cat-1",
			name: "New Name",
			description: "New Description",
		});

		const categoryDetail = {
			id: "cat-1",
			name: "New Name",
			description: "New Description",
			parent: null,
			children: [],
		} as any;

		repo.findById.mockResolvedValue(existing);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		const result = await useCase.execute("cat-1", {
			name: "New Name",
			description: "New Description",
		});

		expect(repo.findById).toHaveBeenCalledWith("cat-1");
		expect(repo.update).toHaveBeenCalledWith("cat-1", {
			name: "New Name",
			description: "New Description",
		});
		expect(getCategoryById.execute).toHaveBeenCalledWith("cat-1");
		expect(result.name).toBe("New Name");
	});

	/**
	 * Test case: Update slug thành công
	 * - Kiểm tra khi update slug
	 * - Verify repository.existsBySlug được gọi với excludeId
	 * - Verify repository.update được gọi với slug mới
	 */
	it("updates slug successfully", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({
			id: "cat-1",
			slug: "old-slug",
		});
		const updated = buildCategory({
			id: "cat-1",
			slug: "new-slug",
		});

		const categoryDetail = {
			id: "cat-1",
			slug: "new-slug",
			parent: null,
			children: [],
		} as any;

		repo.findById.mockResolvedValue(existing);
		repo.existsBySlug.mockResolvedValue(false);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		await useCase.execute("cat-1", { slug: "new-slug" });

		expect(repo.existsBySlug).toHaveBeenCalledWith("new-slug", "cat-1");
		expect(repo.update).toHaveBeenCalledWith("cat-1", { slug: "new-slug" });
	});

	/**
	 * Test case: Update parentId thành công (set parent hợp lệ)
	 * - Kiểm tra khi update parentId với parent hợp lệ
	 * - Verify repository.findById được gọi cho cả category và parent
	 * - Verify repository.findAll được gọi để check circular reference
	 * - Verify repository.update được gọi
	 */
	it("updates parentId successfully with valid parent", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({
			id: "cat-1",
			parentId: null,
		});
		const parent = buildCategory({ id: "parent-1" });
		const updated = buildCategory({
			id: "cat-1",
			parentId: "parent-1",
		});

		const allCategories = [existing, parent];
		const categoryDetail = {
			id: "cat-1",
			parentId: "parent-1",
			parent: { id: "parent-1", name: "Parent", slug: "parent" },
			children: [],
		} as any;

		repo.findById.mockResolvedValueOnce(existing).mockResolvedValueOnce(parent);
		repo.findAll.mockResolvedValue(allCategories);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		await useCase.execute("cat-1", { parentId: "parent-1" });

		expect(repo.findById).toHaveBeenCalledWith("parent-1");
		expect(repo.update).toHaveBeenCalledWith("cat-1", {
			parentId: "parent-1",
		});
	});

	/**
	 * Test case: Set parentId = null (remove parent)
	 * - Kiểm tra khi set parentId = null
	 * - Verify repository.update được gọi với parentId = null
	 */
	it("removes parent by setting parentId to null", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({
			id: "cat-1",
			parentId: "parent-1",
		});
		const updated = buildCategory({
			id: "cat-1",
			parentId: null,
		});

		const categoryDetail = {
			id: "cat-1",
			parentId: null,
			parent: null,
			children: [],
		} as any;

		repo.findById.mockResolvedValue(existing);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		await useCase.execute("cat-1", { parentId: null });

		expect(repo.update).toHaveBeenCalledWith("cat-1", { parentId: null });
	});

	/**
	 * Test case: Throw ApplicationError khi category không tồn tại
	 * - Kiểm tra khi repository.findById trả về null
	 * - Verify throw ApplicationError với code CATEGORY_NOT_FOUND và status 404
	 */
	it("throws ApplicationError when category does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		repo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("non-existent", { name: "New" }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute("non-existent", { name: "New" }),
		).rejects.toThrow("Category not found");

		const error = await useCase
			.execute("non-existent", { name: "New" })
			.catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("CATEGORY_NOT_FOUND");
	});

	/**
	 * Test case: Throw ApplicationError khi slug mới đã tồn tại
	 * - Kiểm tra khi repository.existsBySlug trả về true
	 * - Verify throw ApplicationError với code SLUG_EXISTS và status 409
	 */
	it("throws ApplicationError when new slug already exists", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({ id: "cat-1" });

		repo.findById.mockResolvedValue(existing);
		repo.existsBySlug.mockResolvedValue(true);

		await expect(
			useCase.execute("cat-1", { slug: "existing-slug" }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute("cat-1", { slug: "existing-slug" }),
		).rejects.toThrow("Category with this slug already exists");

		const error = await useCase
			.execute("cat-1", { slug: "existing-slug" })
			.catch((e) => e);
		expect(error.statusCode).toBe(409);
		expect(error.code).toBe("SLUG_EXISTS");
	});

	/**
	 * Test case: Throw ApplicationError khi set parentId = chính nó
	 * - Kiểm tra khi parentId = category id
	 * - Verify throw ApplicationError với code CIRCULAR_REFERENCE và status 400
	 */
	it("throws ApplicationError when setting parentId to itself", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({ id: "cat-1" });

		repo.findById.mockResolvedValue(existing);

		await expect(
			useCase.execute("cat-1", { parentId: "cat-1" }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute("cat-1", { parentId: "cat-1" }),
		).rejects.toThrow("Cannot set category as its own parent");

		const error = await useCase
			.execute("cat-1", { parentId: "cat-1" })
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("CIRCULAR_REFERENCE");
	});

	/**
	 * Test case: Throw ApplicationError khi set parentId = một trong children
	 * - Kiểm tra khi parentId là một trong children (circular reference)
	 * - Verify throw ApplicationError với code CIRCULAR_REFERENCE và status 400
	 */
	it("throws ApplicationError when setting parentId to a descendant", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		// Category structure: cat-1 -> child-1 -> grandchild-1
		// We want to set cat-1's parentId to grandchild-1, which is a descendant
		const cat1 = buildCategory({ id: "cat-1", parentId: null });
		const child1 = buildCategory({ id: "child-1", parentId: "cat-1" });
		const grandchild1 = buildCategory({
			id: "grandchild-1",
			parentId: "child-1",
		});

		// Mock calls for each execute: 1) findById("cat-1") for existing check, 2) findById("grandchild-1") for parent validation
		// Note: invalidateCache won't be called because we throw error before update
		repo.findById
			.mockResolvedValueOnce(cat1) // Check if cat-1 exists
			.mockResolvedValueOnce(grandchild1); // Check if grandchild-1 exists as parent
		repo.findAll.mockResolvedValue([cat1, child1, grandchild1]);

		const error = await useCase
			.execute("cat-1", { parentId: "grandchild-1" })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApplicationError);
		expect(error.message).toBe(
			"Cannot set parent to a descendant category (circular reference)",
		);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("CIRCULAR_REFERENCE");
	});

	/**
	 * Test case: Throw ApplicationError khi parentId không tồn tại
	 * - Kiểm tra khi repository.findById trả về null cho parent
	 * - Verify throw ApplicationError với code PARENT_NOT_FOUND và status 404
	 */
	it("throws ApplicationError when parentId does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({ id: "cat-1" });

		// Mock calls: 1) findById("cat-1") for existing category check, 2) findById("non-existent") for parent validation (returns null)
		// Note: invalidateCache won't be called because we throw error before update
		repo.findById
			.mockResolvedValueOnce(existing) // Check if cat-1 exists
			.mockResolvedValueOnce(null); // Check if parent "non-existent" exists (returns null)

		const error = await useCase
			.execute("cat-1", { parentId: "non-existent" })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApplicationError);
		expect(error.message).toBe("Parent category not found");
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("PARENT_NOT_FOUND");
	});

	/**
	 * Test case: Verify cache invalidation
	 * - Kiểm tra khi update category thành công
	 * - Verify cache.delete được gọi cho detail cache (id và slug)
	 */
	it("invalidates cache after updating category", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({
			id: "cat-1",
			slug: "old-slug",
		});
		const updated = buildCategory({
			id: "cat-1",
			slug: "new-slug",
		});

		const categoryDetail = {
			id: "cat-1",
			slug: "new-slug",
			parent: null,
			children: [],
		} as any;

		// Mock calls: 1) findById for existing check, 2) findById in invalidateCache (after update, returns updated category)
		repo.findById
			.mockResolvedValueOnce(existing) // Check if cat-1 exists
			.mockResolvedValueOnce(updated); // In invalidateCache, get updated category with new slug
		repo.existsBySlug.mockResolvedValue(false);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		await useCase.execute("cat-1", { slug: "new-slug" });

		expect(cache.delete).toHaveBeenCalledWith("category:detail:id:cat-1");
		expect(cache.delete).toHaveBeenCalledWith("category:detail:slug:new-slug");
	});

	/**
	 * Test case: Verify getCategoryByIdUseCase được gọi để trả về updated category
	 * - Kiểm tra khi update category thành công
	 * - Verify getCategoryByIdUseCase.execute được gọi với category id
	 * - Verify kết quả trả về là CategoryDetailDTO từ getCategoryByIdUseCase
	 */
	it("returns updated category details from getCategoryByIdUseCase", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new UpdateCategoryUseCase(repo, cache, getCategoryById);

		const existing = buildCategory({ id: "cat-1" });
		const updated = buildCategory({ id: "cat-1", name: "Updated Name" });

		const categoryDetail = {
			id: "cat-1",
			name: "Updated Name",
			parent: null,
			children: [],
		} as any;

		repo.findById.mockResolvedValue(existing);
		repo.update.mockResolvedValue(updated);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		const result = await useCase.execute("cat-1", { name: "Updated Name" });

		expect(getCategoryById.execute).toHaveBeenCalledWith("cat-1");
		expect(result).toEqual(categoryDetail);
		expect(result.name).toBe("Updated Name");
	});
});
