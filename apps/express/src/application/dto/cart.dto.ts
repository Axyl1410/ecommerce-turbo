export interface CartDTO {
	id: string;
	userId: string | null;
	sessionId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CartItemDTO {
	id: string;
	cartId: string;
	variantId: string;
	quantity: number;
	priceAtAdd: number;
	createdAt: Date;
}

export interface CartValidationIssueDTO {
	itemId: string;
	variantId: string;
	issues: Array<{
		type: "stock" | "price" | "status";
		message: string;
	}>;
}

export interface CartWithItemsDTO extends CartDTO {
	items: CartItemDTO[];
	validation?: {
		warnings: CartValidationIssueDTO[];
		errors: CartValidationIssueDTO[];
	};
}

export interface GetCartInputDTO {
	userId?: string;
	sessionId?: string;
}

export interface AddCartItemDTO {
	cartId: string;
	variantId: string;
	quantity: number;
}

export interface UpdateCartItemDTO {
	itemId: string;
	quantity: number;
}

export interface RemoveCartItemDTO {
	itemId: string;
}

export interface ClearCartDTO {
	cartId: string;
}
export interface GetCartDTO {
	userId?: string;
	sessionId?: string;
}

export interface CartDTO {
	id: string;
	userId: string | null;
	sessionId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CartItemDTO {
	id: string;
	cartId: string;
	variantId: string;
	quantity: number;
	priceAtAdd: number;
	createdAt: Date;
}

export interface CartWithItemsDTO extends CartDTO {
	items: CartItemDTO[];
	validation?: {
		warnings: CartItemValidationDTO[];
		errors: CartItemValidationDTO[];
	};
}

export interface CartItemValidationDTO {
	itemId: string;
	variantId: string;
	issues: Array<{
		type: "stock" | "price" | "status";
		message: string;
	}>;
}

export interface AddItemDTO {
	cartId: string;
	variantId: string;
	quantity: number;
}

export interface UpdateCartItemDTO {
	itemId: string;
	quantity: number;
}

export interface RemoveCartItemDTO {
	itemId: string;
}

export interface ClearCartDTO {
	cartId: string;
}

export interface ClearCartAfterOrderDTO {
	userId?: string;
	sessionId?: string;
}
