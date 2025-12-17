import { Slug } from "../value-objects/slug.vo";

/**
 * Brand Entity
 * Simple domain entity representing a product brand
 */
export class Brand {
	private constructor(
		public readonly id: string,
		public readonly name: string,
		private slug: Slug,
		public readonly description: string | null,
		public readonly logoUrl: string | null,
		private active: boolean,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	/**
	 * Create a new Brand entity
	 */
	static create(
		id: string,
		name: string,
		slug: string,
		description: string | null,
		logoUrl: string | null,
		active: boolean,
		createdAt: Date,
		updatedAt: Date,
	): Brand {
		return new Brand(
			id,
			name,
			Slug.fromString(slug),
			description,
			logoUrl,
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
	 * Activate brand
	 */
	activate(): void {
		this.active = true;
	}

	/**
	 * Deactivate brand
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
}




