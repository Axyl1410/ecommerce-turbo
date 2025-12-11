import { DomainError } from "@/shared/errors/domain.error";
import { Slug } from "../value-objects/slug.vo";

/**
 * Category Entity
 * Domain entity representing a category with business rules
 */
export class Category {
	private constructor(
		public readonly id: string,
		public readonly name: string,
		private slug: Slug,
		public readonly description: string | null,
		public readonly imageUrl: string | null,
		public readonly parentId: string | null,
		public readonly sortOrder: number | null,
		private active: boolean,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	/**
	 * Create a new Category entity
	 */
	static create(
		id: string,
		name: string,
		slug: string,
		description: string | null,
		imageUrl: string | null,
		parentId: string | null,
		sortOrder: number | null,
		active: boolean,
		createdAt: Date,
		updatedAt: Date,
	): Category {
		return new Category(
			id,
			name,
			Slug.fromString(slug),
			description,
			imageUrl,
			parentId,
			sortOrder,
			active,
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
	 * Get active status
	 */
	isActive(): boolean {
		return this.active;
	}

	/**
	 * Activate the category
	 */
	activate(): void {
		this.active = true;
	}

	/**
	 * Deactivate the category
	 */
	deactivate(): void {
		this.active = false;
	}

	/**
	 * Update slug
	 */
	updateSlug(newSlug: string): void {
		this.slug = Slug.fromString(newSlug);
	}

	/**
	 * Update active status
	 */
	updateActive(newActive: boolean): void {
		this.active = newActive;
	}

	/**
	 * Check if category can be set as parent of another category
	 * Business rule: Cannot set itself as parent
	 */
	canBeParentOf(categoryId: string): boolean {
		return this.id !== categoryId;
	}

	/**
	 * Check if category is a descendant of another category
	 * This is used to prevent circular references
	 */
	isDescendantOf(categoryId: string, allCategories: Category[]): boolean {
		if (this.parentId === null) {
			return false;
		}

		if (this.parentId === categoryId) {
			return true;
		}

		const parent = allCategories.find((c) => c.id === this.parentId);
		if (!parent) {
			return false;
		}

		return parent.isDescendantOf(categoryId, allCategories);
	}
}


