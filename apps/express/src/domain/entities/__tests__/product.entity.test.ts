import { Product } from "@/domain/entities/product.entity";
import { DomainError } from "@/shared/errors/domain.error";
import type { ProductStatus } from "@/types/enums";
import { buildProductProps } from "./helpers";

describe("Product Entity", () => {
  const createProduct = (overrides?: Partial<ReturnType<typeof buildProductProps>>) => {
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
      props.updatedAt
    );
  };

  it("creates a product with a slug value object", () => {
    const product = createProduct({ slug: "awesome-product" });

    expect(product.getSlug()).toBe("awesome-product");
    expect(product.getStatus()).toBe("DRAFT");
  });

  it("publishes a draft product", () => {
    const product = createProduct();

    product.publish();

    expect(product.getStatus()).toBe("PUBLISHED");
  });

  it("throws when publishing an archived product", () => {
    const product = createProduct({ status: "ARCHIVED" as ProductStatus });

    expect(() => product.publish()).toThrow(DomainError);
  });

  it("archives a product", () => {
    const product = createProduct();

    product.archive();

    expect(product.getStatus()).toBe("ARCHIVED");
  });

  it("sets product back to draft from published", () => {
    const product = createProduct({ status: "PUBLISHED" as ProductStatus });

    product.draft();

    expect(product.getStatus()).toBe("DRAFT");
  });

  it("throws when drafting an archived product", () => {
    const product = createProduct({ status: "ARCHIVED" as ProductStatus });

    expect(() => product.draft()).toThrow(DomainError);
  });

  it("updates slug via value object validation", () => {
    const product = createProduct({ slug: "old-slug" });

    product.updateSlug("new-slug");

    expect(product.getSlug()).toBe("new-slug");
  });

  it("prevents archived to published transition via updateStatus", () => {
    const product = createProduct({ status: "ARCHIVED" as ProductStatus });

    expect(() => product.updateStatus("PUBLISHED")).toThrow(DomainError);
  });

  it("allows other status transitions through updateStatus", () => {
    const product = createProduct({ status: "DRAFT" as ProductStatus });

    product.updateStatus("ARCHIVED");

    expect(product.getStatus()).toBe("ARCHIVED");
  });
});


