import type { IAccountRepository } from "@/domain/repositories/account.repository";
import type { AccountRow } from "@workspace/types";

/**
 * Get User Accounts Use Case
 * Handles retrieving user accounts to check authentication methods
 */
export class GetUserAccountsUseCase {
	constructor(private accountRepository: IAccountRepository) {}

	async execute(userId: string): Promise<Array<Pick<AccountRow, "id" | "providerId" | "accountId" | "createdAt">>> {
		return this.accountRepository.findByUserId(userId);
	}
}

