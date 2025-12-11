import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
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

describe("GetCategoriesUseCase", () => {
	/**
	 * Test case: Lấy danh sách categories với pagination
	 * - Kiểm tra khi gọi với page và limit
	 * - Verify repository.findMany được gọi với đúng params
	 * - Verify cache.set được gọi để cache kết quả
	 * - Verify kết quả trả về đúng với pagination info
	 */
	it("retrieves categories with pagination", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const categories = [
			buildCategory({ id: "cat-1", name: "Category 1" }),
			buildCategory({ id: "cat-2", name: "Category 2" }),
		];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories,
			total: 20,
		});

		const result = await useCase.execute({ page: 1, limit: 10 });

		expect(repo.findMany).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			parentId: undefined,
			active: undefined,
			search: undefined,
			sortBy: "createdAt",
			sortOrder: "desc",
		});
		expect(result.total).toBe(20);
		expect(result.page).toBe(1);
		expect(result.limit).toBe(10);
		expect(result.totalPages).toBe(2);
		expect(result.categories).toHaveLength(2);
		expect(cache.set).toHaveBeenCalledWith(
			"category:list:page:1:limit:10",
			result,
			300,
		);
	});

	/**
	 * Test case: Filter theo parentId (null = root categories)
	 * - Kiểm tra khi filter với parentId = null
	 * - Verify repository.findMany được gọi với parentId = null
	 * - Verify cache key bao gồm parentId:null
	 */
	it("filters categories by parentId (null for root)", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const rootCategories = [buildCategory({ id: "cat-1", parentId: null })];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: rootCategories,
			total: 1,
		});

		const result = await useCase.execute({ parentId: null });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				parentId: null,
			}),
		);
		expect(cache.set).toHaveBeenCalledWith(
			expect.stringContaining("parentId:null"),
			result,
			300,
		);
	});

	/**
	 * Test case: Filter theo parentId (specific parent)
	 * - Kiểm tra khi filter với parentId cụ thể
	 * - Verify repository.findMany được gọi với parentId đúng
	 */
	it("filters categories by specific parentId", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const childCategories = [
			buildCategory({ id: "cat-2", parentId: "parent-1" }),
		];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: childCategories,
			total: 1,
		});

		await useCase.execute({ parentId: "parent-1" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				parentId: "parent-1",
			}),
		);
	});

	/**
	 * Test case: Filter theo active status
	 * - Kiểm tra khi filter với active = true
	 * - Verify repository.findMany được gọi với active = true
	 * - Verify cache key bao gồm active:true
	 */
	it("filters categories by active status", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const activeCategories = [buildCategory({ id: "cat-1", active: true })];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: activeCategories,
			total: 1,
		});

		const result = await useCase.execute({ active: true });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				active: true,
			}),
		);
		expect(cache.set).toHaveBeenCalledWith(
			expect.stringContaining("active:true"),
			result,
			300,
		);
	});

	/**
	 * Test case: Search by name/description
	 * - Kiểm tra khi search với keyword
	 * - Verify repository.findMany được gọi với search param
	 * - Verify cache key bao gồm search keyword
	 */
	it("searches categories by name or description", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const searchResults = [buildCategory({ id: "cat-1", name: "Electronics" })];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: searchResults,
			total: 1,
		});

		const result = await useCase.execute({ search: "Electronics" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				search: "Electronics",
			}),
		);
		expect(cache.set).toHaveBeenCalledWith(
			expect.stringContaining("search:Electronics"),
			result,
			300,
		);
	});

	/**
	 * Test case: Sorting by different fields
	 * - Kiểm tra sorting theo name (asc)
	 * - Verify repository.findMany được gọi với sortBy và sortOrder đúng
	 */
	it("sorts categories by name ascending", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: [],
			total: 0,
		});

		await useCase.execute({ sortBy: "name", sortOrder: "asc" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				sortBy: "name",
				sortOrder: "asc",
			}),
		);
	});

	/**
	 * Test case: Sorting by sortOrder
	 * - Kiểm tra sorting theo sortOrder
	 * - Verify repository.findMany được gọi với sortBy = "sortOrder"
	 */
	it("sorts categories by sortOrder", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: [],
			total: 0,
		});

		await useCase.execute({ sortBy: "sortOrder", sortOrder: "asc" });

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				sortBy: "sortOrder",
				sortOrder: "asc",
			}),
		);
	});

	/**
	 * Test case: Cache hit scenario
	 * - Kiểm tra khi cache có data
	 * - Verify cache.get được gọi
	 * - Verify repository.findMany KHÔNG được gọi
	 * - Verify trả về cached data
	 */
	it("returns cached data when available", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const cachedData = {
			categories: [buildCategory({ id: "cat-1" })],
			total: 1,
			page: 1,
			limit: 10,
			totalPages: 1,
		};

		cache.get.mockResolvedValue(cachedData);

		const result = await useCase.execute({ page: 1, limit: 10 });

		expect(cache.get).toHaveBeenCalledWith("category:list:page:1:limit:10");
		expect(repo.findMany).not.toHaveBeenCalled();
		expect(result).toEqual(cachedData);
	});

	/**
	 * Test case: Cache miss scenario
	 * - Kiểm tra khi cache không có data
	 * - Verify cache.get được gọi
	 * - Verify repository.findMany được gọi
	 * - Verify cache.set được gọi để cache kết quả
	 */
	it("fetches from repository and caches result on cache miss", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		const categories = [buildCategory({ id: "cat-1" })];

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories,
			total: 1,
		});

		const result = await useCase.execute({});

		expect(cache.get).toHaveBeenCalled();
		expect(repo.findMany).toHaveBeenCalled();
		expect(cache.set).toHaveBeenCalledWith(
			expect.stringContaining("category:list"),
			result,
			300,
		);
	});

	/**
	 * Test case: Default pagination values
	 * - Kiểm tra khi không truyền page và limit
	 * - Verify sử dụng default values (page=1, limit=10)
	 */
	it("uses default pagination values when not provided", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCategoriesUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.findMany.mockResolvedValue({
			categories: [],
			total: 0,
		});

		await useCase.execute({});

		expect(repo.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				page: 1,
				limit: 10,
			}),
		);
	});
});
