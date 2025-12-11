// Common types
export type ApiResponse<T> = {
	status: number | string;
	message: string;
	data: T;
	errorCode?: string;
};

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
};

// Enums
export * from "./enums";

// Entities
export * from "./entities";

// DTOs
export * from "./dto/category.dto";
export * from "./dto/product.dto";
export * from "./dto/cart.dto";

// Request Parameters
export * from "./params";

// Request Bodies
export * from "./body";
