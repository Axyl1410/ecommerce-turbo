import { z } from "zod";

export const cartAddItemBodySchema = z.object({
  variantId: z.string().min(1, "variantId is required and must be a string"),
  quantity: z
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be a positive number"),
});

export const cartUpdateItemParamsSchema = z.object({
  itemId: z.string().min(1, "itemId is required and must be a string"),
});

export const cartUpdateItemBodySchema = z.object({
  quantity: z
    .number()
    .int("quantity must be an integer")
    .nonnegative("quantity must be zero or a positive number"),
});

export const cartRemoveItemParamsSchema = z.object({
  itemId: z.string().min(1, "itemId is required and must be a string"),
});

