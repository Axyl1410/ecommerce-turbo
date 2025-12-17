import type { IWishlistRepository } from "@/domain/repositories/wishlistitem.repository";

export class RemoveFromWishlistUseCase {
    constructor(private wishlistRepository: IWishlistRepository) {}

    async execute(userId: string, productId: string): Promise<void> {
        await this.wishlistRepository.removeItem(userId, productId);
    }
}