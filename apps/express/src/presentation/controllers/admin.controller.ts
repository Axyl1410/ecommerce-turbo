import type { Request, Response } from "express";
import type { GetUserAccountsUseCase } from "@/application/use-cases/admin/get-user-accounts.use-case";
import { sendError, sendSuccess } from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";

/**
 * Admin Controller
 * Handles HTTP requests for admin endpoints
 */
export class AdminController {
	constructor(private getUserAccountsUseCase: GetUserAccountsUseCase) {}

	/**
	 * GET /admin/users/:id/accounts
	 * Get user accounts to check authentication methods
	 */
	async getUserAccounts(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			if (!id) {
				sendError(res, "User ID is required", 400);
				return;
			}

			const accounts = await this.getUserAccountsUseCase.execute(id);

			sendSuccess(res, { accounts }, "User accounts retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	private handleError(error: unknown, res: Response): void {
		if (error instanceof ApplicationError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		console.error("Admin controller error:", error);
		sendError(res, "Internal server error", 500);
	}
}

