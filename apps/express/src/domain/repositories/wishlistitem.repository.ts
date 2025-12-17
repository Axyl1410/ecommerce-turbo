import type { WishlistItem } from "@/domain/entities/wish-list-item.entity";

export interface IWishlistRepository {
    addItem(userId: string, productId: string): Promise<WishlistItem>;
    removeItem(userId: string, productId: string): Promise<void>;
    getUserWishlist(userId: string): Promise<
        Array<{
            item: WishlistItem;
            product: {
                id: string;
                name: string;
                slug: string;
                defaultImage: string | null;
                variants: Array<{
                    price: number;
                    salePrice: number | null;
                }>;
            };
        }>
    >;
    exists(userId: string, productId: string): Promise<boolean>;
}