import {
	createProductBodySchema,
	deleteProductParamsSchema,
	getProductByIdParamsSchema,
	getProductBySlugParamsSchema,
	getProductsQuerySchema,
	updateProductBodySchema,
} from "@/presentation/validators/product.validator";

describe("Product Validators", () => {
	describe("getProductsQuerySchema", () => {
		it("validates valid query parameters", () => {
			const result = getProductsQuerySchema.safeParse({
				page: "1",
				limit: "10",
				status: "PUBLISHED",
				categoryId: "cat-1",
				brandId: "brand-1",
				search: "test",
				sortBy: "name",
				sortOrder: "asc",
			});

			expect(result.success).toBe(true);
		});

		it("rejects invalid status", () => {
			const result = getProductsQuerySchema.safeParse({
				status: "INVALID",
			});

			expect(result.success).toBe(false);
		});
	});

	describe("createProductBodySchema", () => {
		it("validates valid product data", () => {
			const result = createProductBodySchema.safeParse({
				name: "New Product",
				slug: "new-product",
			});

			expect(result.success).toBe(true);
		});

		it("validates product with variants", () => {
			const result = createProductBodySchema.safeParse({
				name: "Product",
				slug: "product",
				variants: [
					{
						price: 1999,
						stockQuantity: 10,
					},
				],
			});

			expect(result.success).toBe(true);
		});

		it("rejects negative price", () => {
			const result = createProductBodySchema.safeParse({
				name: "Product",
				slug: "product",
				variants: [
					{
						price: -100,
						stockQuantity: 10,
					},
				],
			});

			expect(result.success).toBe(false);
		});
	});

	describe("updateProductBodySchema", () => {
		it("validates valid update data", () => {
			const result = updateProductBodySchema.safeParse({
				name: "Updated Product",
			});

			expect(result.success).toBe(true);
		});

		it("allows all fields to be optional", () => {
			const result = updateProductBodySchema.safeParse({});

			expect(result.success).toBe(true);
		});
	});
});
