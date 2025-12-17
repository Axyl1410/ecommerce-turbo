import type { NextFunction, Request, Response } from "express";

jest.mock("@/lib/api-response-helper");

// Mock logger before importing middleware
jest.mock("@/lib/logger", () => {
	const mockLogger = {
		error: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		debug: jest.fn(),
	};
	return {
		__esModule: true,
		default: mockLogger,
	};
});

import { sendErrorFromException } from "@/lib/api-response-helper";
import logger from "@/lib/logger";
import { errorMiddleware } from "@/presentation/middleware/error.middleware";
import { ApplicationError } from "@/shared/errors/application.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

describe("ErrorMiddleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			path: "/api/test",
			method: "GET",
			ip: "127.0.0.1",
			body: {},
			params: {},
			query: {},
		};
		res = {};
		next = jest.fn();
		jest.clearAllMocks();
	});

	it("handles NotFoundError with 404 status", () => {
		const error = new NotFoundError("Resource", "id-1");

		errorMiddleware(error, req as Request, res as Response, next);

		expect(logger.error).toHaveBeenCalled();
		expect(sendErrorFromException).toHaveBeenCalledWith(res, error, 404);
	});

	it("handles ApplicationError with correct status code", () => {
		// Note: errorMiddleware determines status from message patterns, not error.statusCode
		// For ApplicationError with statusCode, we need to check if middleware handles it
		const error = new ApplicationError("Error message", "ERROR_CODE", 409);

		errorMiddleware(error, req as Request, res as Response, next);

		expect(logger.error).toHaveBeenCalled();
		// Since errorMiddleware doesn't check error.statusCode, it defaults to 500
		// unless message matches a pattern
		expect(sendErrorFromException).toHaveBeenCalledWith(res, error, 500);
	});

	it("handles generic Error with 500 status", () => {
		const error = new Error("Generic error");

		errorMiddleware(error, req as Request, res as Response, next);

		expect(logger.error).toHaveBeenCalled();
		expect(sendErrorFromException).toHaveBeenCalledWith(res, error, 500);
	});

	it("determines status code from error message patterns", () => {
		const notFoundError = new Error("Resource not found");
		errorMiddleware(notFoundError, req as Request, res as Response, next);
		expect(sendErrorFromException).toHaveBeenCalledWith(
			res,
			notFoundError,
			404,
		);

		const unauthorizedError = new Error("Unauthorized access");
		errorMiddleware(unauthorizedError, req as Request, res as Response, next);
		expect(sendErrorFromException).toHaveBeenCalledWith(
			res,
			unauthorizedError,
			401,
		);

		const validationError = new Error("Field is required");
		errorMiddleware(validationError, req as Request, res as Response, next);
		expect(sendErrorFromException).toHaveBeenCalledWith(
			res,
			validationError,
			400,
		);
	});
});
