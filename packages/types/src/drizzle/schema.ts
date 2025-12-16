import { relations, sql } from "drizzle-orm";
import {
	boolean,
	decimal,
	doublePrecision,
	foreignKey,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const ProductStatus = pgEnum("ProductStatus", [
	"DRAFT",
	"PUBLISHED",
	"ARCHIVED",
]);

export const PaymentStatus = pgEnum("PaymentStatus", [
	"PENDING",
	"PAID",
	"FAILED",
	"REFUNDED",
	"PARTIALLY_REFUNDED",
]);

export const OrderStatus = pgEnum("OrderStatus", [
	"PENDING",
	"CONFIRMED",
	"PROCESSING",
	"SHIPPED",
	"DELIVERED",
	"CANCELLED",
	"RETURNED",
	"REFUNDED",
]);

export const ReviewStatus = pgEnum("ReviewStatus", [
	"PENDING",
	"APPROVED",
	"REJECTED",
]);

export const CouponType = pgEnum("CouponType", [
	"PERCENT",
	"FIXED",
	"FREE_SHIPPING",
]);

export const User = pgTable(
	"user",
	{
		id: text("id").notNull().primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("emailVerified").notNull(),
		image: text("image"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
		role: text("role"),
		banned: boolean("banned"),
		banReason: text("banReason"),
		banExpires: timestamp("banExpires", { precision: 3 }),
	},
	(User) => ({
		User_email_unique_idx: uniqueIndex("User_email_key").on(User.email),
	}),
);

export const Session = pgTable(
	"session",
	{
		id: text("id").notNull().primaryKey(),
		expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
		ipAddress: text("ipAddress"),
		userAgent: text("userAgent"),
		userId: text("userId").notNull(),
		impersonatedBy: text("impersonatedBy"),
	},
	(Session) => ({
		session_user_fkey: foreignKey({
			name: "session_user_fkey",
			columns: [Session.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		Session_token_unique_idx: uniqueIndex("Session_token_key").on(
			Session.token,
		),
	}),
);

export const Account = pgTable(
	"account",
	{
		id: text("id").notNull().primaryKey(),
		accountId: text("accountId").notNull(),
		providerId: text("providerId").notNull(),
		userId: text("userId").notNull(),
		accessToken: text("accessToken"),
		refreshToken: text("refreshToken"),
		idToken: text("idToken"),
		accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { precision: 3 }),
		refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { precision: 3 }),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
	},
	(Account) => ({
		account_user_fkey: foreignKey({
			name: "account_user_fkey",
			columns: [Account.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const Verification = pgTable("verification", {
	id: text("id").notNull().primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
	createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const Address = pgTable(
	"address",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		userId: text("userId").notNull(),
		name: text("name").notNull(),
		phone: text("phone").notNull(),
		addressLine: text("addressLine").notNull(),
		city: text("city").notNull(),
		district: text("district").notNull(),
		province: text("province").notNull(),
		postalCode: text("postalCode"),
		isDefault: boolean("isDefault").notNull(),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(Address) => ({
		address_user_fkey: foreignKey({
			name: "address_user_fkey",
			columns: [Address.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const Category = pgTable(
	"category",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		imageUrl: text("imageUrl"),
		parentId: text("parentId"),
		sortOrder: integer("sortOrder"),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
	},
	(Category) => ({
		category_parent_fkey: foreignKey({
			name: "category_parent_fkey",
			columns: [Category.parentId],
			foreignColumns: [Category.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const Brand = pgTable("brand", {
	id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	logoUrl: text("logoUrl"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
});

export const Product = pgTable(
	"product",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		brandId: text("brandId"),
		categoryId: text("categoryId"),
		defaultImage: text("defaultImage"),
		seoMetaTitle: text("seoMetaTitle"),
		seoMetaDesc: text("seoMetaDesc"),
		status: ProductStatus("status").notNull().default("DRAFT"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
	},
	(Product) => ({
		product_brand_fkey: foreignKey({
			name: "product_brand_fkey",
			columns: [Product.brandId],
			foreignColumns: [Brand.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
		product_category_fkey: foreignKey({
			name: "product_category_fkey",
			columns: [Product.categoryId],
			foreignColumns: [Category.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const ProductVariant = pgTable(
	"product_variant",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		productId: text("productId").notNull(),
		sku: text("sku").unique(),
		attributes: jsonb("attributes"),
		price: decimal("price", { precision: 65, scale: 30 }).notNull(),
		salePrice: decimal("salePrice", { precision: 65, scale: 30 }),
		stockQuantity: integer("stockQuantity").notNull(),
		weight: doublePrecision("weight"),
		barcode: text("barcode"),
	},
	(ProductVariant) => ({
		product_variant_product_fkey: foreignKey({
			name: "product_variant_product_fkey",
			columns: [ProductVariant.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const ProductImage = pgTable(
	"product_image",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		productId: text("productId").notNull(),
		variantId: text("variantId"),
		url: text("url").notNull(),
		altText: text("altText"),
		sortOrder: integer("sortOrder"),
	},
	(ProductImage) => ({
		product_image_product_fkey: foreignKey({
			name: "product_image_product_fkey",
			columns: [ProductImage.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		product_image_variant_fkey: foreignKey({
			name: "product_image_variant_fkey",
			columns: [ProductImage.variantId],
			foreignColumns: [ProductVariant.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const Tag = pgTable("tag", {
	id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
});

export const ProductTag = pgTable(
	"product_tag",
	{
		productId: text("productId").notNull(),
		tagId: text("tagId").notNull(),
	},
	(ProductTag) => ({
		product_tag_product_fkey: foreignKey({
			name: "product_tag_product_fkey",
			columns: [ProductTag.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		product_tag_tag_fkey: foreignKey({
			name: "product_tag_tag_fkey",
			columns: [ProductTag.tagId],
			foreignColumns: [Tag.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		ProductTag_cpk: primaryKey({
			name: "ProductTag_cpk",
			columns: [ProductTag.productId, ProductTag.tagId],
		}),
	}),
);

export const Cart = pgTable(
	"cart",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		userId: text("userId").unique(),
		sessionId: text("sessionId").unique(),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
	},
	(Cart) => ({
		cart_user_fkey: foreignKey({
			name: "cart_user_fkey",
			columns: [Cart.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const CartItem = pgTable(
	"cart_item",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		cartId: text("cartId").notNull(),
		variantId: text("variantId").notNull(),
		quantity: integer("quantity").notNull(),
		priceAtAdd: decimal("priceAtAdd", { precision: 65, scale: 30 }).notNull(),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(CartItem) => ({
		cart_item_cart_fkey: foreignKey({
			name: "cart_item_cart_fkey",
			columns: [CartItem.cartId],
			foreignColumns: [Cart.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		cart_item_variant_fkey: foreignKey({
			name: "cart_item_variant_fkey",
			columns: [CartItem.variantId],
			foreignColumns: [ProductVariant.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const Order = pgTable(
	"order",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		orderNo: text("orderNo").notNull().unique().default(sql`uuid(4)`),
		userId: text("userId").notNull(),
		totalAmount: decimal("totalAmount", { precision: 65, scale: 30 }).notNull(),
		shippingFee: decimal("shippingFee", { precision: 65, scale: 30 }).notNull(),
		discountAmount: decimal("discountAmount", {
			precision: 65,
			scale: 30,
		}).notNull(),
		finalAmount: decimal("finalAmount", { precision: 65, scale: 30 }).notNull(),
		payStatus: PaymentStatus("payStatus").notNull().default("PENDING"),
		orderStatus: OrderStatus("orderStatus").notNull().default("PENDING"),
		paymentMethod: text("paymentMethod"),
		shippingAddress: jsonb("shippingAddress").notNull(),
		notes: text("notes"),
		adminNotes: text("adminNotes"),
		trackingNumber: text("trackingNumber"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
		updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
		couponId: text("couponId"),
		appliedCouponCode: text("appliedCouponCode"),
	},
	(Order) => ({
		order_user_fkey: foreignKey({
			name: "order_user_fkey",
			columns: [Order.userId],
			foreignColumns: [User.id],
		})
			.onDelete("restrict")
			.onUpdate("cascade"),
		order_coupon_fkey: foreignKey({
			name: "order_coupon_fkey",
			columns: [Order.couponId],
			foreignColumns: [Coupon.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const OrderItem = pgTable(
	"order_item",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		orderId: text("orderId").notNull(),
		variantId: text("variantId").notNull(),
		productName: text("productName").notNull(),
		variantAttributes: jsonb("variantAttributes"),
		unitPrice: decimal("unitPrice", { precision: 65, scale: 30 }).notNull(),
		quantity: integer("quantity").notNull(),
		subtotal: decimal("subtotal", { precision: 65, scale: 30 }).notNull(),
	},
	(OrderItem) => ({
		order_item_order_fkey: foreignKey({
			name: "order_item_order_fkey",
			columns: [OrderItem.orderId],
			foreignColumns: [Order.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		order_item_variant_fkey: foreignKey({
			name: "order_item_variant_fkey",
			columns: [OrderItem.variantId],
			foreignColumns: [ProductVariant.id],
		})
			.onDelete("restrict")
			.onUpdate("cascade"),
	}),
);

export const Payment = pgTable(
	"payment",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		orderId: text("orderId").notNull(),
		provider: text("provider").notNull(),
		status: text("status").notNull(),
		amount: decimal("amount", { precision: 65, scale: 30 }).notNull(),
		providerTxnId: text("providerTxnId"),
		metadata: jsonb("metadata"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(Payment) => ({
		payment_order_fkey: foreignKey({
			name: "payment_order_fkey",
			columns: [Payment.orderId],
			foreignColumns: [Order.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const OrderStatusHistory = pgTable(
	"order_status_history",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		orderId: text("orderId").notNull(),
		status: OrderStatus("status").notNull(),
		notes: text("notes"),
		changedBy: text("changedBy"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(OrderStatusHistory) => ({
		order_status_history_order_fkey: foreignKey({
			name: "order_status_history_order_fkey",
			columns: [OrderStatusHistory.orderId],
			foreignColumns: [Order.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	}),
);

export const Review = pgTable(
	"review",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		productId: text("productId").notNull(),
		userId: text("userId").notNull(),
		orderItemId: text("orderItemId").unique(),
		rating: integer("rating").notNull(),
		title: text("title"),
		body: text("body"),
		status: ReviewStatus("status").notNull().default("PENDING"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(Review) => ({
		review_product_fkey: foreignKey({
			name: "review_product_fkey",
			columns: [Review.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		review_user_fkey: foreignKey({
			name: "review_user_fkey",
			columns: [Review.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		review_orderItem_fkey: foreignKey({
			name: "review_orderItem_fkey",
			columns: [Review.orderItemId],
			foreignColumns: [OrderItem.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const Coupon = pgTable("coupon", {
	id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
	code: text("code").notNull().unique(),
	type: CouponType("type").notNull(),
	value: decimal("value", { precision: 65, scale: 30 }).notNull(),
	description: text("description"),
	minOrderAmount: decimal("minOrderAmount", { precision: 65, scale: 30 }),
	startsAt: timestamp("startsAt", { precision: 3 }).notNull(),
	endsAt: timestamp("endsAt", { precision: 3 }).notNull(),
	usageLimit: integer("usageLimit"),
	usedCount: integer("usedCount").notNull(),
	usageLimitPerUser: integer("usageLimitPerUser").default(1),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

export const CouponApplicableProduct = pgTable(
	"coupon_applicable_product",
	{
		couponId: text("couponId").notNull(),
		productId: text("productId").notNull(),
	},
	(CouponApplicableProduct) => ({
		coupon_applicable_product_coupon_fkey: foreignKey({
			name: "coupon_applicable_product_coupon_fkey",
			columns: [CouponApplicableProduct.couponId],
			foreignColumns: [Coupon.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		coupon_applicable_product_product_fkey: foreignKey({
			name: "coupon_applicable_product_product_fkey",
			columns: [CouponApplicableProduct.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		CouponApplicableProduct_cpk: primaryKey({
			name: "CouponApplicableProduct_cpk",
			columns: [
				CouponApplicableProduct.couponId,
				CouponApplicableProduct.productId,
			],
		}),
	}),
);

export const CouponApplicableCategory = pgTable(
	"coupon_applicable_category",
	{
		couponId: text("couponId").notNull(),
		categoryId: text("categoryId").notNull(),
	},
	(CouponApplicableCategory) => ({
		coupon_applicable_category_coupon_fkey: foreignKey({
			name: "coupon_applicable_category_coupon_fkey",
			columns: [CouponApplicableCategory.couponId],
			foreignColumns: [Coupon.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		coupon_applicable_category_category_fkey: foreignKey({
			name: "coupon_applicable_category_category_fkey",
			columns: [CouponApplicableCategory.categoryId],
			foreignColumns: [Category.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		CouponApplicableCategory_cpk: primaryKey({
			name: "CouponApplicableCategory_cpk",
			columns: [
				CouponApplicableCategory.couponId,
				CouponApplicableCategory.categoryId,
			],
		}),
	}),
);

export const CouponExcludedProduct = pgTable(
	"coupon_excluded_product",
	{
		couponId: text("couponId").notNull(),
		productId: text("productId").notNull(),
	},
	(CouponExcludedProduct) => ({
		coupon_excluded_product_coupon_fkey: foreignKey({
			name: "coupon_excluded_product_coupon_fkey",
			columns: [CouponExcludedProduct.couponId],
			foreignColumns: [Coupon.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		coupon_excluded_product_product_fkey: foreignKey({
			name: "coupon_excluded_product_product_fkey",
			columns: [CouponExcludedProduct.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		CouponExcludedProduct_cpk: primaryKey({
			name: "CouponExcludedProduct_cpk",
			columns: [
				CouponExcludedProduct.couponId,
				CouponExcludedProduct.productId,
			],
		}),
	}),
);

export const CouponExcludedCategory = pgTable(
	"coupon_excluded_category",
	{
		couponId: text("couponId").notNull(),
		categoryId: text("categoryId").notNull(),
	},
	(CouponExcludedCategory) => ({
		coupon_excluded_category_coupon_fkey: foreignKey({
			name: "coupon_excluded_category_coupon_fkey",
			columns: [CouponExcludedCategory.couponId],
			foreignColumns: [Coupon.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		coupon_excluded_category_category_fkey: foreignKey({
			name: "coupon_excluded_category_category_fkey",
			columns: [CouponExcludedCategory.categoryId],
			foreignColumns: [Category.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		CouponExcludedCategory_cpk: primaryKey({
			name: "CouponExcludedCategory_cpk",
			columns: [
				CouponExcludedCategory.couponId,
				CouponExcludedCategory.categoryId,
			],
		}),
	}),
);

export const WishlistItem = pgTable(
	"wishlist_item",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		userId: text("userId").notNull(),
		productId: text("productId").notNull(),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(WishlistItem) => ({
		wishlist_item_user_fkey: foreignKey({
			name: "wishlist_item_user_fkey",
			columns: [WishlistItem.userId],
			foreignColumns: [User.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		wishlist_item_product_fkey: foreignKey({
			name: "wishlist_item_product_fkey",
			columns: [WishlistItem.productId],
			foreignColumns: [Product.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
		WishlistItem_userId_productId_unique_idx: uniqueIndex(
			"WishlistItem_userId_productId_key",
		).on(WishlistItem.userId, WishlistItem.productId),
	}),
);

export const AuditLog = pgTable(
	"audit_log",
	{
		id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
		userId: text("userId"),
		action: text("action").notNull(),
		entity: text("entity").notNull(),
		entityId: text("entityId"),
		message: text("message").notNull(),
		metadata: jsonb("metadata"),
		createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	},
	(AuditLog) => ({
		audit_log_user_fkey: foreignKey({
			name: "audit_log_user_fkey",
			columns: [AuditLog.userId],
			foreignColumns: [User.id],
		})
			.onDelete("set null")
			.onUpdate("cascade"),
	}),
);

export const StaticPage = pgTable("static_page", {
	id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content").notNull(),
	active: boolean("active").notNull().default(true),
	seoTitle: text("seoTitle"),
	seoDesc: text("seoDesc"),
	createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
});

export const Banner = pgTable("banner", {
	id: text("id").notNull().primaryKey().default(sql`cuid(1)`),
	title: text("title").notNull(),
	imageUrl: text("imageUrl").notNull(),
	linkUrl: text("linkUrl"),
	position: text("position").notNull(),
	sortOrder: integer("sortOrder").notNull(),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
});

export const UserRelations = relations(User, ({ many }) => ({
	sessions: many(Session, {
		relationName: "SessionToUser",
	}),
	accounts: many(Account, {
		relationName: "AccountToUser",
	}),
	addresses: many(Address, {
		relationName: "AddressToUser",
	}),
	carts: many(Cart, {
		relationName: "CartToUser",
	}),
	orders: many(Order, {
		relationName: "OrderToUser",
	}),
	reviews: many(Review, {
		relationName: "ReviewToUser",
	}),
	wishlistItems: many(WishlistItem, {
		relationName: "UserToWishlistItem",
	}),
	auditLogs: many(AuditLog, {
		relationName: "AuditLogToUser",
	}),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
	user: one(User, {
		relationName: "SessionToUser",
		fields: [Session.userId],
		references: [User.id],
	}),
}));

export const AccountRelations = relations(Account, ({ one }) => ({
	user: one(User, {
		relationName: "AccountToUser",
		fields: [Account.userId],
		references: [User.id],
	}),
}));

export const AddressRelations = relations(Address, ({ one }) => ({
	user: one(User, {
		relationName: "AddressToUser",
		fields: [Address.userId],
		references: [User.id],
	}),
}));

export const CategoryRelations = relations(Category, ({ one, many }) => ({
	parent: one(Category, {
		relationName: "CategoryHierarchy",
		fields: [Category.parentId],
		references: [Category.id],
	}),
	children: many(Category, {
		relationName: "CategoryHierarchy",
	}),
	products: many(Product, {
		relationName: "CategoryToProduct",
	}),
	applicableCoupons: many(CouponApplicableCategory, {
		relationName: "CategoryToCouponApplicableCategory",
	}),
	excludedCoupons: many(CouponExcludedCategory, {
		relationName: "CategoryToCouponExcludedCategory",
	}),
}));

export const BrandRelations = relations(Brand, ({ many }) => ({
	products: many(Product, {
		relationName: "BrandToProduct",
	}),
}));

export const ProductRelations = relations(Product, ({ one, many }) => ({
	brand: one(Brand, {
		relationName: "BrandToProduct",
		fields: [Product.brandId],
		references: [Brand.id],
	}),
	category: one(Category, {
		relationName: "CategoryToProduct",
		fields: [Product.categoryId],
		references: [Category.id],
	}),
	variants: many(ProductVariant, {
		relationName: "ProductToProductVariant",
	}),
	images: many(ProductImage, {
		relationName: "ProductToProductImage",
	}),
	reviews: many(Review, {
		relationName: "ProductToReview",
	}),
	wishlistItems: many(WishlistItem, {
		relationName: "ProductToWishlistItem",
	}),
	tags: many(ProductTag, {
		relationName: "ProductToProductTag",
	}),
	applicableCoupons: many(CouponApplicableProduct, {
		relationName: "CouponApplicableProductToProduct",
	}),
	excludedCoupons: many(CouponExcludedProduct, {
		relationName: "CouponExcludedProductToProduct",
	}),
}));

export const ProductVariantRelations = relations(
	ProductVariant,
	({ one, many }) => ({
		product: one(Product, {
			relationName: "ProductToProductVariant",
			fields: [ProductVariant.productId],
			references: [Product.id],
		}),
		images: many(ProductImage, {
			relationName: "ProductImageToProductVariant",
		}),
		cartItems: many(CartItem, {
			relationName: "CartItemToProductVariant",
		}),
		orderItems: many(OrderItem, {
			relationName: "OrderItemToProductVariant",
		}),
	}),
);

export const ProductImageRelations = relations(ProductImage, ({ one }) => ({
	product: one(Product, {
		relationName: "ProductToProductImage",
		fields: [ProductImage.productId],
		references: [Product.id],
	}),
	variant: one(ProductVariant, {
		relationName: "ProductImageToProductVariant",
		fields: [ProductImage.variantId],
		references: [ProductVariant.id],
	}),
}));

export const TagRelations = relations(Tag, ({ many }) => ({
	products: many(ProductTag, {
		relationName: "ProductTagToTag",
	}),
}));

export const ProductTagRelations = relations(ProductTag, ({ one }) => ({
	product: one(Product, {
		relationName: "ProductToProductTag",
		fields: [ProductTag.productId],
		references: [Product.id],
	}),
	tag: one(Tag, {
		relationName: "ProductTagToTag",
		fields: [ProductTag.tagId],
		references: [Tag.id],
	}),
}));

export const CartRelations = relations(Cart, ({ one, many }) => ({
	user: one(User, {
		relationName: "CartToUser",
		fields: [Cart.userId],
		references: [User.id],
	}),
	items: many(CartItem, {
		relationName: "CartToCartItem",
	}),
}));

export const CartItemRelations = relations(CartItem, ({ one }) => ({
	cart: one(Cart, {
		relationName: "CartToCartItem",
		fields: [CartItem.cartId],
		references: [Cart.id],
	}),
	variant: one(ProductVariant, {
		relationName: "CartItemToProductVariant",
		fields: [CartItem.variantId],
		references: [ProductVariant.id],
	}),
}));

export const OrderRelations = relations(Order, ({ one, many }) => ({
	user: one(User, {
		relationName: "OrderToUser",
		fields: [Order.userId],
		references: [User.id],
	}),
	items: many(OrderItem, {
		relationName: "OrderToOrderItem",
	}),
	payments: many(Payment, {
		relationName: "OrderToPayment",
	}),
	statusHistory: many(OrderStatusHistory, {
		relationName: "OrderToOrderStatusHistory",
	}),
	coupon: one(Coupon, {
		relationName: "CouponToOrder",
		fields: [Order.couponId],
		references: [Coupon.id],
	}),
}));

export const OrderItemRelations = relations(OrderItem, ({ one, many }) => ({
	order: one(Order, {
		relationName: "OrderToOrderItem",
		fields: [OrderItem.orderId],
		references: [Order.id],
	}),
	variant: one(ProductVariant, {
		relationName: "OrderItemToProductVariant",
		fields: [OrderItem.variantId],
		references: [ProductVariant.id],
	}),
	review: many(Review, {
		relationName: "OrderItemToReview",
	}),
}));

export const PaymentRelations = relations(Payment, ({ one }) => ({
	order: one(Order, {
		relationName: "OrderToPayment",
		fields: [Payment.orderId],
		references: [Order.id],
	}),
}));

export const OrderStatusHistoryRelations = relations(
	OrderStatusHistory,
	({ one }) => ({
		order: one(Order, {
			relationName: "OrderToOrderStatusHistory",
			fields: [OrderStatusHistory.orderId],
			references: [Order.id],
		}),
	}),
);

export const ReviewRelations = relations(Review, ({ one }) => ({
	product: one(Product, {
		relationName: "ProductToReview",
		fields: [Review.productId],
		references: [Product.id],
	}),
	user: one(User, {
		relationName: "ReviewToUser",
		fields: [Review.userId],
		references: [User.id],
	}),
	orderItem: one(OrderItem, {
		relationName: "OrderItemToReview",
		fields: [Review.orderItemId],
		references: [OrderItem.id],
	}),
}));

export const CouponRelations = relations(Coupon, ({ many }) => ({
	applicableProducts: many(CouponApplicableProduct, {
		relationName: "CouponToCouponApplicableProduct",
	}),
	applicableCategories: many(CouponApplicableCategory, {
		relationName: "CouponToCouponApplicableCategory",
	}),
	excludedProducts: many(CouponExcludedProduct, {
		relationName: "CouponToCouponExcludedProduct",
	}),
	excludedCategories: many(CouponExcludedCategory, {
		relationName: "CouponToCouponExcludedCategory",
	}),
	orders: many(Order, {
		relationName: "CouponToOrder",
	}),
}));

export const CouponApplicableProductRelations = relations(
	CouponApplicableProduct,
	({ one }) => ({
		coupon: one(Coupon, {
			relationName: "CouponToCouponApplicableProduct",
			fields: [CouponApplicableProduct.couponId],
			references: [Coupon.id],
		}),
		product: one(Product, {
			relationName: "CouponApplicableProductToProduct",
			fields: [CouponApplicableProduct.productId],
			references: [Product.id],
		}),
	}),
);

export const CouponApplicableCategoryRelations = relations(
	CouponApplicableCategory,
	({ one }) => ({
		coupon: one(Coupon, {
			relationName: "CouponToCouponApplicableCategory",
			fields: [CouponApplicableCategory.couponId],
			references: [Coupon.id],
		}),
		category: one(Category, {
			relationName: "CategoryToCouponApplicableCategory",
			fields: [CouponApplicableCategory.categoryId],
			references: [Category.id],
		}),
	}),
);

export const CouponExcludedProductRelations = relations(
	CouponExcludedProduct,
	({ one }) => ({
		coupon: one(Coupon, {
			relationName: "CouponToCouponExcludedProduct",
			fields: [CouponExcludedProduct.couponId],
			references: [Coupon.id],
		}),
		product: one(Product, {
			relationName: "CouponExcludedProductToProduct",
			fields: [CouponExcludedProduct.productId],
			references: [Product.id],
		}),
	}),
);

export const CouponExcludedCategoryRelations = relations(
	CouponExcludedCategory,
	({ one }) => ({
		coupon: one(Coupon, {
			relationName: "CouponToCouponExcludedCategory",
			fields: [CouponExcludedCategory.couponId],
			references: [Coupon.id],
		}),
		category: one(Category, {
			relationName: "CategoryToCouponExcludedCategory",
			fields: [CouponExcludedCategory.categoryId],
			references: [Category.id],
		}),
	}),
);

export const WishlistItemRelations = relations(WishlistItem, ({ one }) => ({
	user: one(User, {
		relationName: "UserToWishlistItem",
		fields: [WishlistItem.userId],
		references: [User.id],
	}),
	product: one(Product, {
		relationName: "ProductToWishlistItem",
		fields: [WishlistItem.productId],
		references: [Product.id],
	}),
}));

export const AuditLogRelations = relations(AuditLog, ({ one }) => ({
	user: one(User, {
		relationName: "AuditLogToUser",
		fields: [AuditLog.userId],
		references: [User.id],
	}),
}));
