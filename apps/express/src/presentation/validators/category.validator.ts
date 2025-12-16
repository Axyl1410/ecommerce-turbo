import { z } from "zod";

/**
 * Category Validators
 * Input validation schemas for category endpoints
 */

// Query parameters for GET /categories
export const getCategoriesQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : undefined))
		.refine((val) => !val || val > 0, {
			message: "Page must be greater than 0",
		}),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : undefined))
		.refine((val) => !val || (val >= 1 && val <= 100), {
			message: "Limit must be between 1 and 100",
		}),
	parentId: z.string().nullable().optional(),
	active: z
		.string()
		.optional()
		.transform((val) =>
			val === "true" ? true : val === "false" ? false : undefined,
		),
	search: z.string().optional(),
	sortBy: z.enum(["name", "createdAt", "updatedAt", "sortOrder"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Params for GET /categories/:id
export const getCategoryByIdParamsSchema = z.object({
	id: z.string().min(1, "Category ID is required"),
});

// Params for GET /categories/slug/:slug
export const getCategoryBySlugParamsSchema = z.object({
	slug: z.string().min(1, "Category slug is required"),
});

// Body for POST /categories
export const createCategoryBodySchema = z.object({
	name: z.string().min(1, "Category name is required and must be a string"),
	slug: z
		.string()
		.min(1, "Category slug is required and must be a string")
		.regex(
			/^[a-z0-9-_]+$/,
			"Category slug must contain only lowercase letters, numbers, hyphens, and underscores",
		),
	description: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	parentId: z.string().nullable().optional(),
	sortOrder: z.number().int().nullable().optional(),
	active: z.boolean().optional(),
});

// Params for PUT /categories/:id
export const updateCategoryParamsSchema = z.object({
	id: z.string().min(1, "Category ID is required"),
});

// Body for PUT /categories/:id
export const updateCategoryBodySchema = z.object({
	name: z.string().optional(),
	slug: z
		.string()
		.regex(
			/^[a-z0-9-_]+$/,
			"Category slug must contain only lowercase letters, numbers, hyphens, and underscores",
		)
		.optional(),
	description: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	parentId: z.string().nullable().optional(),
	sortOrder: z.number().int().nullable().optional(),
	active: z.boolean().optional(),
});

// Params for DELETE /categories/:id
export const deleteCategoryParamsSchema = z.object({
	id: z.string().min(1, "Category ID is required"),
});



