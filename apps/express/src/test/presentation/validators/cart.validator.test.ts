import {
	cartAddItemBodySchema,
	cartRemoveItemParamsSchema,
	cartUpdateItemBodySchema,
	cartUpdateItemParamsSchema,
} from "@/presentation/validators/cart.validator";

describe("Cart Validators", () => {
	describe("cartAddItemBodySchema", () => {
		it("validates valid add item data", () => {
			const result = cartAddItemBodySchema.safeParse({
				variantId: "variant-1",
				quantity: 2,
			});

			expect(result.success).toBe(true);
		});

		it("rejects missing variantId", () => {
			const result = cartAddItemBodySchema.safeParse({
				quantity: 2,
			});

			expect(result.success).toBe(false);
		});

		it("rejects zero quantity", () => {
			const result = cartAddItemBodySchema.safeParse({
				variantId: "variant-1",
				quantity: 0,
			});

			expect(result.success).toBe(false);
		});

		it("rejects negative quantity", () => {
			const result = cartAddItemBodySchema.safeParse({
				variantId: "variant-1",
				quantity: -1,
			});

			expect(result.success).toBe(false);
		});

		it("rejects non-integer quantity", () => {
			const result = cartAddItemBodySchema.safeParse({
				variantId: "variant-1",
				quantity: 1.5,
			});

			expect(result.success).toBe(false);
		});
	});

	describe("cartUpdateItemBodySchema", () => {
		it("validates valid update data", () => {
			const result = cartUpdateItemBodySchema.safeParse({
				quantity: 5,
			});

			expect(result.success).toBe(true);
		});

		it("allows zero quantity", () => {
			const result = cartUpdateItemBodySchema.safeParse({
				quantity: 0,
			});

			expect(result.success).toBe(true);
		});

		it("rejects negative quantity", () => {
			const result = cartUpdateItemBodySchema.safeParse({
				quantity: -1,
			});

			expect(result.success).toBe(false);
		});
	});

	describe("cartUpdateItemParamsSchema", () => {
		it("validates valid itemId", () => {
			const result = cartUpdateItemParamsSchema.safeParse({
				itemId: "item-1",
			});

			expect(result.success).toBe(true);
		});

		it("rejects empty itemId", () => {
			const result = cartUpdateItemParamsSchema.safeParse({ itemId: "" });

			expect(result.success).toBe(false);
		});
	});

	describe("cartRemoveItemParamsSchema", () => {
		it("validates valid itemId", () => {
			const result = cartRemoveItemParamsSchema.safeParse({
				itemId: "item-1",
			});

			expect(result.success).toBe(true);
		});

		it("rejects empty itemId", () => {
			const result = cartRemoveItemParamsSchema.safeParse({ itemId: "" });

			expect(result.success).toBe(false);
		});
	});
});
