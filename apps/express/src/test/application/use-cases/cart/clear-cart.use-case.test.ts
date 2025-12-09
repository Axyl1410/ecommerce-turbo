import type { ICacheService } from "@/application/interfaces/cache.interface";
import { ClearCartUseCase } from "@/application/use-cases/cart/clear-cart.use-case";
import { testDates } from "@/test/domain/entities/helpers";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";
import { Cart } from "@/domain/entities/cart.entity";

const cartRepositoryMock = (): jest.Mocked<ICartRepository> =>
	({
		findById: jest.fn(),
		findByUserId: jest.fn(),
		findBySessionId: jest.fn(),
		createCart: jest.fn(),
		mergeGuestCart: jest.fn(),
		getCartWithItems: jest.fn(),
		addOrUpdateItem: jest.fn(),
		updateItemQuantity: jest.fn(),
		removeItem: jest.fn(),
		clearCart: jest.fn(),
		deleteCart: jest.fn(),
		getVariantInfo: jest.fn(),
		getCartItemWithVariant: jest.fn(),
	}) as unknown as jest.Mocked<ICartRepository>;

const cacheServiceMock = (): jest.Mocked<ICacheService> =>
	({
		get: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		deleteMultiple: jest.fn(),
	}) as unknown as jest.Mocked<ICacheService>;

describe("ClearCartUseCase", () => {
	it("clears cart successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		repo.findById.mockResolvedValue(cart);
		repo.clearCart.mockResolvedValue();

		await useCase.execute("cart-1");

		expect(repo.findById).toHaveBeenCalledWith("cart-1");
		expect(repo.clearCart).toHaveBeenCalledWith("cart-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
	});

	it("throws ApplicationError when cart not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartUseCase(repo, cache);

		repo.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			ApplicationError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow(
			"Cart not found",
		);

		const error = await useCase.execute("non-existent").catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("CART_NOT_FOUND");
		expect(repo.clearCart).not.toHaveBeenCalled();
	});
});

