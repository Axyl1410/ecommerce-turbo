import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";

export class ClearCartAfterOrderUseCase {
	constructor(
		private cartRepository: ICartRepository,
		private cacheService: ICacheService,
	) {}

	async execute(params: {
		userId?: string;
		sessionId?: string;
	}): Promise<void> {
		if (!params.userId && !params.sessionId) {
			throw new ApplicationError(
				"Either userId or sessionId must be provided",
				"CART_IDENTIFIER_REQUIRED",
				400,
			);
		}

		const cart = params.userId
			? await this.cartRepository.findByUserId(params.userId)
			: await this.cartRepository.findBySessionId(params.sessionId!);

		if (!cart) {
			return;
		}

		await this.cartRepository.clearCart(cart.id);
		await this.cacheService.delete(`cart:${cart.id}`);
	}
}
