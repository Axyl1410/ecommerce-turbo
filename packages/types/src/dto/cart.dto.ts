/**
 * Cart Output DTO
 */
export interface CartDTO {
	id: string;
	userId: string | null;
	sessionId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * CartItem Output DTO
 */
export interface CartItemDTO {
	id: string;
	cartId: string;
	variantId: string;
	quantity: number;
	priceAtAdd: number;
	createdAt: Date;
}

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

