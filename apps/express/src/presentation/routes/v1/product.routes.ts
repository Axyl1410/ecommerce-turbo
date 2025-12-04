import express, { type Router } from "express";
import { asyncHandler } from "@/lib/api-response-helper";
import AdminMiddleware from "@/middleware/admin.middleware";
import { ProductController } from "@/presentation/controllers/product.controller";
import {
  getProductsQuerySchema,
  getProductByIdParamsSchema,
  getProductBySlugParamsSchema,
  createProductBodySchema,
  updateProductParamsSchema,
  updateProductBodySchema,
  deleteProductParamsSchema,
} from "@/presentation/validators/product.validator";
import { sendError } from "@/lib/api-response-helper";

/**
 * Product Routes
 * Defines routes for product endpoints
 */
export function createProductRoutes(controller: ProductController): Router {
  const router = express.Router();

  /**
   * GET /api/v1/products
   * Get list of products with pagination, filtering, and sorting
   * Public access (no authentication required)
   */
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const validation = getProductsQuerySchema.safeParse(req.query);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid query parameters",
          400
        );
        return;
      }
      // Pass validated data directly to controller
      await controller.getProducts(validation.data, res);
    })
  );

  /**
   * GET /api/v1/products/slug/:slug
   * Get product detail by slug with variants and images
   * Public access (no authentication required)
   */
  router.get(
    "/slug/:slug",
    asyncHandler(async (req, res, next) => {
      const validation = getProductBySlugParamsSchema.safeParse(req.params);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid slug parameter",
          400
        );
        return;
      }
      next();
    }),
    asyncHandler((req, res) => controller.getProductBySlug(req, res))
  );

  /**
   * GET /api/v1/products/:id
   * Get product detail by ID with variants and images
   * Public access (no authentication required)
   */
  router.get(
    "/:id",
    asyncHandler(async (req, res, next) => {
      const validation = getProductByIdParamsSchema.safeParse(req.params);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid ID parameter",
          400
        );
        return;
      }
      next();
    }),
    asyncHandler((req, res) => controller.getProductById(req, res))
  );

  /**
   * POST /api/v1/products
   * Create a new product
   * Admin authentication required
   */
  router.post(
    "/",
    AdminMiddleware,
    asyncHandler(async (req, res, next) => {
      const validation = createProductBodySchema.safeParse(req.body);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid request body",
          400
        );
        return;
      }
      req.body = validation.data;
      next();
    }),
    asyncHandler((req, res) => controller.createProduct(req, res))
  );

  /**
   * PUT /api/v1/products/:id
   * Update a product
   * Admin authentication required
   */
  router.put(
    "/:id",
    AdminMiddleware,
    asyncHandler(async (req, res, next) => {
      const paramsValidation = updateProductParamsSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        sendError(
          res,
          paramsValidation.error.issues[0]?.message ?? "Invalid ID parameter",
          400
        );
        return;
      }

      const bodyValidation = updateProductBodySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        sendError(
          res,
          bodyValidation.error.issues[0]?.message ?? "Invalid request body",
          400
        );
        return;
      }

      req.body = bodyValidation.data;
      next();
    }),
    asyncHandler((req, res) => controller.updateProduct(req, res))
  );

  /**
   * DELETE /api/v1/products/:id
   * Delete a product
   * Admin authentication required
   */
  router.delete(
    "/:id",
    AdminMiddleware,
    asyncHandler(async (req, res, next) => {
      const validation = deleteProductParamsSchema.safeParse(req.params);
      if (!validation.success) {
        sendError(
          res,
          validation.error.issues[0]?.message ?? "Invalid ID parameter",
          400
        );
        return;
      }
      next();
    }),
    asyncHandler((req, res) => controller.deleteProduct(req, res))
  );

  return router;
}

