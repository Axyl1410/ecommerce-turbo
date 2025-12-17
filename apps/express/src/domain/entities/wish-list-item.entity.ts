export class WishlistItem {
    public constructor(
        public readonly id: string,
        public readonly wishListId: string,
        public  readonly variantId: string,
        public readonly createdAt: Date,
    ) { }
}