import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const aparelhos = await prisma.aparelho.findMany({
    where: userRole !== "Master" ? { cliente: { idUnidade } } : undefined,
    include: { cliente: { select: { nomeCompleto: true, whatsapp: true, idUnidade: true } } },
    orderBy: { id: "desc" },
  })

  return NextResponse.json(aparelhos)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { idCliente, marca, modelo, cor, imeiSerial } = body

  if (!idCliente || !marca || !modelo) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: idCliente } })
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (imeiSerial) {
    const existente = await prisma.aparelho.findUnique({ where: { imeiSerial } })
    if (existente) return NextResponse.json({ error: "IMEI/Serial já cadastrado" }, { status: 409 })
  }

  const aparelho = await prisma.aparelho.create({ data: { idCliente, marca, modelo, cor, imeiSerial } })

  return NextResponse.json(aparelho, { status: 201 })
}
