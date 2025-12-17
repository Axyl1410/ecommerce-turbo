import express, { type Router } from "express";
import { asyncHandler, sendError } from "@/lib/api-response-helper";
import type { AdminController } from "@/presentation/controllers/admin.controller";
import AdminMiddleware from "@/presentation/middleware/admin.middleware";
import { getUserAccountsParamsSchema } from "@/presentation/validators/admin.validator";

/**
 * Admin Routes
 * Defines routes for admin endpoints
 */
export function createAdminRoutes(controller: AdminController): Router {
  const router = express.Router();

  /**
   * GET /api/v1/admin/users/:id/accounts
   * Get user accounts to check authentication methods
   * Requires admin authentication
   */
  router.get(
    "/users/:id/accounts",
    AdminMiddleware,
    asyncHandler(async (req, res, next) => {
      const validation = getUserAccountsParamsSchema.safeParse(req.params);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid user ID parameter",
          400
        );
        return;
      }
      next();
    }),
    asyncHandler((req, res) => controller.getUserAccounts(req, res))
  );

  return router;
}
