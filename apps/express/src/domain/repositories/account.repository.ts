import type { AccountRow } from "@workspace/types";

/**
 * Account Repository Interface
 * Defines methods for account data access
 */
export interface IAccountRepository {
	/**
	 * Find all accounts for a user
	 * @param userId - User ID
	 * @returns Array of account rows
	 */
	findByUserId(userId: string): Promise<Array<Pick<AccountRow, "id" | "providerId" | "accountId" | "createdAt">>>;
}

