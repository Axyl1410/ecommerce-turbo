import { prisma } from "@workspace/database";
import type { ProductRow } from "@workspace/types";
import { Product } from "@/domain/entities/product.entity";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

type ProductStatus = ProductRow["status"];

/**
 * Prisma Product Repository Implementation
 * Implements IProductRepository using Prisma
 */
export class PrismaProductRepository implements IProductRepository {
	async findById(id: string): Promise<Product | null> {
		const data = await prisma.product.findUnique({
			where: { id },
		});

		if (!data) {
			return null;
		}

		return this.toDomain(data);
	}

	async findBySlug(slug: string): Promise<Product | null> {
		const data = await prisma.product.findUnique({
			where: { slug },
		});

		if (!data) {
			return null;
		}

		return this.toDomain(data);
	}

	async findMany(params: {
		page?: number;
		limit?: number;
		status?: ProductStatus;
		categoryId?: string;
		brandId?: string;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		products: Array<
			Pick<ProductRow, "id" | "name" | "slug" | "defaultImage"> & {
				lowestPrice: number;
				lowestSalePrice: number | null;
				ratingAvg: number;
				ratingCount: number;
			}
		>;
		total: number;
	}> {
		const {
			page = 1,
			limit = 10,
			status,
			categoryId,
			brandId,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = params;

		// Build where clause
		const where: {
			status?: ProductStatus;
			categoryId?: string;
			brandId?: string;
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
			}>;
		} = {};

		if (status) {
			where.status = status;
		}

		if (categoryId) {
			where.categoryId = categoryId;
		}

		if (brandId) {
			where.brandId = brandId;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		// Get total count
		const total = await prisma.product.count({ where });

		// Get products with variants and reviews
		const products = await prisma.product.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				variants: {
					select: {
						price: true,
						salePrice: true,
					},
					orderBy: {
						price: "asc",
					},
					take: 1,
				},
				reviews: {
					select: {
						rating: true,
					},
				},
			},
		});

		// Fetch all products' reviews for rating aggregation
		const productIds = products.map((p) => p.id);
		const reviewAggregates = await prisma.review.groupBy({
			by: ["productId"],
			where: {
				productId: {
					in: productIds,
				},
			},
			_avg: {
				rating: true,
			},
			_count: {
				id: true,
			},
		});

		// Build review map for quick lookup
		const reviewMap = new Map(
			reviewAggregates.map((agg) => [
				agg.productId,
				{
					avg: agg._avg.rating ?? 0,
					count: agg._count.id ?? 0,
				},
			]),
		);

		return {
			products: products.map((p) => {
				const cheapestVariant = p.variants[0];
				const reviews = reviewMap.get(p.id) || { avg: 0, count: 0 };

				return {
					id: p.id,
					name: p.name,
					slug: p.slug,
					defaultImage: p.defaultImage,
					lowestPrice: cheapestVariant?.price
						? Number(cheapestVariant.price)
						: 0,
					lowestSalePrice: cheapestVariant?.salePrice
						? Number(cheapestVariant.salePrice)
						: null,
					ratingAvg: reviews.avg,
					ratingCount: reviews.count,
				};
			}),
			total,
		};
	}

	async findManyWithVariants(params: {
		page?: number;
		limit?: number;
		status?: ProductStatus;
		categoryId?: string;
		brandId?: string;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		products: Array<
			Product & {
				variants?: Array<{
					id: string;
					price: number;
					salePrice: number | null;
				}>;
			}
		>;
		total: number;
	}> {
		const {
			page = 1,
			limit = 10,
			status,
			categoryId,
			brandId,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = params;

		// Build where clause (same as findMany)
		const where: {
			status?: ProductStatus;
			categoryId?: string;
			brandId?: string;
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
			}>;
		} = {};

		if (status) {
			where.status = status;
		}

		if (categoryId) {
			where.categoryId = categoryId;
		}

		if (brandId) {
			where.brandId = brandId;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		// Get total count
		const total = await prisma.product.count({ where });

		// Get products with first variant only (for performance)
		const products = await prisma.product.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				variants: {
					select: {
						id: true,
						price: true,
						salePrice: true,
					},
					take: 1, // Only get first variant for list view
				},
			},
		});

		return {
			products: products.map((p) => {
				const domainProduct = this.toDomain(p);
				const variants = p.variants.map((v) => ({
					id: v.id,
					price: Math.round(Number(v.price) * 100) / 100,
					salePrice: v.salePrice
						? Math.round(Number(v.salePrice) * 100) / 100
						: null,
				}));
				return Object.assign(domainProduct, { variants });
			}),
			total,
		};
	}

	async create(data: {
		name: string;
		slug: string;
		description?: string | null;
		brandId?: string | null;
		categoryId?: string | null;
		defaultImage?: string | null;
		seoMetaTitle?: string | null;
		seoMetaDesc?: string | null;
		status?: ProductStatus;
	}): Promise<Product> {
		const product = await prisma.product.create({
			data: {
				...data,
				status: data.status ?? "DRAFT",
			},
		});

		return this.toDomain(product);
	}

	async update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			brandId?: string | null;
			categoryId?: string | null;
			defaultImage?: string | null;
			seoMetaTitle?: string | null;
			seoMetaDesc?: string | null;
			status?: ProductStatus;
		},
	): Promise<Product> {
		// Check if product exists
		const existing = await prisma.product.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Product", id);
		}

		const updated = await prisma.product.update({
			where: { id },
			data,
		});

		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		// Check if product exists
		const existing = await prisma.product.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Product", id);
		}

		await prisma.product.delete({
			where: { id },
		});
	}

	async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
		const product = await prisma.product.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!product) {
			return false;
		}

		// If excludeId is provided, check if it's different
		if (excludeId) {
			return product.id !== excludeId;
		}

		return true;
	}

	async findByIdWithDetails(id: string) {
		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				brand: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				variants: {
					include: {
						images: {
							orderBy: {
								sortOrder: "asc",
							},
						},
					},
					orderBy: {
						id: "asc",
					},
				},
				images: {
					where: {
						variantId: null,
					},
					orderBy: {
						sortOrder: "asc",
					},
				},
			},
		});

		if (!product) {
			return null;
		}

		return {
			product: this.toDomain(product),
			brand: product.brand,
			category: product.category,
			variants: product.variants.map((variant) => ({
				id: variant.id,
				productId: variant.productId,
				sku: variant.sku,
				attributes: variant.attributes as Record<string, unknown> | null,
				price: Number(variant.price),
				salePrice: variant.salePrice ? Number(variant.salePrice) : null,
				stockQuantity: variant.stockQuantity,
				weight: variant.weight,
				barcode: variant.barcode,
				images: variant.images,
			})),
			images: product.images,
		};
	}

	async findBySlugWithDetails(slug: string) {
		const product = await prisma.product.findUnique({
			where: { slug },
			include: {
				brand: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				variants: {
					include: {
						images: {
							orderBy: {
								sortOrder: "asc",
							},
						},
					},
					orderBy: {
						id: "asc",
					},
				},
				images: {
					where: {
						variantId: null,
					},
					orderBy: {
						sortOrder: "asc",
					},
				},
			},
		});

		if (!product) {
			return null;
		}

		return {
			product: this.toDomain(product),
			brand: product.brand,
			category: product.category,
			variants: product.variants.map((variant) => ({
				id: variant.id,
				productId: variant.productId,
				sku: variant.sku,
				attributes: variant.attributes as Record<string, unknown> | null,
				price: Number(variant.price),
				salePrice: variant.salePrice ? Number(variant.salePrice) : null,
				stockQuantity: variant.stockQuantity,
				weight: variant.weight,
				barcode: variant.barcode,
				images: variant.images,
			})),
			images: product.images,
		};
	}

	async createWithDetails(data: {
		name: string;
		slug: string;
		description?: string | null;
		brandId?: string | null;
		categoryId?: string | null;
		defaultImage?: string | null;
		seoMetaTitle?: string | null;
		seoMetaDesc?: string | null;
		status?: ProductStatus;
		variants?: Array<{
			sku?: string | null;
			attributes?: Record<string, unknown> | null;
			price: number;
			salePrice?: number | null;
			stockQuantity: number;
			weight?: number | null;
			barcode?: string | null;
		}>;
		images?: Array<{
			url: string;
			altText?: string | null;
			sortOrder?: number | null;
			variantId?: string | null;
		}>;
	}): Promise<string> {
		const { variants, images, ...productData } = data;

		// Create product
		const product = await prisma.product.create({
			data: {
				...productData,
				status: productData.status ?? "DRAFT",
			},
		});

		// Create variants if provided
		if (variants && variants.length > 0) {
			await Promise.all(
				variants.map((variantData) =>
					prisma.productVariant.create({
						data: {
							productId: product.id,
							sku: variantData.sku ?? null,
							// biome-ignore lint/suspicious/noExplicitAny: Prisma JSON type requires any
							attributes: variantData.attributes as any,
							price: variantData.price,
							salePrice: variantData.salePrice ?? null,
							stockQuantity: variantData.stockQuantity,
							weight: variantData.weight ?? null,
							barcode: variantData.barcode ?? null,
						},
					}),
				),
			);
		}

		// Create images if provided
		if (images && images.length > 0) {
			await Promise.all(
				images.map((imageData) =>
					prisma.productImage.create({
						data: {
							...imageData,
							productId: product.id,
						},
					}),
				),
			);
		}

		return product.id;
	}

	/**
	 * Map Prisma model to Domain entity
	 */
	private toDomain(data: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		brandId: string | null;
		categoryId: string | null;
		defaultImage: string | null;
		seoMetaTitle: string | null;
		seoMetaDesc: string | null;
		status: ProductStatus;
		createdAt: Date;
		updatedAt: Date;
	}): Product {
		return Product.create(
			data.id,
			data.name,
			data.slug,
			data.description,
			data.brandId,
			data.categoryId,
			data.defaultImage,
			data.seoMetaTitle,
			data.seoMetaDesc,
			data.status,
			data.createdAt,
			data.updatedAt,
		);
	}
}
