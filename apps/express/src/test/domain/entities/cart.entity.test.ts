import { Cart } from "@/domain/entities/cart.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { buildCartItem, testDates } from "./helpers";

describe("Cart Entity", () => {
	it("creates a cart with userId", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		expect(cart.getUserId()).toBe("user-1");
		expect(cart.getSessionId()).toBe(null);
		expect(cart.getItems()).toEqual([]);
	});

	it("creates a cart with sessionId", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: null,
			sessionId: "session-1",
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		expect(cart.getUserId()).toBe(null);
		expect(cart.getSessionId()).toBe("session-1");
		expect(cart.getItems()).toEqual([]);
	});

	it("throws when creating cart without userId and sessionId", () => {
		expect(() =>
			Cart.create({
				id: "cart-1",
				userId: null,
				sessionId: null,
				createdAt: testDates.createdAt,
				updatedAt: testDates.updatedAt,
			}),
		).toThrow(DomainError);

		try {
			Cart.create({
				id: "cart-1",
				userId: null,
				sessionId: null,
				createdAt: testDates.createdAt,
				updatedAt: testDates.updatedAt,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(DomainError);
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_CART_OWNER");
			}
		}
	});

	it("assigns cart to user", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: null,
			sessionId: "session-1",
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cart.assignToUser("user-1");

		expect(cart.getUserId()).toBe("user-1");
		expect(cart.getSessionId()).toBe(null);
	});

	it("throws when assigning to user with empty userId", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		expect(() => cart.assignToUser("")).toThrow(DomainError);
		try {
			cart.assignToUser("");
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_USER");
			}
		}
	});

	it("assigns cart to session", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		cart.assignToSession("session-1");

		expect(cart.getUserId()).toBe(null);
		expect(cart.getSessionId()).toBe("session-1");
	});

	it("throws when assigning to session with empty sessionId", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		expect(() => cart.assignToSession("")).toThrow(DomainError);
		try {
			cart.assignToSession("");
		} catch (error) {
			if (error instanceof DomainError) {
				expect(error.code).toBe("INVALID_SESSION");
			}
		}
	});

	it("adds new item to cart", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
		});

		cart.addItem(item);

		expect(cart.getItems()).toHaveLength(1);
		expect(cart.getItems()[0]?.getVariantId()).toBe("variant-1");
		expect(cart.getItems()[0]?.getQuantity()).toBe(2);
	});

	it("merges existing item when adding same variant", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item1 = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 2,
			priceAtAdd: 1000,
		});

		const item2 = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
			quantity: 3,
			priceAtAdd: 1200,
		});

		cart.addItem(item1);
		cart.addItem(item2);

		expect(cart.getItems()).toHaveLength(1);
		expect(cart.getItems()[0]?.getQuantity()).toBe(5);
		expect(cart.getItems()[0]?.getPriceSnapshot()).toBe(1200);
	});

	it("replaces all items in cart", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item1 = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
		});

		const item2 = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-2",
		});

		cart.addItem(item1);
		cart.replaceItems([item2]);

		expect(cart.getItems()).toHaveLength(1);
		expect(cart.getItems()[0]?.getVariantId()).toBe("variant-2");
	});

	it("toJSON returns correct structure", () => {
		const cart = Cart.create({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});

		const item = buildCartItem({
			cartId: "cart-1",
			variantId: "variant-1",
		});

		cart.addItem(item);

		const json = cart.toJSON();

		expect(json).toMatchObject({
			id: "cart-1",
			userId: "user-1",
			sessionId: null,
			createdAt: testDates.createdAt,
			updatedAt: testDates.updatedAt,
		});
		expect(json.items).toHaveLength(1);
		expect(json.items[0]?.variantId).toBe("variant-1");
	});
});
