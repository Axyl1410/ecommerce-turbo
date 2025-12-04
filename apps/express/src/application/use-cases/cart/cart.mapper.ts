import type { Cart } from "@/domain/entities/cart.entity";
import type { CartItem } from "@/domain/entities/cart-item.entity";
import type {
  CartDTO,
  CartItemDTO,
  CartValidationIssueDTO,
  CartWithItemsDTO,
} from "@/application/dto/cart.dto";

export const CartMapper = {
  toDTO(cart: Cart): CartDTO {
    return {
      id: cart.id,
      userId: cart.getUserId(),
      sessionId: cart.getSessionId(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },

  toItemDTO(item: CartItem, createdAt: Date): CartItemDTO {
    const raw = item.toJSON();
    return {
      id: raw.id,
      cartId: raw.cartId,
      variantId: raw.variantId,
      quantity: raw.quantity,
      priceAtAdd: raw.priceAtAdd,
      createdAt,
    };
  },

  toCartWithItemsDTO(
    cart: Cart,
    params: {
      items: Array<{
        item: CartItem;
        createdAt: Date;
      }>;
      validation?: {
        warnings: CartValidationIssueDTO[];
        errors: CartValidationIssueDTO[];
      };
    }
  ): CartWithItemsDTO {
    return {
      ...CartMapper.toDTO(cart),
      items: params.items.map(({ item, createdAt }) =>
        CartMapper.toItemDTO(item, createdAt)
      ),
      ...(params.validation ? { validation: params.validation } : {}),
    };
  },
};

