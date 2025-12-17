import type { Request, Response } from "express";
import type { AddToWishlistUseCase } from "@/application/use-cases/wishlist/add-wishlist.use-case";
import type { RemoveFromWishlistUseCase } from "@/application/use-cases/wishlist/remove-wishlist.use-case";
import type { GetUserWishlistUseCase } from "@/application/use-cases/wishlist/get-wishlist.use-case";
import { WishlistController } from "@/presentation/controllers/wishlist.controller";
import { ApplicationError } from "@/shared/errors/application.error";

const createUseCaseMocks = () => ({
	addToWishlistUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<AddToWishlistUseCase>,
	removeFromWishlistUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<RemoveFromWishlistUseCase>,
	getUserWishlistUseCase: {
		execute: jest.fn(),
	} as unknown as jest.Mocked<GetUserWishlistUseCase>,
});

const createResponseMock = (): jest.Mocked<Response> =>
	({
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}) as unknown as jest.Mocked<Response>;

const createRequestMock = (overrides = {}): jest.Mocked<Request> =>
	({
		session: {
			user: {
				id: "user-1",
			},
		},
		body: {},
		params: {},
		...overrides,
	}) as unknown as jest.Mocked<Request>;

describe("WishlistController", () => {
	describe("addToWishlist", () => {
		it("should add product to wishlist successfully", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({ body: { productId: "prod-1" } });
			const res = createResponseMock();

			useCases.addToWishlistUseCase.execute.mockResolvedValue(undefined);

			await controller.addToWishlist(req, res);

			expect(useCases.addToWishlistUseCase.execute).toHaveBeenCalledWith(
				"user-1",
				"prod-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("should throw error when user is not authenticated", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({
				session: undefined,
				body: { productId: "prod-1" },
			});
			const res = createResponseMock();

			await expect(controller.addToWishlist(req, res)).rejects.toThrow(
				ApplicationError,
			);
		});

		it("should throw error when productId is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({ body: {} });
			const res = createResponseMock();

			await expect(controller.addToWishlist(req, res)).rejects.toThrow(
				ApplicationError,
			);
		});
	});

	describe("removeFromWishlist", () => {
		it("should remove product from wishlist successfully", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({ params: { productId: "prod-1" } });
			const res = createResponseMock();

			useCases.removeFromWishlistUseCase.execute.mockResolvedValue(undefined);

			await controller.removeFromWishlist(req, res);

			expect(useCases.removeFromWishlistUseCase.execute).toHaveBeenCalledWith(
				"user-1",
				"prod-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("should throw error when user is not authenticated", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({
				session: undefined,
				params: { productId: "prod-1" },
			});
			const res = createResponseMock();

			await expect(controller.removeFromWishlist(req, res)).rejects.toThrow(
				ApplicationError,
			);
		});

		it("should throw error when productId is missing", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({ params: {} });
			const res = createResponseMock();

			await expect(controller.removeFromWishlist(req, res)).rejects.toThrow(
				ApplicationError,
			);
		});
	});

	describe("getWishlist", () => {
		it("should return user wishlist successfully", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock();
			const res = createResponseMock();

			const mockWishlist = [
				{
					id: "wish-1",
					productId: "prod-1",
					productName: "Product 1",
					productSlug: "product-1",
					productImage: "image1.jpg",
					price: 100,
					salePrice: 80,
					createdAt: new Date(),
				},
			];

			useCases.getUserWishlistUseCase.execute.mockResolvedValue(mockWishlist);

			await controller.getWishlist(req, res);

			expect(useCases.getUserWishlistUseCase.execute).toHaveBeenCalledWith(
				"user-1",
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 200,
					data: mockWishlist,
				}),
			);
		});

		it("should throw error when user is not authenticated", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock({ session: undefined });
			const res = createResponseMock();

			await expect(controller.getWishlist(req, res)).rejects.toThrow(
				ApplicationError,
			);
		});

		it("should return empty array when user has no wishlist items", async () => {
			const useCases = createUseCaseMocks();
			const controller = new WishlistController(
				useCases.addToWishlistUseCase,
				useCases.removeFromWishlistUseCase,
				useCases.getUserWishlistUseCase,
			);

			const req = createRequestMock();
			const res = createResponseMock();

			useCases.getUserWishlistUseCase.execute.mockResolvedValue([]);

			await controller.getWishlist(req, res);

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 200,
					data: [],
				}),
			);
		});
	});
});
