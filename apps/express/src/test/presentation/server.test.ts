import request from "supertest";
import { CreateServer } from "../../server";

// Mock ESM modules that Jest cannot parse in CommonJS mode
jest.mock("@scalar/express-api-reference", () => ({
	apiReference:
		() =>
		(_req: unknown, _res: unknown, next: () => void): void => {
			next();
		},
}));

jest.mock("better-auth/node", () => ({
	toNodeHandler:
		() =>
		(_req: unknown, _res: unknown, next: () => void): void => {
			next();
		},
}));

jest.mock("../../lib/auth", () => ({
	auth: {
		api: {
			getSession: jest.fn().mockResolvedValue(null),
		},
	},
}));

jest.mock("../../lib/redis", () => ({
	RedisClient: {
		isOpen: true,
		connect: jest.fn(),
		setEx: jest.fn(),
		get: jest.fn().mockResolvedValue(null),
		del: jest.fn(),
		exists: jest.fn().mockResolvedValue(0),
		ttl: jest.fn().mockResolvedValue(-1),
	},
}));

jest.mock("@workspace/database", () => ({
	prisma: {},
}));

describe("Health endpoints", () => {
	const app = CreateServer();

	it("returns success for /health", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			result: "SUCCESS",
			message: "Server is healthy",
		});
		expect(response.body.data).toHaveProperty("timestamp");
	});

	it("returns welcome message for root route", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			result: "SUCCESS",
			message: "Welcome to API",
		});
	});
});
