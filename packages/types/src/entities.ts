import type { ProductStatus } from "./enums";

/**
 * Category Entity Type
 * Represents a category with business rules
 */
export type CategoryEntity = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	parentId: string | null;
	sortOrder: number | null;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Product Entity Type
 * Represents a product with business rules
 */
export type ProductEntity = {
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
};

/**
 * Cart Entity Type
 * Represents a shopping cart that can belong to a user or a guest session
 */
export type CartEntity = {
	id: string;
	userId: string | null;
	sessionId: string | null;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * CartItem Entity Type
 * Represents an item in a shopping cart
 */
export type CartItemEntity = {
	id: string;
	cartId: string;
	variantId: string;
	quantity: number;
	priceAtAdd: number;
	createdAt: Date;
};

