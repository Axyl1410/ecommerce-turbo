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
export * from "./drizzle/schema.js";
export * from "./dto/cart.dto.js";
// DTOs
export * from "./dto/category.dto.js";
export * from "./dto/product.dto.js";
// Entities
export * from "./entities.js";
// Enums - re-export with explicit aliases to avoid name clashes with Drizzle enums
//todo remove this later after migration to drizzle
export {
	CouponType as CouponTypeEnum,
	type CouponType as CouponTypeEnumType,
	OrderStatus as OrderStatusEnum,
	type OrderStatus as OrderStatusEnumType,
	PaymentStatus as PaymentStatusEnum,
	type PaymentStatus as PaymentStatusEnumType,
	ProductStatus as ProductStatusEnum,
	type ProductStatus as ProductStatusEnumType,
	ReviewStatus as ReviewStatusEnum,
	type ReviewStatus as ReviewStatusEnumType,
} from "./enums.js";
// Request Parameters
export * from "./params.js";
