import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetCategoryBySlugUseCase } from "@/application/use-cases/category/get-category-by-slug.use-case";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";
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

describe("GetCategoryBySlugUseCase", () => {
	/**
	 * Test case: Lấy category thành công theo slug với parent và children
	 * - Kiểm tra khi category tồn tại với slug
	 * - Verify repository.findBySlugWithDetails được gọi với đúng slug
	 * - Verify cache.set được gọi để cache kết quả
	 * - Verify kết quả trả về đúng với parent và children
	 */
	it("retrieves category successfully by slug with parent and children", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			name: "Category 1",
			slug: "category-1",
			parentId: "parent-1",
		});

		const details = {
			category,
			parent: {
				id: "parent-1",
				name: "Parent Category",
				slug: "parent-category",
			},
			children: [{ id: "child-1", name: "Child 1", slug: "child-1" }],
		};

		cache.get.mockResolvedValue(null);
		repo.findBySlugWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("category-1");

		expect(repo.findBySlugWithDetails).toHaveBeenCalledWith("category-1");
		expect(result.id).toBe("cat-1");
		expect(result.slug).toBe("category-1");
		expect(result.parent).toEqual(details.parent);
		expect(result.children).toEqual(details.children);
		expect(cache.set).toHaveBeenCalledWith(
			"category:detail:slug:category-1",
			result,
			300,
		);
	});

	/**
	 * Test case: Throw NotFoundError khi slug không tồn tại
	 * - Kiểm tra khi repository.findBySlugWithDetails trả về null
	 * - Verify throw NotFoundError với message đúng
	 * - Verify cache.set KHÔNG được gọi
	 */
	it("throws NotFoundError when slug does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findBySlugWithDetails.mockResolvedValue(null);

		await expect(useCase.execute("non-existent-slug")).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(useCase.execute("non-existent-slug")).rejects.toThrow(
			"Category",
		);
		expect(cache.set).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Cache hit scenario
	 * - Kiểm tra khi cache có data
	 * - Verify cache.get được gọi với đúng key (slug-based)
	 * - Verify repository.findBySlugWithDetails KHÔNG được gọi
	 * - Verify trả về cached data
	 */
	it("returns cached data when available", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

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

		const result = await useCase.execute("category-1");

		expect(cache.get).toHaveBeenCalledWith("category:detail:slug:category-1");
		expect(repo.findBySlugWithDetails).not.toHaveBeenCalled();
		expect(result).toEqual(cachedData);
	});

	/**
	 * Test case: Cache miss scenario
	 * - Kiểm tra khi cache không có data
	 * - Verify cache.get được gọi
	 * - Verify repository.findBySlugWithDetails được gọi
	 * - Verify cache.set được gọi để cache kết quả với slug-based key
	 */
	it("fetches from repository and caches result on cache miss", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
		});
		const details = {
			category,
			parent: null,
			children: [],
		};

		cache.get.mockResolvedValue(null);
		repo.findBySlugWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("category-1");

		expect(cache.get).toHaveBeenCalledWith("category:detail:slug:category-1");
		expect(repo.findBySlugWithDetails).toHaveBeenCalledWith("category-1");
		expect(cache.set).toHaveBeenCalledWith(
			"category:detail:slug:category-1",
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
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
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
		repo.findBySlugWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("category-1");

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
		const useCase = new GetCategoryBySlugUseCase(repo, cache);

		const category = buildCategory({
			id: "cat-1",
			slug: "category-1",
			parentId: null,
		});

		const details = {
			category,
			parent: null,
			children: [{ id: "child-1", name: "Child 1", slug: "child-1" }],
		};

		cache.get.mockResolvedValue(null);
		repo.findBySlugWithDetails.mockResolvedValue(details);

		const result = await useCase.execute("category-1");

		expect(result.parent).toBeNull();
		expect(result.children).toHaveLength(1);
	});
});
