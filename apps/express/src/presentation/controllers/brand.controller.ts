import type { Request, Response } from "express";
import type { GetBrandsDTO } from "@/application/dto/brand.dto";
import type { GetBrandsUseCase } from "@/application/use-cases/brand/get-brands.use-case";
import {
	sendError,
	sendSuccess,
} from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";

/**
 * Brand Controller
 * Handles HTTP requests for brand endpoints
 */
export class BrandController {
	constructor(private getBrandsUseCase: GetBrandsUseCase) {}

	/**
	 * GET /brands
	 * Get list of brands with pagination, filtering, and sorting
	 */
	async getBrands(query: GetBrandsDTO, res: Response): Promise<void> {
		try {
			const result = await this.getBrandsUseCase.execute(query);
			sendSuccess(res, result, "Brands retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	private handleError(error: unknown, res: Response): void {
		if (error instanceof ApplicationError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		console.error("Brand controller error:", error);
		sendError(res, "Internal server error", 500);
	}
}
