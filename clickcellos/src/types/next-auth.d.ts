import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    idUnidade?: number
    slug?: string
    nomeUnidade?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      idUnidade: number
      slug: string
      nomeUnidade: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    idUnidade: number
    slug: string
    nomeUnidade: string
  }
}

export type {};
