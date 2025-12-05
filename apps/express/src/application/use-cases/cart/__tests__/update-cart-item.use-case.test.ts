import type { ICacheService } from "@/application/interfaces/cache.interface";
import { UpdateCartItemUseCase } from "@/application/use-cases/cart/update-cart-item.use-case";
import { CartItem } from "@/domain/entities/cart-item.entity";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { ApplicationError } from "@/shared/errors/application.error";

/**
 * Tạo mock cho CartRepository
 * Mock tất cả các methods của ICartRepository để sử dụng trong test
 */
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

/**
 * Tạo mock cho CacheService
 * Mock tất cả các methods của ICacheService để sử dụng trong test
 */
const cacheServiceMock = (): jest.Mocked<ICacheService> =>
	({
		get: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		deleteMultiple: jest.fn(),
	}) as unknown as jest.Mocked<ICacheService>;

/**
 * Helper function để tạo CartItem entity cho test
 * @param quantity - Số lượng của item
 * @param createdAt - Ngày tạo (mặc định là 2024-01-01)
 * @returns CartItem entity với các giá trị mặc định
 */
const buildCartItem = (
	quantity: number,
	createdAt = new Date("2024-01-01T00:00:00.000Z"),
) =>
	CartItem.create({
		id: "item-1",
		cartId: "cart-1",
		variantId: "variant-1",
		quantity,
		priceAtAdd: 1999,
		createdAt,
	});

describe("UpdateCartItemUseCase", () => {
	/**
	 * Test case: Cập nhật số lượng item khi tăng số lượng trong giới hạn tồn kho
	 * - Kiểm tra khi tăng quantity từ 2 lên 3 và tồn kho còn 10
	 * - Verify rằng repository.updateItemQuantity được gọi với đúng tham số
	 * - Verify rằng cache được xóa sau khi cập nhật
	 * - Verify kết quả trả về đúng với DTO mong đợi
	 */
	it("updates item quantity when increasing within stock limits", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const currentItem = buildCartItem(2);
		const updatedItem = buildCartItem(3, new Date("2024-01-02T00:00:00.000Z"));

		repo.getCartItemWithVariant.mockResolvedValue({
			item: currentItem,
			variant: { stockQuantity: 10, productStatus: "PUBLISHED" },
		});
		repo.updateItemQuantity.mockResolvedValue(updatedItem);

		const result = await useCase.execute({ itemId: "item-1", quantity: 3 });

		expect(repo.updateItemQuantity).toHaveBeenCalledWith("item-1", 3);
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
		expect(result).toEqual({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 3,
			priceAtAdd: 1999,
			createdAt: updatedItem.toJSON().createdAt,
		});
	});

	/**
	 * Test case: Cập nhật số lượng item khi giảm số lượng (flow giảm)
	 * - Kiểm tra khi giảm quantity từ 4 xuống 1
	 * - Verify rằng repository.updateItemQuantity được gọi với đúng tham số
	 * - Verify rằng cache được xóa sau khi cập nhật
	 * - Verify kết quả không null và quantity đúng
	 */
	it("updates item quantity when decreasing (minus flow)", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const currentItem = buildCartItem(4);
		const updatedItem = buildCartItem(1, new Date("2024-01-03T00:00:00.000Z"));

		repo.getCartItemWithVariant.mockResolvedValue({
			item: currentItem,
			variant: { stockQuantity: 4, productStatus: "PUBLISHED" },
		});
		repo.updateItemQuantity.mockResolvedValue(updatedItem);

		const result = await useCase.execute({ itemId: "item-1", quantity: 1 });

		expect(repo.updateItemQuantity).toHaveBeenCalledWith("item-1", 1);
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
		expect(result).not.toBeNull();
		expect(result?.quantity).toBe(1);
	});

	/**
	 * Test case: Throw error khi quantity là số âm
	 * - Kiểm tra validation: quantity < 0 sẽ throw ApplicationError
	 * - Verify rằng repository.getCartItemWithVariant KHÔNG được gọi (fail fast)
	 * - Đây là validation đầu tiên trong use case, nên không cần query database
	 */
	it("throws when requested quantity is negative", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		await expect(
			useCase.execute({ itemId: "item-1", quantity: -1 }),
		).rejects.toBeInstanceOf(ApplicationError);
		expect(repo.getCartItemWithVariant).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Throw error khi cart item không tồn tại
	 * - Kiểm tra khi getCartItemWithVariant trả về null
	 * - Verify throw ApplicationError với message "Cart item not found"
	 * - Verify rằng updateItemQuantity và removeItem KHÔNG được gọi
	 */
	it("throws when cart item does not exist", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue(null);

		await expect(
			useCase.execute({ itemId: "non-existent", quantity: 1 }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({ itemId: "non-existent", quantity: 1 }),
		).rejects.toThrow("Cart item not found");
		expect(repo.updateItemQuantity).not.toHaveBeenCalled();
		expect(repo.removeItem).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Throw error khi product status không phải PUBLISHED
	 * - Kiểm tra khi product status = "DRAFT" (hoặc các status khác PUBLISHED)
	 * - Verify throw ApplicationError với message "Product is not available"
	 * - Verify rằng updateItemQuantity KHÔNG được gọi
	 * - Đảm bảo chỉ sản phẩm PUBLISHED mới có thể cập nhật trong giỏ hàng
	 */
	it("throws when product status is not PUBLISHED", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue({
			item: buildCartItem(2),
			variant: { stockQuantity: 10, productStatus: "DRAFT" },
		});

		await expect(
			useCase.execute({ itemId: "item-1", quantity: 3 }),
		).rejects.toBeInstanceOf(ApplicationError);
		await expect(
			useCase.execute({ itemId: "item-1", quantity: 3 }),
		).rejects.toThrow("Product is not available");
		expect(repo.updateItemQuantity).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Throw error khi quantity yêu cầu vượt quá tồn kho
	 * - Kiểm tra khi quantity = 5 nhưng stockQuantity chỉ còn 3
	 * - Verify throw ApplicationError với code "INSUFFICIENT_STOCK"
	 * - Verify rằng updateItemQuantity KHÔNG được gọi
	 * - Đảm bảo không thể cập nhật số lượng vượt quá tồn kho hiện có
	 */
	it("throws when requested quantity exceeds stock", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue({
			item: buildCartItem(2),
			variant: { stockQuantity: 3, productStatus: "PUBLISHED" },
		});

		await expect(
			useCase.execute({ itemId: "item-1", quantity: 5 }),
		).rejects.toBeInstanceOf(ApplicationError);
		expect(repo.updateItemQuantity).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Cho phép cập nhật khi quantity bằng đúng số tồn kho còn lại
	 * - Kiểm tra edge case: quantity = stockQuantity (5 = 5)
	 * - Verify rằng updateItemQuantity được gọi thành công
	 * - Verify kết quả trả về không null và quantity đúng
	 * - Đảm bảo có thể cập nhật đến đúng số lượng tồn kho (không vượt quá)
	 */
	it("allows updating when requested quantity equals the remaining stock", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const currentItem = buildCartItem(1);
		const updatedItem = buildCartItem(5, new Date("2024-01-04T00:00:00.000Z"));

		repo.getCartItemWithVariant.mockResolvedValue({
			item: currentItem,
			variant: { stockQuantity: 5, productStatus: "PUBLISHED" },
		});
		repo.updateItemQuantity.mockResolvedValue(updatedItem);

		const result = await useCase.execute({ itemId: "item-1", quantity: 5 });

		expect(result).not.toBeNull();
		expect(result?.quantity).toBe(5);
		expect(repo.updateItemQuantity).toHaveBeenCalledWith("item-1", 5);
	});

	/**
	 * Test case: Từ chối khi variant hết hàng (stockQuantity = 0)
	 * - Kiểm tra khi stockQuantity = 0, không thể cập nhật quantity > 0
	 * - Verify throw ApplicationError
	 * - Verify rằng updateItemQuantity KHÔNG được gọi
	 * - Đảm bảo không thể thêm/cập nhật item khi sản phẩm đã hết hàng
	 */
	it("rejects when variant is out of stock (hết hàng)", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		repo.getCartItemWithVariant.mockResolvedValue({
			item: buildCartItem(1),
			variant: { stockQuantity: 0, productStatus: "PUBLISHED" },
		});

		await expect(
			useCase.execute({ itemId: "item-1", quantity: 1 }),
		).rejects.toBeInstanceOf(ApplicationError);
		expect(repo.updateItemQuantity).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Xóa item khỏi giỏ hàng khi quantity = 0
	 * - Kiểm tra khi user set quantity = 0, item sẽ bị xóa khỏi giỏ hàng
	 * - Verify rằng repository.removeItem được gọi với đúng itemId
	 * - Verify rằng cache được xóa sau khi xóa item
	 * - Verify kết quả trả về null (item đã bị xóa)
	 * - Đây là cách user xóa item khỏi giỏ hàng bằng cách set quantity = 0
	 */
	it("removes the item when quantity becomes zero", async () => {
		const repo = cartRepositoryMock();
		const cache = cacheServiceMock();
		const useCase = new UpdateCartItemUseCase(repo, cache);

		const currentItem = buildCartItem(2);
		repo.getCartItemWithVariant.mockResolvedValue({
			item: currentItem,
			variant: { stockQuantity: 2, productStatus: "PUBLISHED" },
		});

		const result = await useCase.execute({ itemId: "item-1", quantity: 0 });

		expect(result).toBeNull();
		expect(repo.removeItem).toHaveBeenCalledWith("item-1");
		expect(cache.delete).toHaveBeenCalledWith("cart:cart-1");
	});
});
