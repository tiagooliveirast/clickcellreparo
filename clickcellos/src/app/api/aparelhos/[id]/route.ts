import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const aparelhoId = parseInt(id)
  if (isNaN(aparelhoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const aparelho = await prisma.aparelho.findUnique({
    where: { id: aparelhoId },
    include: { cliente: { select: { nomeCompleto: true, whatsapp: true, idUnidade: true } } },
  })
  if (!aparelho) return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && aparelho.cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json(aparelho)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const aparelhoId = parseInt(id)
  if (isNaN(aparelhoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const aparelho = await prisma.aparelho.findUnique({
    where: { id: aparelhoId },
    include: { cliente: { select: { idUnidade: true } } },
  })
  if (!aparelho) return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && aparelho.cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { idCliente, marca, modelo, cor, imeiSerial } = body

  if (imeiSerial) {
    const existente = await prisma.aparelho.findFirst({
      where: { imeiSerial, NOT: { id: aparelhoId } },
    })
    if (existente) return NextResponse.json({ error: "IMEI/Serial já cadastrado" }, { status: 409 })
  }

  const updated = await prisma.aparelho.update({
    where: { id: aparelhoId },
    data: {
      ...(idCliente !== undefined && { idCliente }),
      ...(marca !== undefined && { marca }),
      ...(modelo !== undefined && { modelo }),
      ...(cor !== undefined && { cor }),
      ...(imeiSerial !== undefined && { imeiSerial }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const aparelhoId = parseInt(id)
  if (isNaN(aparelhoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const aparelho = await prisma.aparelho.findUnique({
    where: { id: aparelhoId },
    include: { cliente: { select: { idUnidade: true } } },
  })
  if (!aparelho) return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && aparelho.cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  await prisma.aparelho.delete({ where: { id: aparelhoId } })

  return NextResponse.json({ success: true })
}
