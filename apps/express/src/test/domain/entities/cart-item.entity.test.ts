import { CartItem } from "@/domain/entities/cart-item.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { testDates } from "./helpers";

describe("CartItem Entity", () => {
	const createCartItem = (overrides?: {
		id?: string;
		cartId?: string;
		variantId?: string;
		quantity?: number;
		priceAtAdd?: number;
		createdAt?: Date;
	}) =>
		CartItem.create({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceAtAdd: 1999,
			createdAt: testDates.createdAt,
			...overrides,
		});

	it("creates a cart item with valid data", () => {
		const item = createCartItem();

		expect(item.getQuantity()).toBe(2);
		expect(item.getPriceSnapshot()).toBe(1999);
		expect(item.getVariantId()).toBe("variant-1");
	});

	it("throws when creating cart item with zero quantity", () => {
		expect(() => createCartItem({ quantity: 0 })).toThrow(DomainError);
		try {
			createCartItem({ quantity: 0 });
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_QTY");
			}
		}
	});

	it("throws when creating cart item with negative quantity", () => {
		expect(() => createCartItem({ quantity: -1 })).toThrow(DomainError);
		try {
			createCartItem({ quantity: -1 });
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_QTY");
			}
		}
	});

	it("increases quantity successfully", () => {
		const item = createCartItem({ quantity: 2 });

		item.increaseQuantity(3);

		expect(item.getQuantity()).toBe(5);
	});

	it("throws when increasing quantity results in zero or negative", () => {
		const item = createCartItem({ quantity: 2 });

		expect(() => item.increaseQuantity(-2)).toThrow(DomainError);
		expect(() => item.increaseQuantity(-3)).toThrow(DomainError);
	});

	it("sets quantity successfully", () => {
		const item = createCartItem({ quantity: 2 });

		item.setQuantity(5);

		expect(item.getQuantity()).toBe(5);
	});

	it("throws when setting quantity to zero or negative", () => {
		const item = createCartItem({ quantity: 2 });

		expect(() => item.setQuantity(0)).toThrow(DomainError);
		expect(() => item.setQuantity(-1)).toThrow(DomainError);
	});

	it("updates price snapshot successfully", () => {
		const item = createCartItem({ priceAtAdd: 1000 });

		item.updatePriceSnapshot(2000);

		expect(item.getPriceSnapshot()).toBe(2000);
	});

	it("allows zero price", () => {
		const item = createCartItem({ priceAtAdd: 1000 });

		item.updatePriceSnapshot(0);

		expect(item.getPriceSnapshot()).toBe(0);
	});

	it("throws when updating price snapshot to negative", () => {
		const item = createCartItem({ priceAtAdd: 1000 });

		expect(() => item.updatePriceSnapshot(-100)).toThrow(DomainError);
		try {
			item.updatePriceSnapshot(-100);
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_PRICE");
			}
		}
	});

	it("toJSON returns correct structure", () => {
		const item = createCartItem({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceAtAdd: 1999,
		});

		const json = item.toJSON();

		expect(json).toEqual({
			id: "item-1",
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceAtAdd: 1999,
			createdAt: testDates.createdAt,
		});
	});
});
