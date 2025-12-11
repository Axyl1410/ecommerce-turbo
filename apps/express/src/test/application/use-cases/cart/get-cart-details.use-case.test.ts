import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetCartDetailsUseCase } from "@/application/use-cases/cart/get-cart-details.use-case";
import { Cart } from "@/domain/entities/cart.entity";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { buildCartItem, testDates } from "@/test/domain/entities/helpers";

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

describe("GetCartDetailsUseCase", () => {
	it("returns cart from cache when available", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCartDetailsUseCase(repo, cache);

		const cachedCart = {
			id: "cart-1",
			items: [],
		} as any;

		cache.get.mockResolvedValue(cachedCart);

		const result = await useCase.execute("cart-1");

		expect(cache.get).toHaveBeenCalledWith("cart:cart-1");
		expect(repo.getCartWithItems).not.toHaveBeenCalled();
		expect(result).toEqual(cachedCart);
	});

	it("returns cart with items from repository", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCartDetailsUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
		});

		cache.get.mockResolvedValue(null);
		repo.getCartWithItems.mockResolvedValue({
			cart,
			items: [
				{
					item,
					variant: {
						stockQuantity: 10,
						price: 1999,
						salePrice: null,
						productStatus: "PUBLISHED",
					},
				},
			],
		});

		const result = await useCase.execute("cart-1");

		expect(repo.getCartWithItems).toHaveBeenCalledWith({ id: "cart-1" });
		expect(result).not.toBeNull();
		expect(result?.id).toBe("cart-1");
	});

	it("returns null when cart does not exist", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCartDetailsUseCase(repo, cache);

		cache.get.mockResolvedValue(null);
		repo.getCartWithItems.mockResolvedValue(null);

		const result = await useCase.execute("non-existent");

		expect(result).toBeNull();
	});

	it("validates items and returns warnings for price changes", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCartDetailsUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			priceAtAdd: 1999,
		});

		cache.get.mockResolvedValue(null);
		repo.getCartWithItems.mockResolvedValue({
			cart,
			items: [
				{
					item,
					variant: {
						stockQuantity: 10,
						price: 2499,
						salePrice: null,
						productStatus: "PUBLISHED",
					},
				},
			],
		});

		const result = await useCase.execute("cart-1");

		expect(result?.validation?.warnings).toBeDefined();
		expect(result?.validation?.warnings?.length).toBeGreaterThan(0);
	});

	it("validates items and returns errors for insufficient stock", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetCartDetailsUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 20,
		});

		cache.get.mockResolvedValue(null);
		repo.getCartWithItems.mockResolvedValue({
			cart,
			items: [
				{
					item,
					variant: {
						stockQuantity: 10,
						price: 1999,
						salePrice: null,
						productStatus: "PUBLISHED",
					},
				},
			],
		});

		const result = await useCase.execute("cart-1");

		expect(result?.validation?.errors).toBeDefined();
		expect(result?.validation?.errors?.length).toBeGreaterThan(0);
		expect(cache.set).not.toHaveBeenCalled();
	});
});
