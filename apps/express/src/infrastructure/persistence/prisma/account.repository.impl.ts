import type { AccountRow } from "@workspace/types";
import { prisma } from "@workspace/database";
import type { IAccountRepository } from "@/domain/repositories/account.repository";

/**
 * Prisma Account Repository Implementation
 */
export class PrismaAccountRepository implements IAccountRepository {
	async findByUserId(
		userId: string,
	): Promise<Array<Pick<AccountRow, "id" | "providerId" | "accountId" | "createdAt">>> {
		const accounts = await prisma.account.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				providerId: true,
				accountId: true,
				createdAt: true,
			},
		});

		return accounts;
	}
}

