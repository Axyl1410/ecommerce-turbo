import type { ICacheService } from "@/application/interfaces/cache.interface";
import { RemoveCartItemUseCase } from "@/application/use-cases/cart/remove-cart-item.use-case";
import { buildCartItem } from "@/test/domain/entities/helpers";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";

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

describe("RemoveCartItemUseCase", () => {
	it("removes cart item successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new RemoveCartItemUseCase(repo, cache);

		const item = buildCartItem({
			id: "item-1",
			cartId: "cart-1",
		});

		repo.getCartItemWithVariant.mockResolvedValue({
			item,
			variant: {
				stockQuantity: 10,
				productStatus: "PUBLISHED",
			},
		});
		repo.removeItem.mockResolvedValue();

		await useCase.execute("item-1");

		expect(repo.getCartItemWithVariant).toHaveBeenCalledWith("item-1");
		expect(repo.removeItem).toHaveBeenCalledWith("item-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
	});

	it("throws ApplicationError when cart item not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new RemoveCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue(null);

		await expect(useCase.execute("non-existent")).rejects.toBeInstanceOf(
			ApplicationError,
		);
		await expect(useCase.execute("non-existent")).rejects.toThrow(
			"Cart item not found",
		);

		const error = await useCase.execute("non-existent").catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("CART_ITEM_NOT_FOUND");
		expect(repo.removeItem).not.toHaveBeenCalled();
	});
});

