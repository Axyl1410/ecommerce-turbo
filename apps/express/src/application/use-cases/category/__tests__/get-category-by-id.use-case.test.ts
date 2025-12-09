import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import { buildCategory } from "@/test/domain/entities/helpers";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

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

describe("GetCategoryByIdUseCase", () => {
	/**
	 * Test case: Lấy category thành công với parent và children
	 * - Kiểm tra khi category tồn tại
	 * - Verify repository.findByIdWithDetails được gọi với đúng id
	 * - Verify cache.set được gọi để cache kết quả
	 * - Verify kết quả trả về đúng với parent và children
	 */
	it("retrieves category successfully with parent and children", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			name: "Category 1",
			parentId: "parent-1",
		});

		const details = {
			category,
			parent: {
				id: "parent-1",
				name: "Parent Category",
				slug: "parent-category",
			},
			children: [
				{ id: "child-1", name: "Child 1", slug: "child-1" },
				{ id: "child-2", name: "Child 2", slug: "child-2" },
			],
		};

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("cat-1");

		expect(repo.findByIdWithDetails).toHaveBeenCalledWith("cat-1");
		expect(result.id).toBe("cat-1");
		expect(result.name).toBe("Category 1");
		expect(result.parent).toEqual(details.parent);
		expect(result.children).toEqual(details.children);
		expect(cache.set).toHaveBeenCalledWith(
			"category:detail:id:cat-1",
			result,
			300,
		);
	});

	/**
	 * Test case: Throw NotFoundError khi category không tồn tại
	 * - Kiểm tra khi repository.findByIdWithDetails trả về null
	 * - Verify throw NotFoundError với message đúng
	 * - Verify cache.set KHÔNG được gọi
	 */
	it("throws NotFoundError when category does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow(
			"Category",
		);
		expect(cache.set).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Cache hit scenario
	 * - Kiểm tra khi cache có data
	 * - Verify cache.get được gọi với đúng key
	 * - Verify repository.findByIdWithDetails KHÔNG được gọi
	 * - Verify trả về cached data
	 */
	it("returns cached data when available", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		const cachedData = {
			id: "cat-1",
			name: "Category 1",
			slug: "category-1",
			description: null,
			imageUrl: null,
			parentId: null,
			sortOrder: 0,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			parent: null,
			children: [],
		};

		cache.get.mockResolvedValue(cachedData);

		const result = await useCase.execute("cat-1");

		expect(cache.get).toHaveBeenCalledWith("category:detail:id:cat-1");
		expect(repo.findByIdWithDetails).not.toHaveBeenCalled();
		expect(result).toEqual(cachedData);
	});

	/**
	 * Test case: Cache miss scenario
	 * - Kiểm tra khi cache không có data
	 * - Verify cache.get được gọi
	 * - Verify repository.findByIdWithDetails được gọi
	 * - Verify cache.set được gọi để cache kết quả
	 */
	it("fetches from repository and caches result on cache miss", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		const category = buildCategory({ id: "cat-1" });
		const details = {
			category,
			parent: null,
			children: [],
		};

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("cat-1");

		expect(cache.get).toHaveBeenCalledWith("category:detail:id:cat-1");
		expect(repo.findByIdWithDetails).toHaveBeenCalledWith("cat-1");
		expect(cache.set).toHaveBeenCalledWith(
			"category:detail:id:cat-1",
			result,
			300,
		);
	});

	/**
	 * Test case: Category với parent nhưng không có children
	 * - Kiểm tra khi category có parent nhưng không có children
	 * - Verify parent được trả về đúng
	 * - Verify children là empty array
	 */
	it("retrieves category with parent but no children", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			parentId: "parent-1",
		});

		const details = {
			category,
			parent: {
				id: "parent-1",
				name: "Parent",
				slug: "parent",
			},
			children: [],
		};

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("cat-1");

		expect(result.parent).toEqual(details.parent);
		expect(result.children).toEqual([]);
	});

	/**
	 * Test case: Root category (không có parent)
	 * - Kiểm tra khi category là root (parentId = null)
	 * - Verify parent là null
	 * - Verify children được trả về đúng
	 */
	it("retrieves root category without parent", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryByIdUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			parentId: null,
		});

		const details = {
			category,
			parent: null,
			children: [
				{ id: "child-1", name: "Child 1", slug: "child-1" },
			],
		};

		cache.get.mockResolvedValue(null);
		repo.findByIdWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("cat-1");

		expect(result.parent).toBeNull();
		expect(result.children).toHaveLength(1);
	});
});

