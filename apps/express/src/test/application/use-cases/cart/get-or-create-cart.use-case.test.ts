import type { ICacheService } from "@/application/interfaces/cache.interface";
import { GetOrCreateCartUseCase } from "@/application/use-cases/cart/get-or-create-cart.use-case";
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

describe("GetOrCreateCartUseCase", () => {
	it("returns cart from cache when available", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const cachedCart = {
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
		} as any;

		cache.get.mockResolvedValue(cachedCart);

		const result = await useCase.execute({ userId: "user-1" });

		expect(cache.get).toHaveBeenCalledWith("cart:userId:user-1");
		expect(repo.findByUserId).not.toHaveBeenCalled();
		expect(result).toEqual(cachedCart);
	});

	it("returns existing cart for user", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cache.get.mockResolvedValue(null);
		repo.findByUserId.mockResolvedValue(cart);

		const result = await useCase.execute({ userId: "user-1" });

		expect(repo.findByUserId).toHaveBeenCalledWith("user-1");
		expect(repo.createCart).not.toHaveBeenCalled();
		expect(cache.set).toHaveBeenCalled();
		expect(result.id).toBe("cart-1");
	});

	it("creates new cart for user when not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const newCart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cache.get.mockResolvedValue(null);
		repo.findByUserId.mockResolvedValue(null);
		repo.createCart.mockResolvedValue(newCart);

		const result = await useCase.execute({ userId: "user-1" });

		expect(repo.findByUserId).toHaveBeenCalledWith("user-1");
		expect(repo.createCart).toHaveBeenCalledWith({
			userId: "user-1",
			sessionId: null,
		});
		expect(result.id).toBe("cart-1");
	});

	it("returns existing cart for session", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: null,
			sessionId: "session-1",
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cache.get.mockResolvedValue(null);
		repo.findBySessionId.mockResolvedValue(cart);

		const result = await useCase.execute({ sessionId: "session-1" });

		expect(repo.findBySessionId).toHaveBeenCalledWith("session-1");
		expect(result.id).toBe("cart-1");
	});

	it("creates new cart for session when not found", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const newCart = Cart.create({
			id: "cart-1",
			userId: null,
			sessionId: "session-1",
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cache.get.mockResolvedValue(null);
		repo.findBySessionId.mockResolvedValue(null);
		repo.createCart.mockResolvedValue(newCart);

		const result = await useCase.execute({ sessionId: "session-1" });

		expect(repo.findBySessionId).toHaveBeenCalledWith("session-1");
		expect(repo.createCart).toHaveBeenCalledWith({
			userId: null,
			sessionId: "session-1",
		});
		expect(result.id).toBe("cart-1");
	});

	it("merges guest cart when both userId and sessionId provided", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		const mergedCart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		repo.mergeGuestCart.mockResolvedValue(mergedCart);

		const result = await useCase.execute({
			userId: "user-1",
			sessionId: "session-1",
		});

		expect(repo.mergeGuestCart).toHaveBeenCalledWith("user-1", "session-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:userId:user-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:sessionId:session-1");
		expect(result.id).toBe("cart-1");
	});

	it("throws ApplicationError when neither userId nor sessionId provided", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new GetOrCreateCartUseCase(repo, cache);

		await expect(useCase.execute({})).rejects.toBeInstanceOf(ApplicationError);
		await expect(useCase.execute({})).rejects.toThrow(
			"Either userId or sessionId must be provided",
		);

		const error = await useCase.execute({}).catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("CART_IDENTIFIER_REQUIRED");
	});
});

