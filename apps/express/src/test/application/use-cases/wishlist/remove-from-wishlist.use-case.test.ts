import type { IWishlistRepository } from "@/domain/repositories/wishlist.repository";
import { RemoveFromWishlistUseCase } from "@/application/use-cases/wishlist/remove-wishlist.use-case";

const createWishlistRepositoryMock = (): jest.Mocked<IWishlistRepository> =>
  ({
    addItem: jest.fn(),
    removeItem: jest.fn(),
    getUserWishlist: jest.fn(),
    exists: jest.fn(),
  } as unknown as jest.Mocked<IWishlistRepository>);

describe("RemoveFromWishlistUseCase", () => {
  it("should remove product from wishlist", async () => {
    const wishlistRepo = createWishlistRepositoryMock();
    const useCase = new RemoveFromWishlistUseCase(wishlistRepo);

    wishlistRepo.removeItem.mockResolvedValue(undefined);

    await useCase.execute("user-1", "prod-1");

    expect(wishlistRepo.removeItem).toHaveBeenCalledWith("user-1", "prod-1");
  });

  it("should not throw error when item not found", async () => {
    const wishlistRepo = createWishlistRepositoryMock();
    const useCase = new RemoveFromWishlistUseCase(wishlistRepo);

    wishlistRepo.removeItem.mockResolvedValue(undefined);

    await expect(
      useCase.execute("user-1", "non-existent-prod")
    ).resolves.not.toThrow();
  });
});
