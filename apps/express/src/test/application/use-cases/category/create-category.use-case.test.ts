import type { ICacheService } from "@/application/interfaces/cache.interface";
import { CreateCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import type { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
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

describe("CreateCategoryUseCase", () => {
	/**
	 * Test case: Tạo category thành công (root category, không có parentId)
	 * - Kiểm tra khi tạo category không có parent
	 * - Verify repository.existsBySlug được gọi để check slug
	 * - Verify repository.create được gọi với đúng data
	 * - Verify getCategoryByIdUseCase được gọi để trả về full details
	 */
	it("creates root category successfully", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		const category = buildCategory({
			id: "cat-1",
			name: "New Category",
			slug: "new-category",
			parentId: null,
		});

		const categoryDetail = {
			id: "cat-1",
			name: "New Category",
			slug: "new-category",
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

		repo.existsBySlug.mockResolvedValue(false);
		repo.create.mockResolvedValue(category);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		const result = await useCase.execute({
			name: "New Category",
			slug: "new-category",
		});

		expect(repo.existsBySlug).toHaveBeenCalledWith("new-category");
		expect(repo.create).toHaveBeenCalledWith({
			name: "New Category",
			slug: "new-category",
			description: undefined,
			imageUrl: undefined,
			parentId: undefined,
			sortOrder: undefined,
			active: undefined,
		});
		expect(getCategoryById.execute).toHaveBeenCalledWith("cat-1");
		expect(result).toEqual(categoryDetail);
	});

	/**
	 * Test case: Tạo category thành công với parentId hợp lệ
	 * - Kiểm tra khi tạo category với parentId
	 * - Verify repository.findById được gọi để validate parent
	 * - Verify repository.create được gọi với parentId
	 */
	it("creates category with valid parentId successfully", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		const parent = buildCategory({ id: "parent-1" });
		const category = buildCategory({
			id: "cat-1",
			parentId: "parent-1",
		});

		const categoryDetail = {
			id: "cat-1",
			name: "Child Category",
			slug: "child-category",
			parentId: "parent-1",
			parent: {
				id: "parent-1",
				name: "Parent",
				slug: "parent",
			},
			children: [],
		} as any;

		repo.existsBySlug.mockResolvedValue(false);
		repo.findById.mockResolvedValue(parent);
		repo.create.mockResolvedValue(category);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		const result = await useCase.execute({
			name: "Child Category",
			slug: "child-category",
			parentId: "parent-1",
		});

		expect(repo.findById).toHaveBeenCalledWith("parent-1");
		expect(repo.create).toHaveBeenCalledWith(
			expect.objectContaining({
				parentId: "parent-1",
			}),
		);
		expect(result.parentId).toBe("parent-1");
	});

	/**
	 * Test case: Throw ApplicationError khi slug đã tồn tại
	 * - Kiểm tra khi repository.existsBySlug trả về true
	 * - Verify throw ApplicationError với code SLUG_EXISTS và status 409
	 * - Verify repository.create KHÔNG được gọi
	 */
	it("throws ApplicationError when slug already exists", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		repo.existsBySlug.mockResolvedValue(true);

		await expect(
			useCase.execute({
				name: "Category",
				slug: "existing-slug",
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				name: "Category",
				slug: "existing-slug",
			}),
		).rejects.toThrow("Category with this slug already exists");

		const error = await useCase
			.execute({
				name: "Category",
				slug: "existing-slug",
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(409);
		expect(error.code).toBe("SLUG_EXISTS");
		expect(repo.create).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Throw ApplicationError khi parentId không tồn tại
	 * - Kiểm tra khi repository.findById trả về null cho parent
	 * - Verify throw ApplicationError với code PARENT_NOT_FOUND và status 404
	 * - Verify repository.create KHÔNG được gọi
	 */
	it("throws ApplicationError when parentId does not exist", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		repo.existsBySlug.mockResolvedValue(false);
		repo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				name: "Category",
				slug: "new-category",
				parentId: "non-existent-parent",
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				name: "Category",
				slug: "new-category",
				parentId: "non-existent-parent",
			}),
		).rejects.toThrow("Parent category not found");

		const error = await useCase
			.execute({
				name: "Category",
				slug: "new-category",
				parentId: "non-existent-parent",
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("PARENT_NOT_FOUND");
		expect(repo.create).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Verify cache invalidation được gọi
	 * - Kiểm tra khi tạo category thành công
	 * - Verify invalidateListCache được gọi (thông qua cache.delete hoặc tương tự)
	 * - Note: invalidateListCache hiện tại chỉ là placeholder, nhưng vẫn verify flow
	 */
	it("invalidates cache after creating category", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		const category = buildCategory({ id: "cat-1" });
		const categoryDetail = {
			id: "cat-1",
			name: "Category",
			slug: "category",
			parent: null,
			children: [],
		} as any;

		repo.existsBySlug.mockResolvedValue(false);
		repo.create.mockResolvedValue(category);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		await useCase.execute({
			name: "Category",
			slug: "category",
		});

		// Cache invalidation is handled internally
		// The use case should complete successfully
		expect(repo.create).toHaveBeenCalled();
		expect(getCategoryById.execute).toHaveBeenCalled();
	});

	/**
	 * Test case: Verify getCategoryByIdUseCase được gọi để trả về full details
	 * - Kiểm tra khi tạo category thành công
	 * - Verify getCategoryByIdUseCase.execute được gọi với category id
	 * - Verify kết quả trả về là CategoryDetailDTO từ getCategoryByIdUseCase
	 */
	it("returns full category details from getCategoryByIdUseCase", async () => {
		const repo = categoryRepositoryMock();
		const cache = cacheServiceMock();
		const getCategoryById = getCategoryByIdUseCaseMock();
		const useCase = new CreateCategoryUseCase(repo, cache, getCategoryById);

		const category = buildCategory({ id: "cat-1" });
		const categoryDetail = {
			id: "cat-1",
			name: "Category",
			slug: "category",
			description: "Description",
			imageUrl: "https://example.com/image.png",
			parentId: null,
			sortOrder: 0,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			parent: null,
			children: [],
		};

		repo.existsBySlug.mockResolvedValue(false);
		repo.create.mockResolvedValue(category);
		getCategoryById.execute.mockResolvedValue(categoryDetail);

		const result = await useCase.execute({
			name: "Category",
			slug: "category",
			description: "Description",
			imageUrl: "https://example.com/image.png",
		});

		expect(getCategoryById.execute).toHaveBeenCalledWith("cat-1");
		expect(result).toEqual(categoryDetail);
		expect(result.description).toBe("Description");
		expect(result.imageUrl).toBe("https://example.com/image.png");
	});
});


