import { Product } from "@/domain/entities/product.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { buildProductProps } from "./helpers";

describe("Product Entity", () => {
	const createProduct = (
		overrides?: Partial<ReturnType<typeof buildProductProps>>,
	) => {
		const props = buildProductProps(overrides);
		return Product.create(
			props.id,
			props.name,
			props.slug,
			props.description,
			props.brandId,
			props.categoryId,
			props.defaultImage,
			props.seoMetaTitle,
			props.seoMetaDesc,
			props.status,
			props.createdAt,
			props.updatedAt,
		);
	};

	it("creates a product with a slug value object", () => {
		const product = createProduct({ slug: "awesome-product" });

		expect(product.getSlug()).toBe("awesome-product");
		expect(product.getStatus()).toBe("DRAFT");
	});

	it("throws when creating product with invalid slug", () => {
		expect(() => createProduct({ slug: "Invalid Slug!" })).toThrow(DomainError);
	});

	it("publishes a draft product", () => {
		const product = createProduct({ status: "DRAFT" });

		product.publish();

		expect(product.getStatus()).toBe("PUBLISHED");
		expect(product.isAvailable()).toBe(true);
	});

	it("publishes a published product (idempotent)", () => {
		const product = createProduct({ status: "PUBLISHED" });

		product.publish();

		expect(product.getStatus()).toBe("PUBLISHED");
	});

	it("throws when trying to publish archived product", () => {
		const product = createProduct({ status: "ARCHIVED" });

		expect(() => product.publish()).toThrow(DomainError);
		try {
			product.publish();
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("CANNOT_PUBLISH_ARCHIVED");
			}
		}
	});

	it("archives a product", () => {
		const product = createProduct({ status: "PUBLISHED" });

		product.archive();

		expect(product.getStatus()).toBe("ARCHIVED");
		expect(product.isAvailable()).toBe(false);
	});

	it("drafts a published product", () => {
		const product = createProduct({ status: "PUBLISHED" });

		product.draft();

		expect(product.getStatus()).toBe("DRAFT");
		expect(product.isAvailable()).toBe(false);
	});

	it("throws when trying to draft archived product", () => {
		const product = createProduct({ status: "ARCHIVED" });

		expect(() => product.draft()).toThrow(DomainError);
		try {
			product.draft();
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("CANNOT_DRAFT_ARCHIVED");
			}
		}
	});

	it("isAvailable returns true only for published products", () => {
		const published = createProduct({ status: "PUBLISHED" });
		const draft = createProduct({ status: "DRAFT" });
		const archived = createProduct({ status: "ARCHIVED" });

		expect(published.isAvailable()).toBe(true);
		expect(draft.isAvailable()).toBe(false);
		expect(archived.isAvailable()).toBe(false);
	});

	it("updates slug via value object validation", () => {
		const product = createProduct({ slug: "old-slug" });

		product.updateSlug("new-slug");

		expect(product.getSlug()).toBe("new-slug");
	});

	it("throws when updating to invalid slug", () => {
		const product = createProduct({ slug: "valid-slug" });

		expect(() => product.updateSlug("Invalid Slug!")).toThrow(DomainError);
	});

	it("updates status successfully", () => {
		const product = createProduct({ status: "DRAFT" });

		product.updateStatus("PUBLISHED");

		expect(product.getStatus()).toBe("PUBLISHED");
	});

	it("throws when trying to update from archived to published directly", () => {
		const product = createProduct({ status: "ARCHIVED" });

		expect(() => product.updateStatus("PUBLISHED")).toThrow(DomainError);
		expect(() => product.updateStatus("PUBLISHED")).toThrow(
			"Cannot publish archived product. Must draft first.",
		);
	});

	it("allows updating from archived to draft", () => {
		const product = createProduct({ status: "ARCHIVED" });

		product.updateStatus("DRAFT");

		expect(product.getStatus()).toBe("DRAFT");
	});
});
