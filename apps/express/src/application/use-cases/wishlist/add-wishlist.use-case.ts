import type { IWishlistRepository } from "@/domain/repositories/wishlist.repository";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { ApplicationError } from "@/shared/errors/application.error";

export class AddToWishlistUseCase {
    constructor(
        public wishlistRepository: IWishlistRepository,
        public productRepository: IProductRepository,
    ) {}

    async execute(userId: string, productId: string): Promise<void> {
        // Kiểm tra sản phẩm có tồn tại không
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new ApplicationError("Product not found", "PRODUCT_NOT_FOUND", 404);
        }

        await this.wishlistRepository.addItem(userId, productId);
    }
}