export type WishlistItemDTO = {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string | null;
    price: number;
    salePrice: number | null;
    createdAt: Date;
};