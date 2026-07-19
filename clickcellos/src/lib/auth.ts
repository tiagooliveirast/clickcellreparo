import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const usuario = await prisma.usuario.findUnique({
          where: { email },
          include: { unidade: true },
        })

        if (!usuario || !usuario.ativo) return null

        const senhaValida = await bcrypt.compare(password, usuario.senhaHash)
        if (!senhaValida) return null

        if (usuario.unidade?.statusContrato === "Bloqueado" && usuario.role !== "Master") return null

        return {
          id: String(usuario.id),
          email: usuario.email,
          name: usuario.nome,
          role: usuario.role,
          idUnidade: usuario.idUnidade ?? 0,
          slug: usuario.unidade?.slugSubdominio ?? "",
          nomeUnidade: usuario.unidade?.nomeFantasia ?? "Click Cell",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.idUnidade = (user as { idUnidade: number }).idUnidade
        token.slug = (user as { slug: string }).slug
        token.nomeUnidade = (user as { nomeUnidade: string }).nomeUnidade
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.idUnidade = token.idUnidade as number
        session.user.slug = token.slug as string
        session.user.nomeUnidade = token.nomeUnidade as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
})
