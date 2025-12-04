import { CartItem } from "@/domain/entities/cart-item.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { buildCartItem, testDates } from "./helpers";

describe("CartItem Entity", () => {
  const createItem = (overrides?: Parameters<typeof buildCartItem>[0]) => buildCartItem(overrides);

  it("creates a cart item with positive quantity and price", () => {
    const item = createItem({ quantity: 5, priceAtAdd: 1000 });

    expect(item.getQuantity()).toBe(5);
    expect(item.getPriceSnapshot()).toBe(1000);
    expect(item.getVariantId()).toBe("variant-1");
  });

  it("throws when created with non-positive quantity", () => {
    expect(() =>
      CartItem.create({
        id: "bad-item",
        cartId: "cart-1",
        variantId: "variant-1",
        quantity: 0,
        priceAtAdd: 1000,
        createdAt: testDates.createdAt,
      })
    ).toThrow(DomainError);
  });

  it("throws when updatePriceSnapshot receives negative value", () => {
    const item = createItem();

    expect(() => item.updatePriceSnapshot(-1)).toThrow(DomainError);
  });

  it("increases quantity by amount and enforces positive total", () => {
    const item = createItem({ quantity: 2 });

    item.increaseQuantity(3);

    expect(item.getQuantity()).toBe(5);
  });

  it("throws if setQuantity receives zero or negative number", () => {
    const item = createItem({ quantity: 2 });

    expect(() => item.setQuantity(0)).toThrow(DomainError);
  });

  it("serializes internal state via toJSON", () => {
    const item = createItem({ id: "json-item", variantId: "variant-json", quantity: 7 });

    expect(item.toJSON()).toEqual({
      id: "json-item",
      cartId: "cart-1",
      variantId: "variant-json",
      quantity: 7,
      priceAtAdd: 1999,
      createdAt: testDates.createdAt,
    });
  });
});


