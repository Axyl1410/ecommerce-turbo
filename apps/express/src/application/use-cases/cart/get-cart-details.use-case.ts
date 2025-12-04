import type {
  CartValidationIssueDTO,
  CartWithItemsDTO,
} from "@/application/dto/cart.dto";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import { CartMapper } from "./cart.mapper";

export class GetCartDetailsUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private cacheService: ICacheService
  ) {}

  async execute(cartId: string): Promise<CartWithItemsDTO | null> {
    const cacheKey = `cart:${cartId}`;
    const cached = await this.cacheService.get<CartWithItemsDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.cartRepository.getCartWithItems({ id: cartId });
    if (!data) {
      return null;
    }

    const validation = this.buildValidation(data.items);

    const dto = CartMapper.toCartWithItemsDTO(data.cart, {
      items: data.items.map(({ item }) => ({
        item,
        createdAt: item.toJSON().createdAt,
      })),
      validation,
    });

    if (!validation?.errors?.length) {
      await this.cacheService.set(cacheKey, dto, 300);
    }

    return dto;
  }

  private buildValidation(
    entries: Array<{
      item: import("@/domain/entities/cart-item.entity").CartItem;
      variant: {
        stockQuantity: number;
        price?: number;
        salePrice?: number | null;
        productStatus: string;
      };
    }>
  ):
    | {
        warnings: CartValidationIssueDTO[];
        errors: CartValidationIssueDTO[];
      }
    | undefined {
    const warnings: CartValidationIssueDTO[] = [];
    const errors: CartValidationIssueDTO[] = [];

    for (const { item, variant } of entries) {
      const issues: CartValidationIssueDTO["issues"] = [];
      const raw = item.toJSON();

      if (variant.productStatus !== "PUBLISHED") {
        issues.push({
          type: "status",
          message: `Product is not available (status: ${variant.productStatus})`,
        });
      }

      if (raw.quantity > variant.stockQuantity) {
        issues.push({
          type: "stock",
          message: `Insufficient stock. Only ${variant.stockQuantity} items available, but cart has ${raw.quantity}.`,
        });
      }

      const currentPrice = Number(variant.salePrice ?? variant.price ?? 0);
      const snapshotPrice = raw.priceAtAdd;
      const priceDiff = Math.abs(currentPrice - snapshotPrice);
      if (snapshotPrice > 0) {
        if (priceDiff > 0.01 * snapshotPrice || priceDiff > 1000) {
          issues.push({
            type: "price",
            message: `Price has changed from ${snapshotPrice.toLocaleString()} to ${currentPrice.toLocaleString()}`,
          });
        }
      }

      if (issues.length === 0) {
        continue;
      }

      const output: CartValidationIssueDTO = {
        itemId: raw.id,
        variantId: raw.variantId,
        issues,
      };

      if (issues.some((issue) => issue.type === "status" || issue.type === "stock")) {
        errors.push(output);
      } else {
        warnings.push(output);
      }
    }

    if (warnings.length === 0 && errors.length === 0) {
      return undefined;
    }

    return { warnings, errors };
  }
}

