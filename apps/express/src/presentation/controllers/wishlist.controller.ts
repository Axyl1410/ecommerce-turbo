import type { Request, Response } from "express";
import type { AddToWishlistUseCase } from "@/application/use-cases/wishlist/add-wishlist.use-case";
import type { RemoveFromWishlistUseCase } from "@/application/use-cases/wishlist/remove-wishlist.use-case";
import type { GetUserWishlistUseCase } from "@/application/use-cases/wishlist/get-wishlist.use-case";
import { sendSuccess } from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export class WishlistController {
  // translation: Bộ điều khiển danh sách yêu thích
  constructor(
    private addToWishlistUseCase: AddToWishlistUseCase,
    private removeFromWishlistUseCase: RemoveFromWishlistUseCase,
    private getUserWishlistUseCase: GetUserWishlistUseCase
  ) {}

  async addToWishlist(req: Request, res: Response): Promise<void> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    const userId = session?.user?.id;
    if (!userId)
      throw new ApplicationError("Unauthorized", "UNAUTHORIZED", 401);

    // Lấy productId từ body
    const productId = (req.body?.productId ?? "").toString().trim();

    if (!productId) {
      throw new ApplicationError(
        "Product ID is required",
        "INVALID_INPUT",
        400
      );
    }

    await this.addToWishlistUseCase.execute(userId, productId);
    sendSuccess(res, null, "Product added to wishlist");
  }

  async removeFromWishlist(req: Request, res: Response): Promise<void> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    const userId = session?.user?.id;
    if (!userId)
      throw new ApplicationError("Unauthorized", "UNAUTHORIZED", 401);

    const { productId } = req.params;
    if (!productId) {
      throw new ApplicationError(
        "Product ID is required",
        "INVALID_INPUT",
        400
      );
    }

    await this.removeFromWishlistUseCase.execute(userId, productId);
    sendSuccess(res, null, "Product removed from wishlist");
  }

  async getWishlist(req: Request, res: Response): Promise<void> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    const userId = session?.user?.id;
    if (!userId)
      throw new ApplicationError("Unauthorized", "UNAUTHORIZED", 401);

    const wishlist = await this.getUserWishlistUseCase.execute(userId);
    sendSuccess(res, wishlist, "User wishlist");
  }
}
