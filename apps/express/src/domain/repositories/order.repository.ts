import type { OrderItemType, OrderType } from "@/types/order";

export interface IOrderRepository {
  createOrder(params: {
    userId: string;
    shippingAddress: Record<string, unknown>;
    paymentMethod?: string | null;
    items: Array<{
      variantId: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>;
    totals: {
      totalAmount: number;
      shippingFee: number;
      discountAmount: number;
      finalAmount: number;
    };
    appliedCouponCode?: string | null;
  }): Promise<{ order: OrderType; items: OrderItemType[] }>;

  getOrdersByUser(userId: string): Promise<OrderType[]>;

  getOrderWithItems(
    orderId: string,
    userId: string,
  ): Promise<{ order: OrderType; items: OrderItemType[] } | null>;
}