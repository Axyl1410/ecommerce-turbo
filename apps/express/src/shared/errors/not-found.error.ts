import { ApplicationError } from "./application.error";

/**
 * Not Found Error
 * Error thrown when a resource is not found
 */
export class NotFoundError extends ApplicationError {
	constructor(resource: string, identifier?: string) {
		const message = identifier
			? `${resource} with identifier '${identifier}' not found`
			: `${resource} not found`;
		super(message, "NOT_FOUND", 404);
		this.name = "NotFoundError";
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
