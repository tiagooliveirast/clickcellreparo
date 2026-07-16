import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const clientes = await prisma.cliente.findMany({
    where: userRole !== "Master" ? { idUnidade } : undefined,
    include: { _count: { select: { aparelhos: true } } },
    orderBy: { nomeCompleto: "asc" },
  })

  return NextResponse.json(clientes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { idUnidade, nomeCompleto, whatsapp, enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoPontoRef, dataAniversario, origemLead, observacoesInternas } = body

  if (!idUnidade || !nomeCompleto || !whatsapp) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const userRole = session.user.role
  const sessionIdUnidade = session.user.idUnidade

  if (userRole !== "Master" && idUnidade !== sessionIdUnidade) {
    return NextResponse.json({ error: "Você só pode criar clientes na sua unidade" }, { status: 403 })
  }

  const cliente = await prisma.cliente.create({
    data: {
      idUnidade,
      nomeCompleto,
      whatsapp,
      enderecoRua,
      enderecoNumero,
      enderecoBairro,
      enderecoCidade,
      enderecoPontoRef,
      dataAniversario: dataAniversario ? new Date(dataAniversario) : undefined,
      origemLead,
      observacoesInternas,
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}
