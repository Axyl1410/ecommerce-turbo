import { Router } from "express";
import type { BrandController } from "@/presentation/controllers/brand.controller";

/**
 * Brand Routes
 * /api/v1/brands
 */
export function createBrandRoutes(brandController: BrandController): Router {
	const router = Router();

	/**
	 * GET /api/v1/brands
	 * Get list of brands with pagination and filtering
	 */
	router.get("/", (req, res) => {
		const query = {
			page: req.query.page ? Number(req.query.page) : undefined,
			limit: req.query.limit ? Number(req.query.limit) : undefined,
			active: req.query.active === "true" ? true : req.query.active === "false" ? false : undefined,
			search: req.query.search as string | undefined,
			sortBy: req.query.sortBy as "name" | "createdAt" | "updatedAt" | undefined,
			sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
		};
		brandController.getBrands(query, res);
	});

	return router;
}
