import express, { type Request, type Response, type Router } from "express";
import { container } from "@/infrastructure/di/container";
import { sendError, sendSuccess } from "@/lib/api-response-helper";
import type { BrandController } from "@/presentation/controllers/brand.controller";
import type { CartController } from "@/presentation/controllers/cart.controller";
import type { CategoryController } from "@/presentation/controllers/category.controller";
import type { BrandController } from "@/presentation/controllers/brand.controller";
import type { ProductController } from "@/presentation/controllers/product.controller";
import type { WishlistController } from "@/presentation/controllers/wishlist.controller";
import AuthMiddleware from "@/presentation/middleware/auth.middleware";
import { createBrandRoutes } from "@/presentation/routes/v1/brand.routes";
import { createCartRoutes } from "@/presentation/routes/v1/cart.routes";
import { createCategoryRoutes } from "@/presentation/routes/v1/category.routes";
import { createBrandRoutes } from "@/presentation/routes/v1/brand.routes";
import { createProductRoutes } from "@/presentation/routes/v1/product.routes";
import { createWishlistRoutes } from "@/presentation/routes/v1/wishlist.routes";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";

const v1: Router = express.Router();

v1.get("/ping", (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      timestamp: new Date().toISOString(),
    },
    "pong"
  );
});

v1.get("/me", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

const productController = container.get<ProductController>("productController");
v1.use("/products", createProductRoutes(productController));

const brandController = container.get<BrandController>("brandController");
v1.use("/brands", createBrandRoutes(brandController));

const categoryController =
  container.get<CategoryController>("categoryController");
v1.use("/categories", createCategoryRoutes(categoryController));

const brandController = container.get<BrandController>("brandController");
v1.use("/brands", createBrandRoutes(brandController));

const cartController = container.get<CartController>("cartController");
v1.use("/cart", createCartRoutes(cartController));

const wishlistController =
  container.get<WishlistController>("wishlistController");
v1.use("/wishlist", createWishlistRoutes(wishlistController));

export default v1;
