import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) return new PrismaClient({} as any)

  const ssl = url.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined

  const adapter = new PrismaPg({
    connectionString: url,
    ssl,
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
