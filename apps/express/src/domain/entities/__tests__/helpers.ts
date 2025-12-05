import { CartItem } from "@/domain/entities/cart-item.entity";
import type { ProductStatus } from "@/types/enums";

const defaultDate = new Date("2024-01-01T00:00:00.000Z");

export const testDates = {
	createdAt: defaultDate,
	updatedAt: defaultDate,
};

export const buildProductProps = (
	overrides?: Partial<{
		id: string;
		name: string;
		slug: string;
		description: string | null;
		brandId: string | null;
		categoryId: string | null;
		defaultImage: string | null;
		seoMetaTitle: string | null;
		seoMetaDesc: string | null;
		status: ProductStatus;
		createdAt: Date;
		updatedAt: Date;
	}>,
) => ({
	id: "prod-1",
	name: "Test Product",
	slug: "test-product",
	description: "Awesome product",
	brandId: "brand-1",
	categoryId: "cat-1",
	defaultImage: "https://example.com/image.png",
	seoMetaTitle: "Meta title",
	seoMetaDesc: "Meta desc",
	status: "DRAFT" as ProductStatus,
	createdAt: testDates.createdAt,
	updatedAt: testDates.updatedAt,
	...overrides,
});

export const buildCartItem = (
	overrides?: Partial<{
		id: string;
		cartId: string;
		variantId: string;
		quantity: number;
		priceAtAdd: number;
		createdAt: Date;
	}>,
) =>
	CartItem.create({
		id: "item-1",
		cartId: "cart-1",
		variantId: "variant-1",
		quantity: 2,
		priceAtAdd: 1999,
		createdAt: testDates.createdAt,
		...overrides,
	});
