import { Price } from "@/domain/value-objects/price.vo";
import { DomainError } from "@/shared/errors/domain.error";

describe("Price Value Object", () => {
	it("creates a valid price", () => {
		const price = Price.fromNumber(1999);
		expect(price.toNumber()).toBe(1999);
	});

	it("creates price with zero", () => {
		const price = Price.fromNumber(0);
		expect(price.toNumber()).toBe(0);
	});

	it("creates price with decimal values", () => {
		const price = Price.fromNumber(19.99);
		expect(price.toNumber()).toBe(19.99);
	});

	it("throws when creating negative price", () => {
		expect(() => Price.fromNumber(-100)).toThrow(DomainError);
		try {
			Price.fromNumber(-100);
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_PRICE");
			}
		}
	});

	it("isGreaterThan returns true when price is greater", () => {
		const price1 = Price.fromNumber(2000);
		const price2 = Price.fromNumber(1000);
		expect(price1.isGreaterThan(price2)).toBe(true);
	});

	it("isGreaterThan returns false when price is not greater", () => {
		const price1 = Price.fromNumber(1000);
		const price2 = Price.fromNumber(2000);
		expect(price1.isGreaterThan(price2)).toBe(false);
	});

	it("isLessThan returns true when price is less", () => {
		const price1 = Price.fromNumber(1000);
		const price2 = Price.fromNumber(2000);
		expect(price1.isLessThan(price2)).toBe(true);
	});

	it("isLessThan returns false when price is not less", () => {
		const price1 = Price.fromNumber(2000);
		const price2 = Price.fromNumber(1000);
		expect(price1.isLessThan(price2)).toBe(false);
	});

	it("percentageDifference calculates correctly", () => {
		const price1 = Price.fromNumber(1000);
		const price2 = Price.fromNumber(1200);
		const diff = price1.percentageDifference(price2);
		expect(diff).toBe(20);
	});

	it("percentageDifference returns 0 when base price is 0", () => {
		const price1 = Price.fromNumber(0);
		const price2 = Price.fromNumber(100);
		const diff = price1.percentageDifference(price2);
		expect(diff).toBe(0);
	});

	it("hasSignificantDifference returns true for percentage difference > 1%", () => {
		const price1 = Price.fromNumber(1000);
		const price2 = Price.fromNumber(1200);
		expect(price1.hasSignificantDifference(price2)).toBe(true);
	});

	it("hasSignificantDifference returns true for absolute difference > 1000", () => {
		const price1 = Price.fromNumber(10000);
		const price2 = Price.fromNumber(12000);
		expect(price1.hasSignificantDifference(price2)).toBe(true);
	});

	it("hasSignificantDifference returns false for small differences", () => {
		const price1 = Price.fromNumber(1000);
		const price2 = Price.fromNumber(1005);
		expect(price1.hasSignificantDifference(price2)).toBe(false);
	});

	it("equals returns true for same price", () => {
		const price1 = Price.fromNumber(1999);
		const price2 = Price.fromNumber(1999);
		expect(price1.equals(price2)).toBe(true);
	});

	it("equals returns false for different prices", () => {
		const price1 = Price.fromNumber(1999);
		const price2 = Price.fromNumber(2000);
		expect(price1.equals(price2)).toBe(false);
	});
});
