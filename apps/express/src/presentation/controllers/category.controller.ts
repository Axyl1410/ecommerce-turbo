import type { Request, Response } from "express";
import type { GetCategoriesDTO } from "@/application/dto/category.dto";
import type { CreateCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import type { DeleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import type { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";
import type { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import type { GetCategoryBySlugUseCase } from "@/application/use-cases/category/get-category-by-slug.use-case";
import type { UpdateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import {
	sendError,
	sendSuccess,
	sendSuccessNoData,
} from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Category Controller
 * Handles HTTP requests for category endpoints
 */
export class CategoryController {
	constructor(
		private getCategoriesUseCase: GetCategoriesUseCase,
		private getCategoryByIdUseCase: GetCategoryByIdUseCase,
		private getCategoryBySlugUseCase: GetCategoryBySlugUseCase,
		private createCategoryUseCase: CreateCategoryUseCase,
		private updateCategoryUseCase: UpdateCategoryUseCase,
		private deleteCategoryUseCase: DeleteCategoryUseCase,
	) {}

	/**
	 * GET /categories
	 * Get list of categories with pagination, filtering, and sorting
	 */
	async getCategories(query: GetCategoriesDTO, res: Response): Promise<void> {
		try {
			const result = await this.getCategoriesUseCase.execute(query);
			sendSuccess(res, result, "Categories retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * GET /categories/:id
	 * Get category detail by ID
	 */
	async getCategoryById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Category ID is required", 400);
				return;
			}
			const category = await this.getCategoryByIdUseCase.execute(id);
			sendSuccess(res, category, "Category retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * GET /categories/slug/:slug
	 * Get category detail by slug
	 */
	async getCategoryBySlug(req: Request, res: Response): Promise<void> {
		try {
			const { slug } = req.params;
			if (!slug) {
				sendError(res, "Category slug is required", 400);
				return;
			}
			const category = await this.getCategoryBySlugUseCase.execute(slug);
			sendSuccess(res, category, "Category retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * POST /categories
	 * Create a new category
	 */
	async createCategory(req: Request, res: Response): Promise<void> {
		try {
			const category = await this.createCategoryUseCase.execute(req.body);
			sendSuccess(res, category, "Category created successfully", 201);
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * PUT /categories/:id
	 * Update a category
	 */
	async updateCategory(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Category ID is required", 400);
				return;
			}
			const category = await this.updateCategoryUseCase.execute(id, req.body);
			sendSuccess(res, category, "Category updated successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * DELETE /categories/:id
	 * Delete a category
	 */
	async deleteCategory(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Category ID is required", 400);
				return;
			}
			await this.deleteCategoryUseCase.execute(id);
			sendSuccessNoData(res, "Category deleted successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * Handle errors and send appropriate response
	 */
	private handleError(error: unknown, res: Response): void {
		if (error instanceof NotFoundError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		if (error instanceof ApplicationError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		const errorMessage =
			error instanceof Error ? error.message : "Internal server error";
		sendError(res, errorMessage, 500);
	}
}
