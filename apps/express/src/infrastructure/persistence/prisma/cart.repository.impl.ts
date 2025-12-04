import type { ICartRepository } from "@/domain/repositories/cart.repository";
import { Cart } from "@/domain/entities/cart.entity";
import { CartItem } from "@/domain/entities/cart-item.entity";
import { prisma } from "@workspace/database";

type PrismaCart = Awaited<ReturnType<typeof prisma.cart.findUnique>>;
type PrismaCartItem = Awaited<ReturnType<typeof prisma.cartItem.findUnique>>;

export class PrismaCartRepository implements ICartRepository {
  async findById(id: string): Promise<Cart | null> {
    const cart = await prisma.cart.findUnique({ where: { id } });
    return cart ? this.toCart(cart) : null;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    return cart ? this.toCart(cart) : null;
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    return cart ? this.toCart(cart) : null;
  }

  async createCart(params: {
    userId: string | null;
    sessionId: string | null;
  }): Promise<Cart> {
    const cart = await prisma.cart.create({
      data: {
        userId: params.userId,
        sessionId: params.sessionId,
      },
    });
    return this.toCart(cart);
  }

  async mergeGuestCart(userId: string, sessionId: string): Promise<Cart> {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    const userCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      if (userCart) {
        return this.toCart(userCart);
      }
      return this.createCart({ userId, sessionId: null });
    }

    if (!userCart) {
      const updatedCart = await prisma.cart.update({
        where: { id: guestCart.id },
        data: {
          userId,
          sessionId: null,
        },
      });
      return this.toCart(updatedCart);
    }

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        (item) => item.variantId === guestItem.variantId
      );

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + guestItem.quantity,
            priceAtAdd:
              guestItem.priceAtAdd < existingItem.priceAtAdd
                ? guestItem.priceAtAdd
                : existingItem.priceAtAdd,
          },
        });
      } else {
        await prisma.cartItem.update({
          where: { id: guestItem.id },
          data: { cartId: userCart.id },
        });
      }
    }

    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    const refreshed = await prisma.cart.findUnique({
      where: { id: userCart.id },
    });

    return this.toCart(refreshed!);
  }

  async getCartWithItems(params: {
    id?: string;
    userId?: string;
    sessionId?: string;
  }): Promise<{
    cart: Cart;
    items: Array<{
      item: CartItem;
      variant: {
        stockQuantity: number;
        price: number;
        salePrice: number | null;
        productStatus: string;
      };
    }>;
  } | null> {
    const cart = await prisma.cart.findFirst({
      where: {
        id: params.id,
        userId: params.userId,
        sessionId: params.sessionId,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return null;
    }

    return {
      cart: this.toCart(cart),
      items: cart.items.map((item) => ({
        item: this.toCartItem(item),
        variant: {
          stockQuantity: item.variant?.stockQuantity ?? 0,
          price: Number(item.variant?.price ?? 0),
          salePrice: item.variant?.salePrice
            ? Number(item.variant?.salePrice)
            : null,
          productStatus: item.variant?.product.status ?? "DRAFT",
        },
      })),
    };
  }

  async addOrUpdateItem(params: {
    cartId: string;
    variantId: string;
    quantity: number;
    priceSnapshot: number;
  }): Promise<CartItem> {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: params.cartId,
        variantId: params.variantId,
      },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: params.quantity + existingItem.quantity,
          priceAtAdd: params.priceSnapshot,
        },
      });
      return this.toCartItem(updated);
    }

    const created = await prisma.cartItem.create({
      data: {
        cartId: params.cartId,
        variantId: params.variantId,
        quantity: params.quantity,
        priceAtAdd: params.priceSnapshot,
      },
    });
    return this.toCartItem(created);
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.toCartItem(updated);
  }

  async removeItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async deleteCart(cartId: string): Promise<void> {
    await prisma.cart.delete({ where: { id: cartId } });
  }

  async getVariantInfo(variantId: string): Promise<{
    id: string;
    stockQuantity: number;
    price: number;
    salePrice: number | null;
    productStatus: string;
  } | null> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: { status: true },
        },
      },
    });

    if (!variant) {
      return null;
    }

    return {
      id: variant.id,
      stockQuantity: variant.stockQuantity,
      price: Number(variant.price),
      salePrice: variant.salePrice ? Number(variant.salePrice) : null,
      productStatus: variant.product.status,
    };
  }

  async getCartItemWithVariant(
    itemId: string
  ): Promise<{
    item: CartItem;
    variant: {
      stockQuantity: number;
      productStatus: string;
    };
  } | null> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: {
          include: {
            product: {
              select: { status: true },
            },
          },
        },
      },
    });

    if (!cartItem || !cartItem.variant) {
      return null;
    }

    return {
      item: this.toCartItem(cartItem),
      variant: {
        stockQuantity: cartItem.variant.stockQuantity,
        productStatus: cartItem.variant.product.status,
      },
    };
  }

  private toCart(cart: PrismaCart | null): Cart {
    if (!cart) {
      throw new Error("Cart not found");
    }

    return Cart.create({
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: [],
    });
  }

  private toCartItem(item: PrismaCartItem | null): CartItem {
    if (!item) {
      throw new Error("Cart item not found");
    }

    return CartItem.create({
      id: item.id,
      cartId: item.cartId,
      variantId: item.variantId,
      quantity: item.quantity,
      priceAtAdd: Number(item.priceAtAdd),
      createdAt: item.createdAt,
    });
  }
}

