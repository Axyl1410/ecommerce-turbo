// ==================== Type Exports ====================
// Infer types from Drizzle tables for use in application code

import type {
	Account,
	Address,
	Brand,
	Cart,
	CartItem,
	Category,
	Coupon,
	Order,
	OrderItem,
	Product,
	ProductImage,
	ProductVariant,
	Review,
	Tag,
	User,
	WishlistItem,
} from "./schema.js";

export type UserRow = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;

export type AccountRow = typeof Account.$inferSelect;
export type AccountInsert = typeof Account.$inferInsert;

export type CategoryRow = typeof Category.$inferSelect;
export type CategoryInsert = typeof Category.$inferInsert;

export type ProductRow = typeof Product.$inferSelect;
export type ProductInsert = typeof Product.$inferInsert;

export type ProductVariantRow = typeof ProductVariant.$inferSelect;
export type ProductVariantInsert = typeof ProductVariant.$inferInsert;

export type ProductImageRow = typeof ProductImage.$inferSelect;
export type ProductImageInsert = typeof ProductImage.$inferInsert;

export type BrandRow = typeof Brand.$inferSelect;
export type BrandInsert = typeof Brand.$inferInsert;

export type CartRow = typeof Cart.$inferSelect;
export type CartInsert = typeof Cart.$inferInsert;

export type CartItemRow = typeof CartItem.$inferSelect;
export type CartItemInsert = typeof CartItem.$inferInsert;

export type OrderRow = typeof Order.$inferSelect;
export type OrderInsert = typeof Order.$inferInsert;

export type OrderItemRow = typeof OrderItem.$inferSelect;
export type OrderItemInsert = typeof OrderItem.$inferInsert;

export type ReviewRow = typeof Review.$inferSelect;
export type ReviewInsert = typeof Review.$inferInsert;

export type CouponRow = typeof Coupon.$inferSelect;
export type CouponInsert = typeof Coupon.$inferInsert;

export type WishlistItemRow = typeof WishlistItem.$inferSelect;
export type WishlistItemInsert = typeof WishlistItem.$inferInsert;

export type AddressRow = typeof Address.$inferSelect;
export type AddressInsert = typeof Address.$inferInsert;

export type TagRow = typeof Tag.$inferSelect;
export type TagInsert = typeof Tag.$inferInsert;
