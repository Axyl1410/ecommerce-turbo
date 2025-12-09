import type { Request, Response } from "express";
import { ProductController } from "@/presentation/controllers/product.controller";
import type { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import type { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
import type { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import type { GetProductBySlugUseCase } from "@/application/use-cases/product/get-product-by-slug.use-case";
import type { GetProductsUseCase } from "@/application/use-cases/product/get-products.use-case";
import type { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

const createUseCaseMocks = () => ({
	getProductsUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetProductsUseCase>,
	getProductByIdUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetProductByIdUseCase>,
	getProductBySlugUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetProductBySlugUseCase>,
	createProductUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<CreateProductUseCase>,
	updateProductUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<UpdateProductUseCase>,
	deleteProductUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<DeleteProductUseCase>,
});

const createResponseMock = (): jest.Mocked<Response> =>
	({
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}) as unknown as jest.Mocked<Response>;

describe("ProductController", () => {
	describe("getProducts", () => {
		it("sends success response with products", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const res = createResponseMock();
			const result = { products: [], total: 0 };

			useCases.getProductsUseCase.execute.mockResolvedValue(result as any);

			await controller.getProducts({}, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					result: "SUCCESS",
					message: "Products retrieved successfully",
				}),
			);
		});
	});

	describe("getProductById", () => {
		it("sends success response with product", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = { params: { id: "prod-1" } } as unknown as Request;
			const res = createResponseMock();
			const product = { id: "prod-1", name: "Product" };

			useCases.getProductByIdUseCase.execute.mockResolvedValue(product as any);

			await controller.getProductById(req, res);

			expect(useCases.getProductByIdUseCase.execute).toHaveBeenCalledWith(
				"prod-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("sends error when id is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = { params: {} } as unknown as Request;
			const res = createResponseMock();

			await controller.getProductById(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("handles NotFoundError", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = { params: { id: "non-existent" } } as unknown as Request;
			const res = createResponseMock();

			useCases.getProductByIdUseCase.execute.mockRejectedValue(
				new NotFoundError("Product", "non-existent"),
			);

			await controller.getProductById(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("getProductBySlug", () => {
		it("sends success response with product", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = { params: { slug: "product-slug" } } as unknown as Request;
			const res = createResponseMock();
			const product = { id: "prod-1", slug: "product-slug" };

			useCases.getProductBySlugUseCase.execute.mockResolvedValue(
				product as any,
			);

			await controller.getProductBySlug(req, res);

			expect(useCases.getProductBySlugUseCase.execute).toHaveBeenCalledWith(
				"product-slug",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("createProduct", () => {
		it("sends success response with created product", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = {
				body: { name: "New Product", slug: "new-product" },
			} as unknown as Request;
			const res = createResponseMock();
			const product = { id: "prod-1", name: "New Product" };

			useCases.createProductUseCase.execute.mockResolvedValue(product as any);

			await controller.createProduct(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
		});

		it("handles ApplicationError", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = {
				body: { name: "Product", slug: "existing-slug" },
			} as unknown as Request;
			const res = createResponseMock();

			useCases.createProductUseCase.execute.mockRejectedValue(
				new ApplicationError("Slug exists", "SLUG_EXISTS", 409),
			);

			await controller.createProduct(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
		});
	});

	describe("updateProduct", () => {
		it("sends success response with updated product", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = {
				params: { id: "prod-1" },
				body: { name: "Updated Product" },
			} as unknown as Request;
			const res = createResponseMock();
			const product = { id: "prod-1", name: "Updated Product" };

			useCases.updateProductUseCase.execute.mockResolvedValue(product as any);

			await controller.updateProduct(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("deleteProduct", () => {
		it("sends success response", async () => {
			const useCases = createUseCaseMocks();
			const controller = new ProductController(
				useCases.getProductsUseCase,
				useCases.getProductByIdUseCase,
				useCases.getProductBySlugUseCase,
				useCases.createProductUseCase,
				useCases.updateProductUseCase,
				useCases.deleteProductUseCase,
			);

			const req = { params: { id: "prod-1" } } as unknown as Request;
			const res = createResponseMock();

			useCases.deleteProductUseCase.execute.mockResolvedValue();

			await controller.deleteProduct(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});
});

