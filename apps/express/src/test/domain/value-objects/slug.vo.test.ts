import { Slug } from "@/domain/value-objects/slug.vo";
import { DomainError } from "@/shared/errors/domain.error";

describe("Slug Value Object", () => {
	it("creates a valid slug", () => {
		const slug = Slug.fromString("awesome-product");
		expect(slug.toString()).toBe("awesome-product");
	});

	it("creates slug with numbers", () => {
		const slug = Slug.fromString("product-123");
		expect(slug.toString()).toBe("product-123");
	});

	it("creates slug with hyphens and underscores", () => {
		const slug = Slug.fromString("product_name-123");
		expect(slug.toString()).toBe("product_name-123");
	});

	it("throws when creating slug with uppercase letters", () => {
		expect(() => Slug.fromString("Invalid-Slug")).toThrow(DomainError);
		try {
			Slug.fromString("Invalid-Slug");
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_SLUG");
			}
		}
	});

	it("throws when creating slug with spaces", () => {
		expect(() => Slug.fromString("invalid slug")).toThrow(DomainError);
	});

	it("throws when creating slug with special characters", () => {
		expect(() => Slug.fromString("invalid@slug")).toThrow(DomainError);
		expect(() => Slug.fromString("invalid.slug")).toThrow(DomainError);
		expect(() => Slug.fromString("invalid!slug")).toThrow(DomainError);
	});

	it("throws when creating empty slug", () => {
		expect(() => Slug.fromString("")).toThrow(DomainError);
	});

	it("equals returns true for same slug", () => {
		const slug1 = Slug.fromString("test-slug");
		const slug2 = Slug.fromString("test-slug");
		expect(slug1.equals(slug2)).toBe(true);
	});

	it("equals returns false for different slugs", () => {
		const slug1 = Slug.fromString("test-slug");
		const slug2 = Slug.fromString("other-slug");
		expect(slug1.equals(slug2)).toBe(false);
	});
});
