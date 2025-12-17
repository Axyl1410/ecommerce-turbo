import { z } from "zod";

/**
 * Brand Validators
 * Input validation schemas for brand endpoints
 */

// Query parameters for GET /brands
export const getBrandsQuerySchema = z.object({
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
	active: z
		.string()
		.optional()
		.transform((val) => {
			if (val === undefined) return undefined;
			return val === "true";
		}),
	search: z.string().optional(),
	sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});


