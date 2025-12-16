import type { ProductStatusEnumType as ProductStatus } from "@workspace/types";
import { z } from "zod";

/**
 * Product Validators
 * Input validation schemas for product endpoints
 */

// Query parameters for GET /products
export const getProductsQuerySchema = z.object({
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
	status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
	categoryId: z.string().optional(),
	brandId: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Params for GET /products/:id
export const getProductByIdParamsSchema = z.object({
	id: z.string().min(1, "Product ID is required"),
});

// Params for GET /products/slug/:slug
export const getProductBySlugParamsSchema = z.object({
	slug: z.string().min(1, "Product slug is required"),
});

// Body for POST /products
export const createProductBodySchema = z.object({
	name: z.string().min(1, "Product name is required and must be a string"),
	slug: z
		.string()
		.min(1, "Product slug is required and must be a string")
		.regex(
			/^[a-z0-9-_]+$/,
			"Product slug must contain only lowercase letters, numbers, hyphens, and underscores",
		),
	description: z.string().nullable().optional(),
	brandId: z.string().nullable().optional(),
	categoryId: z.string().nullable().optional(),
	defaultImage: z.string().nullable().optional(),
	seoMetaTitle: z.string().nullable().optional(),
	seoMetaDesc: z.string().nullable().optional(),
	status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
	variants: z
		.array(
			z.object({
				sku: z.string().nullable().optional(),
				attributes: z.record(z.string(), z.unknown()).nullable().optional(),
				price: z
					.number()
					.nonnegative("Variant price must be a non-negative number"),
				salePrice: z
					.number()
					.nonnegative("Variant salePrice must be a non-negative number")
					.nullable()
					.optional(),
				stockQuantity: z
					.number()
					.int()
					.nonnegative("Variant stockQuantity must be a non-negative number"),
				weight: z.number().nullable().optional(),
				barcode: z.string().nullable().optional(),
			}),
		)
		.optional(),
	images: z
		.array(
			z.object({
				url: z.string().min(1, "Image URL is required and must be a string"),
				altText: z.string().nullable().optional(),
				sortOrder: z.number().nullable().optional(),
				variantId: z.string().nullable().optional(),
			}),
		)
		.optional(),
});

// Params for PUT /products/:id
export const updateProductParamsSchema = z.object({
	id: z.string().min(1, "Product ID is required"),
});

// Body for PUT /products/:id
export const updateProductBodySchema = z.object({
	name: z.string().optional(),
	slug: z
		.string()
		.regex(
			/^[a-z0-9-_]+$/,
			"Product slug must contain only lowercase letters, numbers, hyphens, and underscores",
		)
		.optional(),
	description: z.string().nullable().optional(),
	brandId: z.string().nullable().optional(),
	categoryId: z.string().nullable().optional(),
	defaultImage: z.string().nullable().optional(),
	seoMetaTitle: z.string().nullable().optional(),
	seoMetaDesc: z.string().nullable().optional(),
	status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

// Params for DELETE /products/:id
export const deleteProductParamsSchema = z.object({
	id: z.string().min(1, "Product ID is required"),
});
