import type { CartItemDTO } from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { CartMapper } from "./cart.mapper";

export class UpdateCartItemUseCase {
	constructor(
		private cartRepository: ICartRepository,
		private cacheService: ICacheService,
	) {}

	async execute(params: {
		itemId: string;
		quantity: number;
	}): Promise<CartItemDTO | null> {
		if (params.quantity < 0) {
			throw new ApplicationError(
				"Quantity must be zero or greater",
				"INVALID_QUANTITY",
				400,
			);
		}

		const existing = await this.cartRepository.getCartItemWithVariant(
			params.itemId,
		);

		if (!existing) {
			throw new ApplicationError(
				"Cart item not found",
				"CART_ITEM_NOT_FOUND",
				404,
			);
		}

		if (params.quantity === 0) {
			await this.cartRepository.removeItem(params.itemId);
			await this.cacheService.delete(`cart:${existing.item.cartId}`);
			return null;
		}

		if (existing.variant.productStatus !== "PUBLISHED") {
			throw new ApplicationError(
				`Product is not available (status: ${existing.variant.productStatus})`,
				"VARIANT_UNAVAILABLE",
				400,
			);
		}

		if (params.quantity > existing.variant.stockQuantity) {
			throw new ApplicationError(
				`Insufficient stock. Only ${existing.variant.stockQuantity} items available.`,
				"INSUFFICIENT_STOCK",
				400,
			);
		}

		const updated = await this.cartRepository.updateItemQuantity(
			params.itemId,
			params.quantity,
		);

		await this.cacheService.delete(`cart:${updated.cartId}`);

		return CartMapper.toItemDTO(updated, updated.createdAt);
	}
}
