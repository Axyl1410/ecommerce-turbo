import { NotFoundError } from "@/shared/errors/not-found.error";

describe("NotFoundError", () => {
	it("creates error with resource name and identifier", () => {
		const error = new NotFoundError("Product", "prod-1");

		expect(error.message).toContain("Product");
		expect(error.message).toContain("prod-1");
		expect(error.statusCode).toBe(404);
		expect(error.name).toBe("NotFoundError");
	});

	it("is instance of Error", () => {
		const error = new NotFoundError("Product", "prod-1");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(NotFoundError);
	});
});

