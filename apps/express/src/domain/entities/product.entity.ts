import type { ProductStatus } from "@workspace/types";
import { DomainError } from "@/shared/errors/domain.error";
import { Price } from "../value-objects/price.vo";
import { Slug } from "../value-objects/slug.vo";

/**
 * Product Entity
 * Domain entity representing a product with business rules
 */
export class Product {
	private constructor(
		public readonly id: string,
		public readonly name: string,
		private slug: Slug,
		public readonly description: string | null,
		public readonly brandId: string | null,
		public readonly categoryId: string | null,
		public readonly defaultImage: string | null,
		public readonly seoMetaTitle: string | null,
		public readonly seoMetaDesc: string | null,
		private status: ProductStatus,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	/**
	 * Create a new Product entity
	 */
	static create(
		id: string,
		name: string,
		slug: string,
		description: string | null,
		brandId: string | null,
		categoryId: string | null,
		defaultImage: string | null,
		seoMetaTitle: string | null,
		seoMetaDesc: string | null,
		status: ProductStatus,
		createdAt: Date,
		updatedAt: Date,
	): Product {
		return new Product(
			id,
			name,
			Slug.fromString(slug),
			description,
			brandId,
			categoryId,
			defaultImage,
			seoMetaTitle,
			seoMetaDesc,
			status,
			createdAt,
			updatedAt,
		);
	}

	/**
	 * Get slug value
	 */
	getSlug(): string {
		return this.slug.toString();
	}

	/**
	 * Get status
	 */
	getStatus(): ProductStatus {
		return this.status;
	}

	/**
	 * Publish the product
	 * Business rule: Cannot publish archived products
	 */
	publish(): void {
		if (this.status === "ARCHIVED") {
			throw new DomainError(
				"Cannot publish archived product",
				"CANNOT_PUBLISH_ARCHIVED",
			);
		}
		this.status = "PUBLISHED";
	}

	/**
	 * Archive the product
	 */
	archive(): void {
		this.status = "ARCHIVED";
	}

	/**
	 * Draft the product
	 */
	draft(): void {
		if (this.status === "ARCHIVED") {
			throw new DomainError(
				"Cannot draft archived product",
				"CANNOT_DRAFT_ARCHIVED",
			);
		}
		this.status = "DRAFT";
	}

	/**
	 * Check if product is available (published)
	 */
	isAvailable(): boolean {
		return this.status === "PUBLISHED";
	}

	/**
	 * Update slug
	 */
	updateSlug(newSlug: string): void {
		this.slug = Slug.fromString(newSlug);
	}

	/**
	 * Update status
	 */
	updateStatus(newStatus: ProductStatus): void {
		// Business rule: Cannot change from archived to published directly
		if (this.status === "ARCHIVED" && newStatus === "PUBLISHED") {
			throw new DomainError(
				"Cannot publish archived product. Must draft first.",
				"CANNOT_PUBLISH_ARCHIVED",
			);
		}
		this.status = newStatus;
	}
}
