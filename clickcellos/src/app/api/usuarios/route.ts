import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const usuarios = await prisma.usuario.findMany({
    where: userRole !== "Master" ? { idUnidade } : undefined,
    select: {
      id: true, idUnidade: true, nome: true, email: true, role: true, telefone: true, ativo: true,
      unidade: { select: { nomeFantasia: true } },
    },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(usuarios)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { nome, email, senha, role, telefone } = body

  if (!nome || !email || !senha || !role) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  if (userRole === "Franqueado" && (role !== "Tecnico" && role !== "Motoboy")) {
    return NextResponse.json({ error: "Franqueado só pode criar Técnico ou Motoboy" }, { status: 403 })
  }

  if (userRole !== "Master" && userRole !== "Franqueado") {
    return NextResponse.json({ error: "Sem permissão para criar usuários" }, { status: 403 })
  }

  const emailExistente = await prisma.usuario.findUnique({ where: { email } })
  if (emailExistente) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })

  const senhaHash = await bcrypt.hash(senha, 10)

  const usuario = await prisma.usuario.create({
    data: {
      idUnidade,
      nome,
      email,
      senhaHash,
      role,
      telefone,
    },
    select: {
      id: true, idUnidade: true, nome: true, email: true, role: true, telefone: true, ativo: true,
    },
  })

  return NextResponse.json(usuario, { status: 201 })
}
