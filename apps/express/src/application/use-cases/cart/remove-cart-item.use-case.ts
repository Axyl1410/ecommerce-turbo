import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";

export class RemoveCartItemUseCase {
	constructor(
		private cartRepository: ICartRepository,
		private cacheService: ICacheService,
	) {}

	async execute(itemId: string): Promise<void> {
		const existing = await this.cartRepository.getCartItemWithVariant(itemId);
		if (!existing) {
			throw new ApplicationError(
				"Cart item not found",
				"CART_ITEM_NOT_FOUND",
				404,
			);
		}

		await this.cartRepository.removeItem(itemId);
		await this.cacheService.delete(`cart:${existing.item.cartId}`);
	}
}
