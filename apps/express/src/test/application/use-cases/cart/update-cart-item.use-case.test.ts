import type { ICacheService } from "@/application/interfaces/cache.interface";
import { UpdateCartItemUseCase } from "@/application/use-cases/cart/update-cart-item.use-case";
import { buildCartItem, testDates } from "@/test/domain/entities/helpers";
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

describe("UpdateCartItemUseCase", () => {
	it("updates cart item quantity successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const item = buildCartItem({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
		});

		const updatedItem = buildCartItem({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 5,
		});

		repo.getCartItemWithVariant.mockResolvedValue({
			item,
			variant: {
				stockQuantity: 10,
				productStatus: "PUBLISHED",
			},
		});
		repo.updateItemQuantity.mockResolvedValue(updatedItem);

		const result = await useCase.execute({
			itemId: "item-1",
			quantity: 5,
		});

		expect(repo.updateItemQuantity).toHaveBeenCalledWith("item-1", 5);
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
		expect(result?.quantity).toBe(5);
	});

	it("removes item when quantity is zero", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

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

		const result = await useCase.execute({
			itemId: "item-1",
			quantity: 0,
		});

		expect(repo.removeItem).toHaveBeenCalledWith("item-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
		expect(result).toBeNull();
	});

	it("throws ApplicationError when quantity is negative", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: -1,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: -1,
			}),
		).rejects.toThrow("Quantity must be zero or greater");

		const error = await useCase
			.execute({
				itemId: "item-1",
				quantity: -1,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("INVALID_QUANTITY");
	});

	it("throws ApplicationError when cart item not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue(null);

		await expect(
			useCase.execute({
				itemId: "non-existent",
				quantity: 1,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				itemId: "non-existent",
				quantity: 1,
			}),
		).rejects.toThrow("Cart item not found");

		const error = await useCase
			.execute({
				itemId: "non-existent",
				quantity: 1,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("CART_ITEM_NOT_FOUND");
	});

	it("throws ApplicationError when product is not published", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const item = buildCartItem({ id: "item-1" });

		repo.getCartItemWithVariant.mockResolvedValue({
			item,
			variant: {
				stockQuantity: 10,
				productStatus: "DRAFT",
			},
		});

		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: 1,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: 1,
			}),
		).rejects.toThrow("Product is not available");

		const error = await useCase
			.execute({
				itemId: "item-1",
				quantity: 1,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("VARIANT_UNAVAILABLE");
	});

	it("throws ApplicationError when quantity exceeds stock", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const item = buildCartItem({ id: "item-1" });

		repo.getCartItemWithVariant.mockResolvedValue({
			item,
			variant: {
				stockQuantity: 5,
				productStatus: "PUBLISHED",
			},
		});

		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: 10,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				itemId: "item-1",
				quantity: 10,
			}),
		).rejects.toThrow("Insufficient stock");

		const error = await useCase
			.execute({
				itemId: "item-1",
				quantity: 10,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("INSUFFICIENT_STOCK");
	});
});

