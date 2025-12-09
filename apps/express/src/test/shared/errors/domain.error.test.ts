import { DomainError } from "@/shared/errors/domain.error";

describe("DomainError", () => {
	it("creates error with message", () => {
		const error = new DomainError("Test error");

		expect(error.message).toBe("Test error");
		expect(error.name).toBe("DomainError");
		expect(error.code).toBeUndefined();
	});

	it("creates error with code", () => {
		const error = new DomainError("Test error", "ERROR_CODE");

		expect(error.message).toBe("Test error");
		expect(error.code).toBe("ERROR_CODE");
	});

	it("is instance of Error", () => {
		const error = new DomainError("Test error");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
	});
});

