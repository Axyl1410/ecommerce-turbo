import express, { type Router } from "express";
import { asyncHandler, sendError } from "@/lib/api-response-helper";
import type { CategoryController } from "@/presentation/controllers/category.controller";
import AdminMiddleware from "@/presentation/middleware/admin.middleware";
import {
	createCategoryBodySchema,
	deleteCategoryParamsSchema,
	getCategoriesQuerySchema,
	getCategoryByIdParamsSchema,
	getCategoryBySlugParamsSchema,
	updateCategoryBodySchema,
	updateCategoryParamsSchema,
} from "@/presentation/validators/category.validator";

/**
 * Category Routes
 * Defines routes for category endpoints
 */
export function createCategoryRoutes(controller: CategoryController): Router {
	const router = express.Router();

	/**
	 * GET /api/v1/categories
	 * Get list of categories with pagination, filtering, and sorting
	 * Public access (no authentication required)
	 */
	router.get(
		"/",
		asyncHandler(async (req, res) => {
			const validation = getCategoriesQuerySchema.safeParse(req.query);
			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid query parameters",
					400,
				);
				return;
			}
			// Pass validated data directly to controller
			await controller.getCategories(validation.data, res);
		}),
	);

	/**
	 * GET /api/v1/categories/slug/:slug
	 * Get category detail by slug with parent and children
	 * Public access (no authentication required)
	 */
	router.get(
		"/slug/:slug",
		asyncHandler(async (req, res, next) => {
			const validation = getCategoryBySlugParamsSchema.safeParse(req.params);
			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid slug parameter",
					400,
				);
				return;
			}
			next();
		}),
		asyncHandler((req, res) => controller.getCategoryBySlug(req, res)),
	);

	/**
	 * GET /api/v1/categories/:id
	 * Get category detail by ID with parent and children
	 * Public access (no authentication required)
	 */
	router.get(
		"/:id",
		asyncHandler(async (req, res, next) => {
			const validation = getCategoryByIdParamsSchema.safeParse(req.params);
			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid ID parameter",
					400,
				);
				return;
			}
			next();
		}),
		asyncHandler((req, res) => controller.getCategoryById(req, res)),
	);

	/**
	 * POST /api/v1/categories
	 * Create a new category
	 * Admin authentication required
	 */
	router.post(
		"/",
		AdminMiddleware,
		asyncHandler(async (req, res, next) => {
			const validation = createCategoryBodySchema.safeParse(req.body);
			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid request body",
					400,
				);
				return;
			}
			req.body = validation.data;
			next();
		}),
		asyncHandler((req, res) => controller.createCategory(req, res)),
	);

	/**
	 * PUT /api/v1/categories/:id
	 * Update a category
	 * Admin authentication required
	 */
	router.put(
		"/:id",
		AdminMiddleware,
		asyncHandler(async (req, res, next) => {
			const paramsValidation = updateCategoryParamsSchema.safeParse(req.params);
			if (!paramsValidation.success) {
				sendError(
					res,
					paramsValidation.error.issues[0]?.message ?? "Invalid ID parameter",
					400,
				);
				return;
			}

			const bodyValidation = updateCategoryBodySchema.safeParse(req.body);
			if (!bodyValidation.success) {
				sendError(
					res,
					bodyValidation.error.issues[0]?.message ?? "Invalid request body",
					400,
				);
				return;
			}

			req.body = bodyValidation.data;
			next();
		}),
		asyncHandler((req, res) => controller.updateCategory(req, res)),
	);

	/**
	 * DELETE /api/v1/categories/:id
	 * Delete a category
	 * Admin authentication required
	 */
	router.delete(
		"/:id",
		AdminMiddleware,
		asyncHandler(async (req, res, next) => {
			const validation = deleteCategoryParamsSchema.safeParse(req.params);
			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid ID parameter",
					400,
				);
				return;
			}
			next();
		}),
		asyncHandler((req, res) => controller.deleteCategory(req, res)),
	);

	return router;
}
