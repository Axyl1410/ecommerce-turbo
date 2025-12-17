import type { BrandRow } from "@workspace/types";
import { prisma } from "@workspace/database";
import type { IBrandRepository } from "@/domain/repositories/brand.repository";

/**
 * Prisma Brand Repository Implementation
 */
export class PrismaBrandRepository implements IBrandRepository {
	async findById(id: string): Promise<BrandRow | null> {
		const brand = await prisma.brand.findUnique({
			where: { id },
		});

		return brand;
	}

	async findBySlug(slug: string): Promise<BrandRow | null> {
		const brand = await prisma.brand.findUnique({
			where: { slug },
		});

		return brand;
	}

	async findMany(params: {
		page?: number;
		limit?: number;
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{
		brands: BrandRow[];
		total: number;
	}> {
		const {
			page = 1,
			limit = 10,
			active,
			search,
			sortBy = "name",
			sortOrder = "asc",
		} = params;

		const where: {
			active?: boolean;
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
			}>;
		} = {};

		if (active !== undefined) {
			where.active = active;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const [brands, total] = await Promise.all([
			prisma.brand.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: {
					[sortBy]: sortOrder,
				},
			}),
			prisma.brand.count({ where }),
		]);

		return { brands, total };
	}

	async create(data: {
		name: string;
		slug: string;
		description?: string | null;
		logoUrl?: string | null;
		active?: boolean;
	}): Promise<string> {
		const brand = await prisma.brand.create({
			data: {
				id: crypto.randomUUID(),
				name: data.name,
				slug: data.slug,
				description: data.description,
				logoUrl: data.logoUrl,
				active: data.active ?? true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return brand.id;
	}

	async update(
		id: string,
		data: {
			name?: string;
			slug?: string;
			description?: string | null;
			logoUrl?: string | null;
			active?: boolean;
		},
	): Promise<void> {
		await prisma.brand.update({
			where: { id },
			data: {
				...data,
				updatedAt: new Date(),
			},
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.brand.delete({
			where: { id },
		});
	}
}
