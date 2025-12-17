import { prisma } from  "@workspace/database";
import { WishlistItem } from "@/domain/entities/wish-list-item.entity";
import type { IWishlistRepository } from "@/domain/repositories/wishlist.repository";
import { ApplicationError } from "@/shared/errors/application.error";

export class PrismaWishlistRepository implements IWishlistRepository {
    async addItem(userId: string, productId: string): Promise<WishlistItem> {
        try {
            const item = await prisma.wishlistItem.create({
                data: {
                    userId,
                    productId,
                },
            });
            return new WishlistItem(
                item.id,
                item.userId,
                item.productId,
                item.createdAt,
                
            );
        } catch (error: any) {
            // Mã lỗi P2002 của Prisma là Unique constraint failed
            if (error.code === "P2002") {
                throw new ApplicationError(
                    "Product is already in wishlist",
                    "DUPLICATE_ITEM",
                    400,
                );
            }
            throw error;
        }
    }

    async removeItem(userId: string, productId: string): Promise<void> {
        await prisma.wishlistItem.deleteMany({
            where: {
                userId,
                productId,
            },
        });
    }

    async getUserWishlist(userId: string): Promise<
        Array<{
            item: WishlistItem;
            product: {
                id: string;
                name: string;
                slug: string;
                defaultImage: string | null;
                variants: Array<{ price: number; salePrice: number | null }>;
            };
        }>
    > {
        const items = await prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        defaultImage: true,
                        variants: {
                            select: {
                                price: true,
                                salePrice: true,
                            },
                            take: 1, // Lấy 1 variant để hiển thị giá tham khảo
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return items.map((i) => ({
            item: new WishlistItem(i.id, i.userId, i.productId, i.createdAt),
            product: {
                ...i.product,
                variants: i.product.variants.map((v) => ({
                    price: Number(v.price),
                    salePrice: v.salePrice ? Number(v.salePrice) : null,
                })),
            },
        }));
    }

    async exists(userId: string, productId: string): Promise<boolean> {
        const count = await prisma.wishlistItem.count({
            where: { userId, productId },
        });
        return count > 0;
    }
}