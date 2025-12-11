import type { Response } from "express";
import type { AddItemToCartUseCase } from "@/application/use-cases/cart/add-item-to-cart.use-case";
import type { ClearCartUseCase } from "@/application/use-cases/cart/clear-cart.use-case";
import type { GetCartDetailsUseCase } from "@/application/use-cases/cart/get-cart-details.use-case";
import type { GetOrCreateCartUseCase } from "@/application/use-cases/cart/get-or-create-cart.use-case";
import type { RemoveCartItemUseCase } from "@/application/use-cases/cart/remove-cart-item.use-case";
import type { UpdateCartItemUseCase } from "@/application/use-cases/cart/update-cart-item.use-case";
import { CartController } from "@/presentation/controllers/cart.controller";
import { ApplicationError } from "@/shared/errors/application.error";

const createUseCaseMocks = () => ({
	getOrCreateCartUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetOrCreateCartUseCase>,
	getCartDetailsUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetCartDetailsUseCase>,
	addItemToCartUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<AddItemToCartUseCase>,
	updateCartItemUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<UpdateCartItemUseCase>,
	removeCartItemUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<RemoveCartItemUseCase>,
	clearCartUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<ClearCartUseCase>,
});

const createResponseMock = (): jest.Mocked<Response> =>
	({
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}) as unknown as jest.Mocked<Response>;

describe("CartController", () => {
	describe("getCart", () => {
		it("sends success response with cart details", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();
			const cart = { id: "cart-1" };
			const cartDetails = { id: "cart-1", items: [] };

			useCases.getOrCreateCartUseCase.execute.mockResolvedValue(cart as any);
			useCases.getCartDetailsUseCase.execute.mockResolvedValue(
				cartDetails as any,
			);

			await controller.getCart({ userId: "user-1" }, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					data: cartDetails,
				}),
			);
		});

		it("sends error when cart details not found", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();
			const cart = { id: "cart-1" };

			useCases.getOrCreateCartUseCase.execute.mockResolvedValue(cart as any);
			useCases.getCartDetailsUseCase.execute.mockResolvedValue(null);

			await controller.getCart({ userId: "user-1" }, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("addItem", () => {
		it("sends success response with added item", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();
			const cart = { id: "cart-1" };
			const item = { id: "item-1", variantId: "variant-1" };

			useCases.getOrCreateCartUseCase.execute.mockResolvedValue(cart as any);
			useCases.addItemToCartUseCase.execute.mockResolvedValue(item as any);

			await controller.addItem(
				{ userId: "user-1" },
				{ variantId: "variant-1", quantity: 1 },
				res,
			);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("updateItem", () => {
		it("sends success response with updated item", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();
			const item = { id: "item-1", quantity: 5 };

			useCases.updateCartItemUseCase.execute.mockResolvedValue(item as any);

			await controller.updateItem({ itemId: "item-1", quantity: 5 }, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("sends success when item removed (quantity zero)", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();

			useCases.updateCartItemUseCase.execute.mockResolvedValue(null);

			await controller.updateItem({ itemId: "item-1", quantity: 0 }, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					message: "Cart item removed because quantity reached zero",
				}),
			);
		});
	});

	describe("removeItem", () => {
		it("sends success response", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();

			useCases.removeCartItemUseCase.execute.mockResolvedValue();

			await controller.removeItem("item-1", res);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("clearCart", () => {
		it("sends success response", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();
			const cart = { id: "cart-1" };

			useCases.getOrCreateCartUseCase.execute.mockResolvedValue(cart as any);
			useCases.clearCartUseCase.execute.mockResolvedValue();

			await controller.clearCart({ userId: "user-1" }, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("handleError", () => {
		it("handles ApplicationError correctly", async () => {
			const useCases = createUseCaseMocks();
			const controller = new CartController(
				useCases.getOrCreateCartUseCase,
				useCases.getCartDetailsUseCase,
				useCases.addItemToCartUseCase,
				useCases.updateCartItemUseCase,
				useCases.removeCartItemUseCase,
				useCases.clearCartUseCase,
			);

			const res = createResponseMock();

			useCases.getOrCreateCartUseCase.execute.mockRejectedValue(
				new ApplicationError("Error", "ERROR_CODE", 400),
			);

			await controller.getCart({ userId: "user-1" }, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});
});
