import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { drizzle } from "drizzle-orm/prisma/pg";

const createPrismaClient = () => {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL environment variable is not defined");
	}

	const adapter = new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	});

	const client = new PrismaClient({
		adapter,
	}).$extends(drizzle());

	return client;
};

const globalForPrisma = global as unknown as {
	prisma?: ReturnType<typeof createPrismaClient>;
};

if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;
