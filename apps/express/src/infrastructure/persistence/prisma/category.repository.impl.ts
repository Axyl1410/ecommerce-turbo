import { prisma } from "@workspace/database";
import { Category } from "@/domain/entities/category.entity";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Prisma Category Repository Implementation
 * Implements ICategoryRepository using Prisma
 */
export class PrismaCategoryRepository implements ICategoryRepository {
	async findById(id: string): Promise<Category | null> {
		const data = await prisma.category.findUnique({
			where: { id },
		});

		if (!data) {
			return null;
		}

		return this.toDomain(data);
	}

	async findBySlug(slug: string): Promise<Category | null> {
		const data = await prisma.category.findUnique({
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
		parentId?: string | null;
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt" | "sortOrder";
		sortOrder?: "asc" | "desc";
	}): Promise<{ categories: Category[]; total: number }> {
		const {
			page = 1,
			limit = 10,
			parentId,
			active,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = params;

		// Build where clause
		const where: {
			parentId?: string | null;
			active?: boolean;
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
			}>;
		} = {};

		// Handle parentId filter (null means root categories)
		if (parentId !== undefined) {
			where.parentId = parentId;
		}

		if (active !== undefined) {
			where.active = active;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		// Get total count
		const total = await prisma.category.count({ where });

		// Get categories
		const categories = await prisma.category.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
		});

		return {
			categories: categories.map((c) => this.toDomain(c)),
			total,
		};
	}

	async findByParentId(parentId: string | null): Promise<Category[]> {
		const categories = await prisma.category.findMany({
			where: { parentId },
			orderBy: {
				sortOrder: "asc",
			},
		});

		return categories.map((c) => this.toDomain(c));
	}

	async create(data: {
		name: string;
		slug: string;
		description?: string | null;
		imageUrl?: string | null;
		parentId?: string | null;
		sortOrder?: number | null;
		active?: boolean;
	}): Promise<Category> {
		const category = await prisma.category.create({
			data: {
				...data,
				active: data.active ?? true,
				sortOrder: data.sortOrder ?? 0,
			},
		});

		return this.toDomain(category);
	}

	async update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			imageUrl?: string | null;
			parentId?: string | null;
			sortOrder?: number | null;
			active?: boolean;
		},
	): Promise<Category> {
		// Check if category exists
		const existing = await prisma.category.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Category", id);
		}

		const updated = await prisma.category.update({
			where: { id },
			data,
		});

		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		// Check if category exists
		const existing = await prisma.category.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Category", id);
		}

		// Set parentId to null for all children (cascade behavior)
		await prisma.category.updateMany({
			where: { parentId: id },
			data: { parentId: null },
		});

		await prisma.category.delete({
			where: { id },
		});
	}

	async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
		const category = await prisma.category.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!category) {
			return false;
		}

		// If excludeId is provided, check if it's different
		if (excludeId) {
			return category.id !== excludeId;
		}

		return true;
	}

	async findByIdWithDetails(id: string): Promise<{
		category: Category;
		parent: { id: string; name: string; slug: string } | null;
		children: Array<{ id: string; name: string; slug: string }>;
	} | null> {
		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
					orderBy: {
						sortOrder: "asc",
					},
				},
			},
		});

		if (!category) {
			return null;
		}

		return {
			category: this.toDomain(category),
			parent: category.parent,
			children: category.children,
		};
	}

	async findBySlugWithDetails(slug: string): Promise<{
		category: Category;
		parent: { id: string; name: string; slug: string } | null;
		children: Array<{ id: string; name: string; slug: string }>;
	} | null> {
		const category = await prisma.category.findUnique({
			where: { slug },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
					orderBy: {
						sortOrder: "asc",
					},
				},
			},
		});

		if (!category) {
			return null;
		}

		return {
			category: this.toDomain(category),
			parent: category.parent,
			children: category.children,
		};
	}

	async findAll(): Promise<Category[]> {
		const categories = await prisma.category.findMany({
			orderBy: {
				sortOrder: "asc",
			},
		});

		return categories.map((c) => this.toDomain(c));
	}

	/**
	 * Map Prisma model to Domain entity
	 */
	private toDomain(data: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		imageUrl: string | null;
		parentId: string | null;
		sortOrder: number | null;
		active: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): Category {
		return Category.create(
			data.id,
			data.name,
			data.slug,
			data.description,
			data.imageUrl,
			data.parentId,
			data.sortOrder,
			data.active,
			data.createdAt,
			data.updatedAt,
		);
	}
}


