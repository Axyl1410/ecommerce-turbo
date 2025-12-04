import type { GetCartInputDTO, CartDTO } from "@/application/dto/cart.dto";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import type { ICacheService } from "@/application/interfaces/cache.interface";
import { CartMapper } from "./cart.mapper";
import { ApplicationError } from "@/shared/errors/application.error";

export class GetOrCreateCartUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private cacheService: ICacheService
  ) {}

  async execute(dto: GetCartInputDTO): Promise<CartDTO> {
    const { userId, sessionId } = dto;
    if (!userId && !sessionId) {
      throw new ApplicationError(
        "Either userId or sessionId must be provided",
        "CART_IDENTIFIER_REQUIRED",
        400
      );
    }

    const cacheKey = this.buildCacheKey({ userId, sessionId });
    const cached = await this.cacheService.get<CartDTO>(cacheKey);
    if (cached && !(userId && sessionId)) {
      return cached;
    }

    let cart;

    if (userId && sessionId) {
      cart = await this.cartRepository.mergeGuestCart(userId, sessionId);
      await this.cacheService.delete(`cart:userId:${userId}`);
      await this.cacheService.delete(`cart:sessionId:${sessionId}`);
    } else if (userId) {
      cart =
        (await this.cartRepository.findByUserId(userId)) ??
        (await this.cartRepository.createCart({ userId, sessionId: null }));
    } else {
      cart =
        (await this.cartRepository.findBySessionId(sessionId!)) ??
        (await this.cartRepository.createCart({ userId: null, sessionId: sessionId ?? null }));
    }

    const dtoCart = CartMapper.toDTO(cart);
    await this.cacheService.set(cacheKey, dtoCart, 300);
    return dtoCart;
  }

  private buildCacheKey(params: {
    userId?: string;
    sessionId?: string;
  }): string {
    if (params.userId) {
      return `cart:userId:${params.userId}`;
    }
    return `cart:sessionId:${params.sessionId}`;
  }
}

