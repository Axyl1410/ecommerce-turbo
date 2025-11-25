import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    const _prisma = new PrismaClient({
      adapter,
    });

    globalForPrisma.prisma = _prisma;

    return _prisma;
  })();
