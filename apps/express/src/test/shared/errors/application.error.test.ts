import { ApplicationError } from "@/shared/errors/application.error";

describe("ApplicationError", () => {
	it("creates error with message", () => {
		const error = new ApplicationError("Test error");

		expect(error.message).toBe("Test error");
		expect(error.name).toBe("ApplicationError");
		expect(error.statusCode).toBe(500);
		expect(error.code).toBeUndefined();
	});

	it("creates error with code", () => {
		const error = new ApplicationError("Test error", "ERROR_CODE");

		expect(error.message).toBe("Test error");
		expect(error.code).toBe("ERROR_CODE");
		expect(error.statusCode).toBe(500);
	});

	it("creates error with status code", () => {
		const error = new ApplicationError("Test error", "ERROR_CODE", 400);

		expect(error.message).toBe("Test error");
		expect(error.code).toBe("ERROR_CODE");
		expect(error.statusCode).toBe(400);
	});

	it("is instance of Error", () => {
		const error = new ApplicationError("Test error");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(ApplicationError);
	});
});
