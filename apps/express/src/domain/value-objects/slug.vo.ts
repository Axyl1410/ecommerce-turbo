import { DomainError } from "@/shared/errors/domain.error";

/**
 * Slug Value Object
 * Immutable value object representing a URL-friendly slug
 */
export class Slug {
  private constructor(private readonly value: string) {
    // Validate slug format: lowercase letters, numbers, hyphens, underscores
    if (!/^[a-z0-9-_]+$/.test(value)) {
      throw new DomainError(
        "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
        "INVALID_SLUG"
      );
    }
  }

  /**
   * Create a Slug from a string
   */
  static fromString(value: string): Slug {
    return new Slug(value);
  }

  /**
   * Get the string value
   */
  toString(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}

