import type { CartItemRow, CartRow } from "../drizzle/type.js";

/**
 * Cart Output DTO
 */
export type CartDTO = CartRow;

/**
 * CartItem Output DTO
 */
// NOTE: Drizzle `decimal` columns infer as string by default.
// The API/domain currently uses `number` for money snapshots, so we normalize here.
export type CartItemDTO = Omit<CartItemRow, "priceAtAdd"> & {
	priceAtAdd: number;
};

/**
 * Cart Validation Issue DTO
 */
export interface CartValidationIssueDTO {
	itemId: string;
	variantId: string;
	issues: Array<{
		type: "stock" | "price" | "status";
		message: string;
	}>;
}

/**
 * Cart Item Validation DTO
 */
export interface CartItemValidationDTO {
	itemId: string;
	variantId: string;
	issues: Array<{
		type: "stock" | "price" | "status";
		message: string;
	}>;
}

/**
 * Cart with Items Output DTO
 */
export interface CartWithItemsDTO extends CartDTO {
	items: CartItemDTO[];
	validation?: {
		warnings: CartItemValidationDTO[];
		errors: CartItemValidationDTO[];
	};
}

/**
 * Get Cart Input DTO
 */
export interface GetCartInputDTO {
	userId?: string;
	sessionId?: string;
}

/**
 * Get Cart DTO
 */
export interface GetCartDTO {
	userId?: string;
	sessionId?: string;
}

/**
 * Add Cart Item Input DTO
 */
export interface AddCartItemDTO {
	cartId: string;
	variantId: string;
	quantity: number;
}

/**
 * Add Item DTO
 */
export interface AddItemDTO {
	cartId: string;
	variantId: string;
	quantity: number;
}

/**
 * Update Cart Item Input DTO
 */
export interface UpdateCartItemDTO {
	itemId: string;
	quantity: number;
}

/**
 * Remove Cart Item Input DTO
 */
export interface RemoveCartItemDTO {
	itemId: string;
}

/**
 * Clear Cart Input DTO
 */
export interface ClearCartDTO {
	cartId: string;
}

/**
 * Clear Cart After Order DTO
 */
export interface ClearCartAfterOrderDTO {
	userId?: string;
	sessionId?: string;
}
