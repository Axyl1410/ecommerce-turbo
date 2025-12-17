import type { GetCategoriesDTO } from "@workspace/types";
import type { Response } from "express";
import type { GetBrandsUseCase } from "@/application/use-cases/product/get-brands.use-case";
import {
	sendError,
	sendSuccess,
} from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Brand Controller
 * Handles HTTP requests for brand endpoints
 *
 * Note: For now we only expose a simple GET /brands
 * to support product CRUD screens (brand dropdown).
 */
export class BrandController {
	constructor(private readonly getBrandsUseCase: GetBrandsUseCase) {}

	/**
	 * GET /brands
	 * Get list of brands with pagination, filtering, and sorting
	 */
	async getBrands(
		query: Pick<
			GetCategoriesDTO,
			"page" | "limit" | "search" | "sortBy" | "sortOrder"
		> & {
			active?: boolean;
		},
		res: Response,
	): Promise<void> {
		try {
			const result = await this.getBrandsUseCase.execute({
				page: query.page,
				limit: query.limit,
				active: query.active,
				search: query.search,
				sortBy: query.sortBy,
				sortOrder: query.sortOrder,
			});

			sendSuccess(res, result, "Brands retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

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


