/**
 * Domain Error
 * Base error class for domain layer violations
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

