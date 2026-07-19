import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import dns from "dns"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) return new PrismaClient({} as never)

  const isVercel = !!process.env.VERCEL

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    ...(isVercel && {
      lookup: (host: string, opts: dns.LookupOptions, cb: (err: Error | null, address?: string, family?: number) => void) => {
        dns.lookup(host, { ...opts, all: true }, (err, addresses) => {
          if (err) return cb(err, undefined, undefined)
          const addrs = addresses as dns.LookupAddress[]
          const v4 = addrs.find((a) => a.family === 4)
          if (v4) return cb(null, v4.address, v4.family)
          const v6 = addrs.find((a) => a.family === 6)
          if (v6) return cb(null, v6.address, v6.family)
          if (addrs.length > 0) return cb(null, addrs[0].address, addrs[0].family)
          cb(new Error("No DNS addresses found"), undefined, undefined)
        })
      },
    }),
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
