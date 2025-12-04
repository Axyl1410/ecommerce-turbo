import type { Cart } from "@/domain/entities/cart.entity";
import type { CartItem } from "@/domain/entities/cart-item.entity";

export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;
  findBySessionId(sessionId: string): Promise<Cart | null>;
  createCart(params: { userId: string | null; sessionId: string | null }): Promise<Cart>;
  mergeGuestCart(userId: string, sessionId: string): Promise<Cart>;
  getCartWithItems(params: {
    id?: string;
    userId?: string;
    sessionId?: string;
  }): Promise<{
    cart: Cart;
    items: Array<{
      item: CartItem;
      variant: {
        stockQuantity: number;
        price?: number;
        salePrice?: number | null;
        productStatus: string;
      };
    }>;
  } | null>;
  addOrUpdateItem(params: {
    cartId: string;
    variantId: string;
    quantity: number;
    priceSnapshot: number;
  }): Promise<CartItem>;
  updateItemQuantity(itemId: string, quantity: number): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  deleteCart(cartId: string): Promise<void>;
  getVariantInfo(
    variantId: string
  ): Promise<{
    id: string;
    stockQuantity: number;
    price: number;
    salePrice: number | null;
    productStatus: string;
  } | null>;
  getCartItemWithVariant(
    itemId: string
  ): Promise<{
    item: CartItem;
    variant: {
      stockQuantity: number;
      productStatus: string;
    };
  } | null>;
}
