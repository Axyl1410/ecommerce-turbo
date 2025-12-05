import { Cart } from "@/domain/entities/cart.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { buildCartItem, testDates } from "./helpers";

const createCart = (
	overrides?: Partial<{ userId: string | null; sessionId: string | null }>,
) =>
	Cart.create({
		id: "cart-1",
		userId: "user-1",
		sessionId: null,
		createdAt: testDates.createdAt,
		updatedAt: testDates.updatedAt,
		...overrides,
	});

describe("Cart Entity", () => {
	it("requires either userId or sessionId", () => {
		expect(() =>
			Cart.create({
				id: "cart-invalid",
				userId: null,
				sessionId: null,
				createdAt: testDates.createdAt,
				updatedAt: testDates.updatedAt,
			}),
		).toThrow(DomainError);
	});

	it("assigns cart to a user and clears session", () => {
		const cart = createCart({ sessionId: "guest-session", userId: null });

		cart.assignToUser("user-99");

		expect(cart.getUserId()).toBe("user-99");
		expect(cart.getSessionId()).toBeNull();
	});

	it("throws when assigning user with empty id", () => {
		const cart = createCart();

		expect(() => cart.assignToUser("")).toThrow(DomainError);
	});

	it("assigns cart to a guest session and clears user", () => {
		const cart = createCart();

		cart.assignToSession("session-123");

		expect(cart.getSessionId()).toBe("session-123");
		expect(cart.getUserId()).toBeNull();
	});

	it("throws when assigning session with empty id", () => {
		const cart = createCart({ sessionId: "session-123", userId: null });

		expect(() => cart.assignToSession("")).toThrow(DomainError);
	});

	it("adds a new item to the cart", () => {
		const cart = createCart();
		const newItem = buildCartItem({ variantId: "variant-new" });

		cart.addItem(newItem);

		expect(cart.getItems()).toHaveLength(1);
		const [stored] = cart.getItems();
		expect(stored?.getVariantId()).toBe("variant-new");
	});

	it("merges quantities when adding duplicate variants", () => {
		const cart = createCart();
		const existing = buildCartItem({ variantId: "variant-dup", quantity: 1 });
		const duplicate = buildCartItem({
			variantId: "variant-dup",
			quantity: 3,
			priceAtAdd: 2999,
		});

		cart.addItem(existing);
		cart.addItem(duplicate);

		const [item] = cart.getItems();
		expect(item?.getQuantity()).toBe(4);
		expect(item?.getPriceSnapshot()).toBe(2999);
	});

	it("replaces items array", () => {
		const cart = createCart();
		const first = buildCartItem({ variantId: "variant-1" });
		const second = buildCartItem({ id: "item-2", variantId: "variant-2" });

		cart.addItem(first);
		cart.replaceItems([second]);

		expect(cart.getItems()).toHaveLength(1);
		const [stored] = cart.getItems();
		expect(stored?.getVariantId()).toBe("variant-2");
	});
});
