import type { Request, Response } from "express";
import type { GetProductsDTO } from "@workspace/types";
import type { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import type { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
import type { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import type { GetProductBySlugUseCase } from "@/application/use-cases/product/get-product-by-slug.use-case";
import type { GetProductsUseCase } from "@/application/use-cases/product/get-products.use-case";
import type { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import {
	sendError,
	sendSuccess,
	sendSuccessNoData,
} from "@/lib/api-response-helper";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 */
export class ProductController {
	constructor(
		private getProductsUseCase: GetProductsUseCase,
		private getProductByIdUseCase: GetProductByIdUseCase,
		private getProductBySlugUseCase: GetProductBySlugUseCase,
		private createProductUseCase: CreateProductUseCase,
		private updateProductUseCase: UpdateProductUseCase,
		private deleteProductUseCase: DeleteProductUseCase,
	) {}

	/**
	 * GET /products
	 * Get list of products with pagination, filtering, and sorting
	 */
	async getProducts(query: GetProductsDTO, res: Response): Promise<void> {
		try {
			const result = await this.getProductsUseCase.execute(query);
			sendSuccess(res, result, "Products retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * GET /products/:id
	 * Get product detail by ID
	 */
	async getProductById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Product ID is required", 400);
				return;
			}
			const product = await this.getProductByIdUseCase.execute(id);
			sendSuccess(res, product, "Product retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * GET /products/slug/:slug
	 * Get product detail by slug
	 */
	async getProductBySlug(req: Request, res: Response): Promise<void> {
		try {
			const { slug } = req.params;
			if (!slug) {
				sendError(res, "Product slug is required", 400);
				return;
			}
			const product = await this.getProductBySlugUseCase.execute(slug);
			sendSuccess(res, product, "Product retrieved successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * POST /products
	 * Create a new product
	 */
	async createProduct(req: Request, res: Response): Promise<void> {
		try {
			const product = await this.createProductUseCase.execute(req.body);
			sendSuccess(res, product, "Product created successfully", 201);
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * PUT /products/:id
	 * Update a product
	 */
	async updateProduct(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Product ID is required", 400);
				return;
			}
			const product = await this.updateProductUseCase.execute(id, req.body);
			sendSuccess(res, product, "Product updated successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * DELETE /products/:id
	 * Delete a product
	 */
	async deleteProduct(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				sendError(res, "Product ID is required", 400);
				return;
			}
			await this.deleteProductUseCase.execute(id);
			sendSuccessNoData(res, "Product deleted successfully");
		} catch (error) {
			this.handleError(error, res);
		}
	}

	/**
	 * Handle errors and send appropriate response
	 */
	private handleError(error: unknown, res: Response): void {
		if (error instanceof NotFoundError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		if (error instanceof ApplicationError) {
			sendError(res, error.message, error.statusCode);
			return;
		}

		const errorMessage =
			error instanceof Error ? error.message : "Internal server error";
		sendError(res, errorMessage, 500);
	}
}
