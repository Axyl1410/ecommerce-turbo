import { DomainError } from "@/shared/errors/domain.error";

/**
 * Price Value Object
 * Immutable value object representing a price
 */
export class Price {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new DomainError("Price cannot be negative", "INVALID_PRICE");
    }
  }

  /**
   * Create a Price from a number
   */
  static fromNumber(value: number): Price {
    return new Price(value);
  }

  /**
   * Get the numeric value
   */
  toNumber(): number {
    return this.value;
  }

  /**
   * Check if price is greater than another price
   */
  isGreaterThan(other: Price): boolean {
    return this.value > other.value;
  }

  /**
   * Check if price is less than another price
   */
  isLessThan(other: Price): boolean {
    return this.value < other.value;
  }

  /**
   * Calculate percentage difference
   */
  percentageDifference(other: Price): number {
    if (this.value === 0) return 0;
    return Math.abs((this.value - other.value) / this.value) * 100;
  }

  /**
   * Check if price difference is significant (more than 1% or 1000)
   */
  hasSignificantDifference(other: Price): boolean {
    const diff = Math.abs(this.value - other.value);
    return diff > 0.01 * this.value || diff > 1000;
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }
}

