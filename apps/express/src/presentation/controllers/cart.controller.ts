import type { Response } from "express";
import type { AddItemToCartUseCase } from "@/application/use-cases/cart/add-item-to-cart.use-case";
import type { ClearCartUseCase } from "@/application/use-cases/cart/clear-cart.use-case";
import type { GetCartDetailsUseCase } from "@/application/use-cases/cart/get-cart-details.use-case";
import type { GetOrCreateCartUseCase } from "@/application/use-cases/cart/get-or-create-cart.use-case";
import type { RemoveCartItemUseCase } from "@/application/use-cases/cart/remove-cart-item.use-case";
import type { UpdateCartItemUseCase } from "@/application/use-cases/cart/update-cart-item.use-case";
import {
	sendError,
	sendSuccess,
	sendSuccessNoData,
} from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";

type Identifier = {
	userId?: string;
	sessionId?: string;
};

export class CartController {
	constructor(
		private getOrCreateCartUseCase: GetOrCreateCartUseCase,
		private getCartDetailsUseCase: GetCartDetailsUseCase,
		private addItemToCartUseCase: AddItemToCartUseCase,
		private updateCartItemUseCase: UpdateCartItemUseCase,
		private removeCartItemUseCase: RemoveCartItemUseCase,
		private clearCartUseCase: ClearCartUseCase,
	) {}

	async getCart(identifier: Identifier, res: Response): Promise<void> {
		try {
			const cart = await this.getOrCreateCartUseCase.execute(identifier);
			const cartDetails = await this.getCartDetailsUseCase.execute(cart.id);

			if (!cartDetails) {
				sendError(res, "Cart not found", 404);
				return;
			}

			sendSuccess(res, cartDetails, "Cart retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	async addItem(
		identifier: Identifier,
		body: { variantId: string; quantity: number },
		res: Response,
	): Promise<void> {
		try {
			const cart = await this.getOrCreateCartUseCase.execute(identifier);
			const item = await this.addItemToCartUseCase.execute({
				cartId: cart.id,
				variantId: body.variantId,
				quantity: body.quantity,
			});
			sendSuccess(res, item, "Item added to cart successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	async updateItem(
		body: { itemId: string; quantity: number },
		res: Response,
	): Promise<void> {
		try {
			const item = await this.updateCartItemUseCase.execute(body);
			if (!item) {
				sendSuccessNoData(
					res,
					"Cart item removed because quantity reached zero",
				);
				return;
			}
			sendSuccess(res, item, "Cart item updated successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	async removeItem(itemId: string, res: Response): Promise<void> {
		try {
			await this.removeCartItemUseCase.execute(itemId);
			sendSuccessNoData(res, "Item removed from cart successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	async clearCart(identifier: Identifier, res: Response): Promise<void> {
		try {
			const cart = await this.getOrCreateCartUseCase.execute(identifier);
			await this.clearCartUseCase.execute(cart.id);
			sendSuccessNoData(res, "Cart cleared successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	private handleError(error: unknown, res: Response): void {
		if (error instanceof ApplicationError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		const message =
			error instanceof Error ? error.message : "Internal server error";
		sendError(res, message, 500);
	}
}
