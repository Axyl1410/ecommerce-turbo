import type { IWishlistRepository } from "@/domain/repositories/wishlist.repository";
import type { WishlistItemDTO } from "@/application/dto/wishlistitem.dto";

export class GetUserWishlistUseCase {
    constructor(private wishlistRepository: IWishlistRepository) {}

    async execute(userId: string): Promise<WishlistItemDTO[]> {
        const items = await this.wishlistRepository.getUserWishlist(userId);
// Chuyển đổi dữ liệu sang định dạng DTO
        return items.map(({ item, product }) => {
            const variant = product.variants[0];
            return {
                id: item.id,
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                productImage: product.defaultImage,
                price: variant?.price ?? 0,
                salePrice: variant?.salePrice ?? null,
                createdAt: item.createdAt,
            };
        });
    }
}