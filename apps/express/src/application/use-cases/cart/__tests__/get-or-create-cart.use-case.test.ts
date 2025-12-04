import { GetOrCreateCartUseCase } from "@/application/use-cases/cart/get-or-create-cart.use-case";
import { ApplicationError } from "@/shared/errors/application.error";
import { Cart } from "@/domain/entities/cart.entity";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import type { ICacheService } from "@/application/interfaces/cache.interface";

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
  } as unknown as jest.Mocked<ICartRepository>);

const cacheServiceMock = (): jest.Mocked<ICacheService> =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteMultiple: jest.fn(),
  } as unknown as jest.Mocked<ICacheService>);

describe("GetOrCreateCartUseCase", () => {
  it("throws when no identifier provided", async () => {
    const repo = cartRepositoryMock();
    const cache = cacheServiceMock();
    const useCase = new GetOrCreateCartUseCase(repo, cache);

    await expect(useCase.execute({})).rejects.toBeInstanceOf(ApplicationError);
  });

  it("returns cached cart when available", async () => {
    const repo = cartRepositoryMock();
    const cache = cacheServiceMock();
    const useCase = new GetOrCreateCartUseCase(repo, cache);

    const cachedCart = {
      id: "cart-1",
      userId: "user-1",
      sessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    cache.get.mockResolvedValue(cachedCart);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toEqual(cachedCart);
    expect(repo.findByUserId).not.toHaveBeenCalled();
  });

  it("creates a cart when none exists", async () => {
    const repo = cartRepositoryMock();
    const cache = cacheServiceMock();
    const useCase = new GetOrCreateCartUseCase(repo, cache);

    const newCart = Cart.create({
      id: "cart-1",
      userId: "user-1",
      sessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    cache.get.mockResolvedValue(null);
    repo.findByUserId.mockResolvedValue(null);
    repo.createCart.mockResolvedValue(newCart);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.id).toBe("cart-1");
    expect(repo.createCart).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledTimes(1);
  });
});

