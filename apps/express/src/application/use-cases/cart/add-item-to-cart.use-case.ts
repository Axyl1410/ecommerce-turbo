import type { CartItemDTO } from "@workspace/types";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { CartMapper } from "./cart.mapper";

export class AddItemToCartUseCase {
	constructor(
		private cartRepository: ICartRepository,
		private cacheService: ICacheService,
	) {}

	async execute(params: { // tiengg viet: thực hiện thêm sản phẩm vào giỏ hàng
		cartId: string;
		variantId: string;
		quantity: number;
	}): Promise<CartItemDTO> {
		if (params.quantity <= 0) { // tiengg viet: kiểm tra số lượng sản phẩm phải lớn hơn 0
			throw new ApplicationError(
				"Quantity must be greater than 0",
				"INVALID_QUANTITY",
				400,
			);
		}

		const variant = await this.cartRepository.getVariantInfo(params.variantId);
		if (!variant) {
			throw new ApplicationError(
				"Product variant not found",
				"VARIANT_NOT_FOUND",
				404,
			);
		}

		if (variant.productStatus !== "PUBLISHED") {
			throw new ApplicationError(
				`Product is not available (status: ${variant.productStatus})`,
				"VARIANT_UNAVAILABLE",
				400,
			);
		}

		const priceSnapshot = Number(variant.salePrice ?? variant.price);

		const item = await this.cartRepository.addOrUpdateItem({
			cartId: params.cartId,
			variantId: params.variantId,
			quantity: params.quantity,
			priceSnapshot,
		});

		await this.cacheService.delete(`cart:${params.cartId}`);

		return CartMapper.toItemDTO(item, item.createdAt);
	}
}
