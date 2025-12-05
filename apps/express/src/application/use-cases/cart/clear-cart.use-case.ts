import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";

export class ClearCartUseCase {
	constructor(
		private cartRepository: ICartRepository,
		private cacheService: ICacheService,
	) {}

	async execute(cartId: string): Promise<void> {
		const cart = await this.cartRepository.findById(cartId);
		if (!cart) {
			throw new ApplicationError("Cart not found", "CART_NOT_FOUND", 404);
		}

		await this.cartRepository.clearCart(cartId);
		await this.cacheService.delete(`cart:${cartId}`);
	}
}
