import type { IWishlistRepository } from "@/domain/repositories/wishlistitem.repository";
import { GetUserWishlistUseCase } from "@/application/use-cases/wishlist/get-wishlist.use-case";
import { WishlistItem } from "@/domain/entities/wish-list-item.entity";

const createWishlistRepositoryMock = (): jest.Mocked<IWishlistRepository> =>
	({
		addItem: jest.fn(),
		removeItem: jest.fn(),
		getUserWishlist: jest.fn(),
		exists: jest.fn(),
	}) as unknown as jest.Mocked<IWishlistRepository>;

describe("GetUserWishlistUseCase", () => {
	it("should return empty array when user has no wishlist items", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const useCase = new GetUserWishlistUseCase(wishlistRepo);

		wishlistRepo.getUserWishlist.mockResolvedValue([]);

		const result = await useCase.execute("user-1");

		expect(result).toEqual([]);
		expect(wishlistRepo.getUserWishlist).toHaveBeenCalledWith("user-1");
	});

	it("should return wishlist items with product details", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const useCase = new GetUserWishlistUseCase(wishlistRepo);

		const mockWishlistData = [
			{
				item: new WishlistItem("wish-1", "user-1", "prod-1", new Date()),
				product: {
					id: "prod-1",
					name: "Product 1",
					slug: "product-1",
					defaultImage: "image1.jpg",
					variants: [
						{
							price: 100,
							salePrice: 80,
						},
					],
				},
			},
			{
				item: new WishlistItem("wish-2", "user-1", "prod-2", new Date()),
				product: {
					id: "prod-2",
					name: "Product 2",
					slug: "product-2",
					defaultImage: "image2.jpg",
					variants: [
						{
							price: 200,
							salePrice: null,
						},
					],
				},
			},
		];

		wishlistRepo.getUserWishlist.mockResolvedValue(mockWishlistData as any);

		const result = await useCase.execute("user-1");

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			productId: "prod-1",
			productName: "Product 1",
			productSlug: "product-1",
			price: 100,
			salePrice: 80,
		});
		expect(result[1]).toMatchObject({
			productId: "prod-2",
			productName: "Product 2",
			price: 200,
			salePrice: null,
		});
	});

	it("should handle products with empty variants", async () => {
		const wishlistRepo = createWishlistRepositoryMock();
		const useCase = new GetUserWishlistUseCase(wishlistRepo);

		const mockWishlistData = [
			{
				item: new WishlistItem("wish-1", "user-1", "prod-1", new Date()),
				product: {
					id: "prod-1",
					name: "Product 1",
					slug: "product-1",
					defaultImage: "image1.jpg",
					variants: [],
				},
			},
		];

		wishlistRepo.getUserWishlist.mockResolvedValue(mockWishlistData as any);

		const result = await useCase.execute("user-1");

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			price: 0,
			salePrice: null,
		});
	});
});
