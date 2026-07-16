import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const unidadeId = parseInt(id)
  if (isNaN(unidadeId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  if (session.user.role !== "Master" && session.user.idUnidade !== unidadeId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const unidade = await prisma.unidadeFranquia.findUnique({
    where: { id: unidadeId },
    include: { _count: { select: { usuarios: true, clientes: true, ordensServico: true } } },
  })
  if (!unidade) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })

  return NextResponse.json(unidade)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role !== "Master") return NextResponse.json({ error: "Apenas Master pode editar unidades" }, { status: 403 })

  const { id } = await params
  const unidadeId = parseInt(id)
  if (isNaN(unidadeId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await request.json()
  const { nomeFantasia, slugSubdominio, whatsappContato, chavePixPadrao, statusContrato, enderecoUnidade } = body

  if (slugSubdominio) {
    const existente = await prisma.unidadeFranquia.findFirst({
      where: { slugSubdominio, NOT: { id: unidadeId } },
    })
    if (existente) return NextResponse.json({ error: "Slug já em uso" }, { status: 409 })
  }

  const unidade = await prisma.unidadeFranquia.update({
    where: { id: unidadeId },
    data: {
      ...(nomeFantasia !== undefined && { nomeFantasia }),
      ...(slugSubdominio !== undefined && { slugSubdominio }),
      ...(whatsappContato !== undefined && { whatsappContato }),
      ...(chavePixPadrao !== undefined && { chavePixPadrao }),
      ...(statusContrato !== undefined && { statusContrato }),
      ...(enderecoUnidade !== undefined && { enderecoUnidade }),
    },
  })

  return NextResponse.json(unidade)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role !== "Master") return NextResponse.json({ error: "Apenas Master pode excluir unidades" }, { status: 403 })

  const { id } = await params
  const unidadeId = parseInt(id)
  if (isNaN(unidadeId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  await prisma.unidadeFranquia.delete({ where: { id: unidadeId } })

  return NextResponse.json({ success: true })
}
