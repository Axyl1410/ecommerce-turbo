import express, { type Router } from "express";
import { asyncHandler, sendError } from "@/lib/api-response-helper";
import type { BrandController } from "@/presentation/controllers/brand.controller";
import { getBrandsQuerySchema } from "@/presentation/validators/brand.validator";

/**
 * Brand Routes
 * Defines routes for brand endpoints
 *
 * For now we only support listing brands for product CRUD helpers.
 */
export function createBrandRoutes(controller: BrandController): Router {
	const router = express.Router();

	/**
	 * GET /api/v1/brands
	 * Get list of brands with pagination, filtering, and sorting
	 * Public access (no authentication required)
	 */
	router.get(
		"/",
		asyncHandler(async (req, res) => {
			const validation = getBrandsQuerySchema.safeParse(req.query);

			if (!validation.success) {
				sendError(
					res,
					validation.error.issues[0]?.message ?? "Invalid query parameters",
					400,
				);
				return;
			}

			await controller.getBrands(validation.data, res);
		}),
	);

	return router;
}


