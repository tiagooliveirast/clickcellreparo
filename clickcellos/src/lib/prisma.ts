import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = process.env.DATABASE_URL
    ? new PrismaPg({ connectionString: process.env.DATABASE_URL })
    : undefined

  return new PrismaClient(adapter ? { adapter } : undefined as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
