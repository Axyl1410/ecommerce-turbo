import type { NextFunction, Request, Response } from "express";
import {
	asyncHandler,
	createErrorResponse,
	createSuccessNoDataResponse,
	createSuccessResponse,
	sendError,
	sendErrorFromException,
	sendSuccess,
	sendSuccessNoData,
} from "@/lib/api-response-helper";

describe("API Response Helper", () => {
	describe("createSuccessResponse", () => {
		it("creates success response with data", () => {
			const data = { id: 1, name: "Test" };
			const response = createSuccessResponse(data, "Success message");

			expect(response).toEqual({
				status: 200,
				message: "Success message",
				data,
			});
		});

		it("uses default message when not provided", () => {
			const response = createSuccessResponse({ id: 1 });

			expect(response.message).toBe("Success");
		});
	});

	describe("createErrorResponse", () => {
		it("creates error response", () => {
			const response = createErrorResponse("Error message");

			expect(response).toEqual({
				status: 400,
				message: "Error message",
				data: null,
			});
		});
	});

	describe("createSuccessNoDataResponse", () => {
		it("creates success response with no data", () => {
			const response = createSuccessNoDataResponse("Operation successful");

			expect(response).toEqual({
				status: 200,
				message: "Operation successful",
				data: null,
			});
		});
	});

	describe("sendSuccess", () => {
		it("sends success response", () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			} as unknown as Response;

			sendSuccess(res, { id: 1 }, "Success", 201);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 201,
					message: "Success",
					data: { id: 1 },
				}),
			);
		});
	});

	describe("sendError", () => {
		it("sends error response", () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			} as unknown as Response;

			sendError(res, "Error message", 400);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 400,
					message: "Error message",
				}),
			);
		});
	});

	describe("sendErrorFromException", () => {
		it("sends error from Error object", () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			} as unknown as Response;

			const error = new Error("Test error");
			sendErrorFromException(res, error, 500);

			expect(res.status).toHaveBeenCalledWith(500);
		});

		it("sends error from string", () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			} as unknown as Response;

			sendErrorFromException(res, "Error string", 400);

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});

	describe("asyncHandler", () => {
		it("calls handler successfully", async () => {
			const handler = asyncHandler(async (req, res, next) => {
				res.status(200).json({ success: true });
			});

			const req = {} as Request;
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			} as unknown as Response;
			const next = jest.fn() as NextFunction;

			await handler(req, res, next);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("passes errors to next", async () => {
			const handler = asyncHandler(async (req, res, next) => {
				throw new Error("Test error");
			});

			const req = {} as Request;
			const res = {} as Response;
			const next = jest.fn() as NextFunction;

			await handler(req, res, next);

			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
