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

// Request Bodies
export * from "./body.js";
export * from "./dto/cart.dto.js";

// DTOs
export * from "./dto/category.dto.js";
export * from "./dto/product.dto.js";
// Entities
export * from "./entities.js";
// Enums
export * from "./enums.js";
// Request Parameters
export * from "./params.js";
