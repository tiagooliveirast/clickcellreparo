import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getUsuarioOrThrow(id: number) {
  const usuario = await prisma.usuario.findUnique({ where: { id } })
  if (!usuario) throw new Error("NotFound")
  return usuario
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  try {
    const usuario = await getUsuarioOrThrow(userId)
  } catch { return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }) }

  const userRole = session.user.role
  const sessionIdUnidade = session.user.idUnidade

  if (userRole !== "Master") {
    const target = await prisma.usuario.findUnique({ where: { id: userId }, select: { idUnidade: true } })
    if (!target || target.idUnidade !== sessionIdUnidade) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true, idUnidade: true, nome: true, email: true, role: true, telefone: true, ativo: true,
      unidade: { select: { nomeFantasia: true } },
    },
  })

  return NextResponse.json(usuario)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  try {
    const usuario = await getUsuarioOrThrow(userId)
  } catch { return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }) }

  const userRole = session.user.role
  const sessionIdUnidade = session.user.idUnidade

  const target = await prisma.usuario.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (userRole !== "Master") {
    if (target.idUnidade !== sessionIdUnidade) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { nome, email, senha, role, telefone, ativo } = body

  if (email && email !== target.email) {
    const existente = await prisma.usuario.findUnique({ where: { email } })
    if (existente) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })
  }

  const data: any = {}
  if (nome !== undefined) data.nome = nome
  if (email !== undefined) data.email = email
  if (role !== undefined) {
    if (userRole !== "Master") return NextResponse.json({ error: "Apenas Master pode alterar permissões" }, { status: 403 })
    data.role = role
  }
  if (telefone !== undefined) data.telefone = telefone
  if (ativo !== undefined) data.ativo = ativo
  if (senha) data.senhaHash = await bcrypt.hash(senha, 10)

  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data,
    select: { id: true, idUnidade: true, nome: true, email: true, role: true, telefone: true, ativo: true },
  })

  return NextResponse.json(usuario)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  try {
    const usuario = await getUsuarioOrThrow(userId)
  } catch { return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }) }

  const userRole = session.user.role
  const sessionIdUnidade = session.user.idUnidade

  const target = await prisma.usuario.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (userRole !== "Master") {
    if (target.idUnidade !== sessionIdUnidade) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    await prisma.usuario.delete({ where: { id: userId } })
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json({ error: "Usuário possui registros vinculados. Remova os vínculos antes de excluir." }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
