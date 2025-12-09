import type { NextFunction, Request, Response } from "express";

// Mock logger before importing middleware
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock("@/lib/logger", () => {
	const mockLogger = {
		info: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		debug: jest.fn(),
	};
	return {
		__esModule: true,
		default: mockLogger,
	};
});

import logMiddleware from "@/middleware/log.middleware";
import logger from "@/lib/logger";

describe("LogMiddleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			method: "GET",
			path: "/api/test",
			ip: "127.0.0.1",
		};
		res = {};
		next = jest.fn();
		jest.clearAllMocks();
	});

	it("logs request information", () => {
		logMiddleware(req as Request, res as Response, next);

		expect(logger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				path: "/api/test",
				ip: "127.0.0.1",
				timestamp: expect.any(String),
			}),
			"Request received",
		);
	});

	it("calls next", () => {
		logMiddleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalled();
	});
});
