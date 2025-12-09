import type { Request, Response } from "express";
import { CategoryController } from "@/presentation/controllers/category.controller";
import type { CreateCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import type { DeleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import type { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import type { GetCategoryBySlugUseCase } from "@/application/use-cases/category/get-category-by-slug.use-case";
import type { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";
import type { UpdateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

const createUseCaseMocks = () => ({
	getCategoriesUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetCategoriesUseCase>,
	getCategoryByIdUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetCategoryByIdUseCase>,
	getCategoryBySlugUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetCategoryBySlugUseCase>,
	createCategoryUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<CreateCategoryUseCase>,
	updateCategoryUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<UpdateCategoryUseCase>,
	deleteCategoryUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<DeleteCategoryUseCase>,
});

const createResponseMock = (): jest.Mocked<Response> =>
	({
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}) as unknown as jest.Mocked<Response>;

describe("CategoryController", () => {
	describe("getCategories", () => {
		it("sends success response with categories", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const res = createResponseMock();
			const result = { categories: [], total: 0 };

			useCases.getCategoriesUseCase.execute.mockResolvedValue(result as any);

			await controller.getCategories({}, res);

			expect(useCases.getCategoriesUseCase.execute).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 200,
					message: "Categories retrieved successfully",
					data: result,
				}),
			);
		});

		it("handles errors correctly", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const res = createResponseMock();

			useCases.getCategoriesUseCase.execute.mockRejectedValue(
				new Error("Database error"),
			);

			await controller.getCategories({}, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 500,
					message: "Database error",
				}),
			);
		});
	});

	describe("getCategoryById", () => {
		it("sends success response with category", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: { id: "cat-1" } } as unknown as Request;
			const res = createResponseMock();
			const category = { id: "cat-1", name: "Category" };

			useCases.getCategoryByIdUseCase.execute.mockResolvedValue(category as any);

			await controller.getCategoryById(req, res);

			expect(useCases.getCategoryByIdUseCase.execute).toHaveBeenCalledWith(
				"cat-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					data: category,
				}),
			);
		});

		it("sends error when id is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: {} } as unknown as Request;
			const res = createResponseMock();

			await controller.getCategoryById(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "ERROR",
					message: "Category ID is required",
				}),
			);
		});

		it("handles NotFoundError", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: { id: "non-existent" } } as unknown as Request;
			const res = createResponseMock();

			useCases.getCategoryByIdUseCase.execute.mockRejectedValue(
				new NotFoundError("Category", "non-existent"),
			);

			await controller.getCategoryById(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("getCategoryBySlug", () => {
		it("sends success response with category", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: { slug: "category-slug" } } as unknown as Request;
			const res = createResponseMock();
			const category = { id: "cat-1", slug: "category-slug" };

			useCases.getCategoryBySlugUseCase.execute.mockResolvedValue(
				category as any,
			);

			await controller.getCategoryBySlug(req, res);

			expect(useCases.getCategoryBySlugUseCase.execute).toHaveBeenCalledWith(
				"category-slug",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("sends error when slug is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: {} } as unknown as Request;
			const res = createResponseMock();

			await controller.getCategoryBySlug(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});

	describe("createCategory", () => {
		it("sends success response with created category", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = {
				body: { name: "New Category", slug: "new-category" },
			} as unknown as Request;
			const res = createResponseMock();
			const category = { id: "cat-1", name: "New Category" };

			useCases.createCategoryUseCase.execute.mockResolvedValue(category as any);

			await controller.createCategory(req, res);

			expect(useCases.createCategoryUseCase.execute).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					message: "Category created successfully",
				}),
			);
		});

		it("handles ApplicationError", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = {
				body: { name: "Category", slug: "existing-slug" },
			} as unknown as Request;
			const res = createResponseMock();

			useCases.createCategoryUseCase.execute.mockRejectedValue(
				new ApplicationError("Slug exists", "SLUG_EXISTS", 409),
			);

			await controller.createCategory(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
		});
	});

	describe("updateCategory", () => {
		it("sends success response with updated category", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = {
				params: { id: "cat-1" },
				body: { name: "Updated Category" },
			} as unknown as Request;
			const res = createResponseMock();
			const category = { id: "cat-1", name: "Updated Category" };

			useCases.updateCategoryUseCase.execute.mockResolvedValue(category as any);

			await controller.updateCategory(req, res);

			expect(useCases.updateCategoryUseCase.execute).toHaveBeenCalledWith(
				"cat-1",
				{ name: "Updated Category" },
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("sends error when id is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: {}, body: {} } as unknown as Request;
			const res = createResponseMock();

			await controller.updateCategory(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});

	describe("deleteCategory", () => {
		it("sends success response", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: { id: "cat-1" } } as unknown as Request;
			const res = createResponseMock();

			useCases.deleteCategoryUseCase.execute.mockResolvedValue();

			await controller.deleteCategory(req, res);

			expect(useCases.deleteCategoryUseCase.execute).toHaveBeenCalledWith(
				"cat-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					message: "Category deleted successfully",
					data: null,
				}),
			);
		});

		it("sends error when id is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CategoryController(
				useCases.getCategoriesUseCase,
				useCases.getCategoryByIdUseCase,
				useCases.getCategoryBySlugUseCase,
				useCases.createCategoryUseCase,
				useCases.updateCategoryUseCase,
				useCases.deleteCategoryUseCase,
			);

			const req = { params: {} } as unknown as Request;
			const res = createResponseMock();

			await controller.deleteCategory(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});
});

