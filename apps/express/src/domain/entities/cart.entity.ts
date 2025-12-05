import { DomainError } from "@/shared/errors/domain.error";
import type { CartItem } from "./cart-item.entity";

/**
 * Cart Entity
 * Represents a shopping cart that can belong to a user or a guest session.
 */
export class Cart {
	private items: CartItem[];

	private constructor(
		public readonly id: string,
		private userId: string | null,
		private sessionId: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date,
		items: CartItem[],
	) {
		if (!userId && !sessionId) {
			throw new DomainError(
				"Cart must have either userId or sessionId",
				"INVALID_CART_OWNER",
			);
		}
		this.items = items;
	}

	static create(props: {
		id: string;
		userId: string | null;
		sessionId: string | null;
		createdAt: Date;
		updatedAt: Date;
		items?: CartItem[];
	}): Cart {
		return new Cart(
			props.id,
			props.userId,
			props.sessionId,
			props.createdAt,
			props.updatedAt,
			props.items ?? [],
		);
	}

	getUserId(): string | null {
		return this.userId;
	}

	getSessionId(): string | null {
		return this.sessionId;
	}

	getItems(): CartItem[] {
		return this.items;
	}

	assignToUser(userId: string): void {
		if (!userId) {
			throw new DomainError("User ID must be provided", "INVALID_USER");
		}
		this.userId = userId;
		this.sessionId = null;
	}

	assignToSession(sessionId: string): void {
		if (!sessionId) {
			throw new DomainError("Session ID must be provided", "INVALID_SESSION");
		}
		this.sessionId = sessionId;
		this.userId = null;
	}

	addItem(item: CartItem): void {
		const existing = this.items.find(
			(current) => current.getVariantId() === item.getVariantId(),
		);
		if (!existing) {
			this.items.push(item);
			return;
		}
		existing.increaseQuantity(item.getQuantity());
		existing.updatePriceSnapshot(item.getPriceSnapshot());
	}

	replaceItems(items: CartItem[]): void {
		this.items = items;
	}

	toJSON(): {
		id: string;
		userId: string | null;
		sessionId: string | null;
		items: ReturnType<CartItem["toJSON"]>[];
		createdAt: Date;
		updatedAt: Date;
	} {
		return {
			id: this.id,
			userId: this.userId,
			sessionId: this.sessionId,
			items: this.items.map((item) => item.toJSON()),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
