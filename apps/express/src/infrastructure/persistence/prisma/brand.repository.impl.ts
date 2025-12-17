import { prisma } from "@workspace/database";
import { Brand } from "@/domain/entities/brand.entity";
import type { IBrandRepository } from "@/domain/repositories/brand.repository";
import { NotFoundError } from "@/shared/errors/not-found.error";

/**
 * Prisma Brand Repository Implementation
 * Implements IBrandRepository using Prisma
 *
 * This repository is intentionally simple so that
 * developers new to Node.js / Prisma can follow it easily.
 */
export class PrismaBrandRepository implements IBrandRepository {
	async findById(id: string): Promise<Brand | null> {
		const data = await prisma.brand.findUnique({
			where: { id },
		});

		if (!data) {
			return null;
		}

		return this.toDomain(data);
	}

	async findBySlug(slug: string): Promise<Brand | null> {
		const data = await prisma.brand.findUnique({
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
		active?: boolean;
		search?: string;
		sortBy?: "name" | "createdAt" | "updatedAt";
		sortOrder?: "asc" | "desc";
	}): Promise<{ brands: Brand[]; total: number }> {
		const {
			page = 1,
			limit = 10,
			active,
			search,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = params;

		// Build where clause
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

		// Get total count
		const total = await prisma.brand.count({ where });

		// Get brands
		const brands = await prisma.brand.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
		});

		return {
			brands: brands.map((b) => this.toDomain(b)),
			total,
		};
	}

	async create(data: {
		name: string;
		slug: string;
		description?: string | null;
		logoUrl?: string | null;
		active?: boolean;
	}): Promise<Brand> {
		const brand = await prisma.brand.create({
			data: {
				...data,
				active: data.active ?? true,
			},
		});

		return this.toDomain(brand);
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
	): Promise<Brand> {
		const existing = await prisma.brand.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Brand", id);
		}

		const updated = await prisma.brand.update({
			where: { id },
			data,
		});

		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		const existing = await prisma.brand.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundError("Brand", id);
		}

		await prisma.brand.delete({
			where: { id },
		});
	}

	async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
		const brand = await prisma.brand.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!brand) {
			return false;
		}

		if (excludeId) {
			return brand.id !== excludeId;
		}

		return true;
	}

	async findAll(): Promise<Brand[]> {
		const brands = await prisma.brand.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return brands.map((b) => this.toDomain(b));
	}

	/**
	 * Map Prisma model to Domain entity
	 */
	private toDomain(data: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		logoUrl: string | null;
		active: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): Brand {
		return Brand.create(
			data.id,
			data.name,
			data.slug,
			data.description,
			data.logoUrl,
			data.active,
			data.createdAt,
			data.updatedAt,
		);
	}
}


