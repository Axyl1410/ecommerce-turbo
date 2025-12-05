/**
 * Application Error
 * Base error class for application layer errors
 */
export class ApplicationError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly statusCode: number = 500,
	) {
		super(message);
		this.name = "ApplicationError";
		Object.setPrototypeOf(this, ApplicationError.prototype);
	}
}
