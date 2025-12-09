import type { ICacheService } from "@/application/interfaces/cache.interface";
import { ClearCartAfterOrderUseCase } from "@/application/use-cases/cart/clear-cart-after-order.use-case";
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

describe("ClearCartAfterOrderUseCase", () => {
	it("clears cart for user successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartAfterOrderUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		repo.findByUserId.mockResolvedValue(cart);
		repo.clearCart.mockResolvedValue();

		await useCase.execute({ userId: "user-1" });

		expect(repo.findByUserId).toHaveBeenCalledWith("user-1");
		expect(repo.clearCart).toHaveBeenCalledWith("cart-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
	});

	it("clears cart for session successfully", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartAfterOrderUseCase(repo, cache);

		const cart = Cart.create({
			id: "cart-1",
			userId: null,
			sessionId: "session-1",
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		repo.findBySessionId.mockResolvedValue(cart);
		repo.clearCart.mockResolvedValue();

		await useCase.execute({ sessionId: "session-1" });

		expect(repo.findBySessionId).toHaveBeenCalledWith("session-1");
		expect(repo.clearCart).toHaveBeenCalledWith("cart-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
	});

	it("does nothing when cart does not exist", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartAfterOrderUseCase(repo, cache);

		repo.findByUserId.mockResolvedValue(null);

		await useCase.execute({ userId: "user-1" });

		expect(repo.findByUserId).toHaveBeenCalledWith("user-1");
		expect(repo.clearCart).not.toHaveBeenCalled();
		expect(cache.delete).not.toHaveBeenCalled();
	});

	it("throws ApplicationError when neither userId nor sessionId provided", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new ClearCartAfterOrderUseCase(repo, cache);

		await expect(useCase.execute({})).rejects.toBeInstanceOf(ApplicationError);
		await expect(useCase.execute({})).rejects.toThrow(
			"Either userId or sessionId must be provided",
		);

		const error = await useCase.execute({}).catch((e) => e);
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("CART_IDENTIFIER_REQUIRED");
	});
});

