import { z } from "zod";

/**
 * Admin Validators
 * Input validation schemas for admin endpoints
 */

// Path parameters for GET /admin/users/:id/accounts
export const getUserAccountsParamsSchema = z.object({
	id: z.string().min(1, "User ID is required"),
});

