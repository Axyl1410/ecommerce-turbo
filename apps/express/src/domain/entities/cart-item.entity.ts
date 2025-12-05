import { DomainError } from "@/shared/errors/domain.error";

/**
 * CartItem Entity
 * Encapsulates cart item rules (quantity, price snapshot)
 */
export class CartItem {
	private quantity: number;
	private priceAtAdd: number;

	private constructor(
		public readonly id: string,
		public readonly cartId: string,
		private readonly variantId: string,
		quantity: number,
		priceAtAdd: number,
		public readonly createdAt: Date,
	) {
		this.ensurePositiveQuantity(quantity);
		this.quantity = quantity;
		this.priceAtAdd = priceAtAdd;
	}

	static create(props: {
		id: string;
		cartId: string;
		variantId: string;
		quantity: number;
		priceAtAdd: number;
		createdAt: Date;
	}): CartItem {
		return new CartItem(
			props.id,
			props.cartId,
			props.variantId,
			props.quantity,
			props.priceAtAdd,
			props.createdAt,
		);
	}

	private ensurePositiveQuantity(quantity: number): void {
		if (quantity <= 0) {
			throw new DomainError("Quantity must be greater than 0", "INVALID_QTY");
		}
	}

	increaseQuantity(amount: number): void {
		const next = this.quantity + amount;
		this.ensurePositiveQuantity(next);
		this.quantity = next;
	}

	setQuantity(quantity: number): void {
		this.ensurePositiveQuantity(quantity);
		this.quantity = quantity;
	}

	getQuantity(): number {
		return this.quantity;
	}

	updatePriceSnapshot(price: number): void {
		if (price < 0) {
			throw new DomainError("Price must be non-negative", "INVALID_PRICE");
		}
		this.priceAtAdd = price;
	}

	getPriceSnapshot(): number {
		return this.priceAtAdd;
	}

	getVariantId(): string {
		return this.variantId;
	}

	toJSON(): {
		id: string;
		cartId: string;
		variantId: string;
		quantity: number;
		priceAtAdd: number;
		createdAt: Date;
	} {
		return {
			id: this.id,
			cartId: this.cartId,
			variantId: this.variantId,
			quantity: this.quantity,
			priceAtAdd: this.priceAtAdd,
			createdAt: this.createdAt,
		};
	}
}
