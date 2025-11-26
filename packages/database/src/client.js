import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use globalThis to cache the Prisma client in development
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    const client = new PrismaClient({
      adapter,
    });

    // Cache the client in non-production environments
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }

    return client;
  })();
