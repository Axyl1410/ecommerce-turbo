import type { IProductRepository } from "@/domain/repositories/product.repository";
import type { IWishlistRepository } from "@/domain/repositories/wishlist.repository";
import { AddToWishlistUseCase } from "@/application/use-cases/wishlist/add-wishlist.use-case";
import { ApplicationError } from "@/shared/errors/application.error";
import { WishlistItem } from "@/domain/entities/wish-list-item.entity";

const createWishlistRepositoryMock = (): jest.Mocked<IWishlistRepository> =>
	({
		addItem: jest.fn(),
		removeItem: jest.fn(),
		getUserWishlist: jest.fn(),
		exists: jest.fn(),
	}) as unknown as jest.Mocked<IWishlistRepository>;

const createProductRepositoryMock = (): jest.Mocked<IProductRepository> =>
	({
		findById: jest.fn(),
		findBySlug: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		existsBySlug: jest.fn(),
		findByIdWithDetails: jest.fn(),
		findBySlugWithDetails: jest.fn(),
		createWithDetails: jest.fn(),
	}) as unknown as jest.Mocked<IProductRepository>;

describe("AddToWishlistUseCase", () => {
	it("should add product to wishlist when product exists", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const productRepo = createProductRepositoryMock();
		const useCase = new AddToWishlistUseCase(wishlistRepo, productRepo);

		const mockProduct = {
			id: "prod-1",
			name: "Test Product",
			slug: "test-product",
		};

		const mockWishlistItem = new WishlistItem(
			"wish-1",
			"user-1",
			"prod-1",
			new Date(),
		);

		productRepo.findById.mockResolvedValue(mockProduct as any);
		wishlistRepo.addItem.mockResolvedValue(mockWishlistItem);

		await useCase.execute("user-1", "prod-1");

		expect(productRepo.findById).toHaveBeenCalledWith("prod-1");
		expect(wishlistRepo.addItem).toHaveBeenCalledWith("user-1", "prod-1");
	});

	it("should throw error when product not found", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const productRepo = createProductRepositoryMock();
		const useCase = new AddToWishlistUseCase(wishlistRepo, productRepo);

		productRepo.findById.mockResolvedValue(null);

		await expect(useCase.execute("user-1", "prod-1")).rejects.toThrow(
			ApplicationError,
		);
		expect(wishlistRepo.addItem).not.toHaveBeenCalled();
	});

	it("should throw error when product already in wishlist", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const productRepo = createProductRepositoryMock();
		const useCase = new AddToWishlistUseCase(wishlistRepo, productRepo);

		const mockProduct = { id: "prod-1", name: "Test Product" };
		productRepo.findById.mockResolvedValue(mockProduct as any);
		wishlistRepo.addItem.mockRejectedValue(
			new ApplicationError(
				"Product is already in wishlist",
				"DUPLICATE_ITEM",
				400,
			),
		);

		await expect(useCase.execute("user-1", "prod-1")).rejects.toThrow(
			ApplicationError,
		);
	});
});
