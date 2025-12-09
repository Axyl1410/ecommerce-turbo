import express, { type Request, type Response, type Router } from "express";
import { container } from "@/infrastructure/di/container";
import { sendSuccess } from "@/lib/api-response-helper";
import AuthMiddleware from "@/middleware/auth.middleware";
import type { CartController } from "@/presentation/controllers/cart.controller";
import type { CategoryController } from "@/presentation/controllers/category.controller";
import type { ProductController } from "@/presentation/controllers/product.controller";
import { createCartRoutes } from "@/presentation/routes/v1/cart.routes";
import { createCategoryRoutes } from "@/presentation/routes/v1/category.routes";
import { createProductRoutes } from "@/presentation/routes/v1/product.routes";

const v1: Router = express.Router();

v1.get("/ping", (_req: Request, res: Response) => {
	sendSuccess(
		res,
		{
			timestamp: new Date().toISOString(),
		},
		"pong",
	);
});

v1.get("/me", AuthMiddleware, (req, res) => {
	sendSuccess(res, { session: req.session }, "User session");
});

const productController = container.get<ProductController>("productController");
v1.use("/products", createProductRoutes(productController));

const categoryController = container.get<CategoryController>("categoryController");
v1.use("/categories", createCategoryRoutes(categoryController));

const cartController = container.get<CartController>("cartController");
v1.use("/cart", createCartRoutes(cartController));

export default v1;
