import type { ICacheService } from "@/application/interfaces/cache.interface";
import { AddItemToCartUseCase } from "@/application/use-cases/cart/add-item-to-cart.use-case";
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

describe("AddItemToCartUseCase", () => {
	it("adds new item to cart successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new AddItemToCartUseCase(repo, cache);

		const variant = {
			id: "variant-1",
			stockQuantity: 10,
			price: 1999,
			salePrice: null,
			productStatus: "PUBLISHED",
		};

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceAtAdd: 1999,
		});

		repo.getVariantInfo.mockResolvedValue(variant);
		repo.addOrUpdateItem.mockResolvedValue(item);

		const result = await useCase.execute({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
		});

		expect(repo.getVariantInfo).toHaveBeenCalledWith("variant-1");
		expect(repo.addOrUpdateItem).toHaveBeenCalledWith({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceSnapshot: 1999,
		});
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
		expect(result.variantId).toBe("variant-1");
		expect(result.quantity).toBe(2);
	});

	it("uses salePrice when available", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new AddItemToCartUseCase(repo, cache);

		const variant = {
			id: "variant-1",
			stockQuantity: 10,
			price: 1999,
			salePrice: 1499,
			productStatus: "PUBLISHED",
		};

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 1,
			priceAtAdd: 1499,
		});

		repo.getVariantInfo.mockResolvedValue(variant);
		repo.addOrUpdateItem.mockResolvedValue(item);

		await useCase.execute({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 1,
		});

		expect(repo.addOrUpdateItem).toHaveBeenCalledWith(
			expect.objectContaining({
				priceSnapshot: 1499,
			}),
		);
	});

	it("throws ApplicationError when quantity is zero or negative", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new AddItemToCartUseCase(repo, cache);

		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 0,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 0,
			}),
		).rejects.toThrow("Quantity must be greater than 0");

		const error = await useCase
			.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 0,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("INVALID_QUANTITY");
		expect(repo.getVariantInfo).not.toHaveBeenCalled();
	});

	it("throws ApplicationError when variant not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new AddItemToCartUseCase(repo, cache);

		repo.getVariantInfo.mockResolvedValue(null);

		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "non-existent",
				quantity: 1,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "non-existent",
				quantity: 1,
			}),
		).rejects.toThrow("Product variant not found");

		const error = await useCase
			.execute({
				cartId: "cart-1",
				variantId: "non-existent",
				quantity: 1,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("VARIANT_NOT_FOUND");
	});

	it("throws ApplicationError when product is not published", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new AddItemToCartUseCase(repo, cache);

		const variant = {
			id: "variant-1",
			stockQuantity: 10,
			price: 1999,
			salePrice: null,
			productStatus: "DRAFT",
		};

		repo.getVariantInfo.mockResolvedValue(variant);

		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 1,
			}),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 1,
			}),
		).rejects.toThrow("Product is not available");

		const error = await useCase
			.execute({
				cartId: "cart-1",
				variantId: "variant-1",
				quantity: 1,
			})
			.catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("VARIANT_UNAVAILABLE");
	});
});

