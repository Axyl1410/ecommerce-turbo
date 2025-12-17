import { Router } from "express";
import type { WishlistController } from "@/presentation/controllers/wishlist.controller";
import AuthMiddleware from "@/presentation/middleware/auth.middleware";

export const createWishlistRoutes = (
    wishlistController: WishlistController,
): Router => {
    const router = Router();

    router.use(AuthMiddleware);

    router.get("/", (req, res, next) =>
        wishlistController.getWishlist(req, res).catch(next),
    );
    router.post("/", (req, res, next) =>
        wishlistController.addToWishlist(req, res).catch(next),
    );
    router.delete("/:productId", (req, res, next) =>
        wishlistController.removeFromWishlist(req, res).catch(next),
    );

    return router;
};