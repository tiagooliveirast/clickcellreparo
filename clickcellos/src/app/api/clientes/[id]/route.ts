import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const clienteId = parseInt(id)
  if (isNaN(clienteId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: { aparelhos: true, unidade: { select: { nomeFantasia: true } } },
  })
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json(cliente)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const clienteId = parseInt(id)
  if (isNaN(clienteId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { nomeCompleto, whatsapp, enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoPontoRef, dataAniversario, origemLead, observacoesInternas } = body

  const updated = await prisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...(nomeCompleto !== undefined && { nomeCompleto }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(enderecoRua !== undefined && { enderecoRua }),
      ...(enderecoNumero !== undefined && { enderecoNumero }),
      ...(enderecoBairro !== undefined && { enderecoBairro }),
      ...(enderecoCidade !== undefined && { enderecoCidade }),
      ...(enderecoPontoRef !== undefined && { enderecoPontoRef }),
      ...(dataAniversario !== undefined && { dataAniversario: dataAniversario ? new Date(dataAniversario) : null }),
      ...(origemLead !== undefined && { origemLead }),
      ...(observacoesInternas !== undefined && { observacoesInternas }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const clienteId = parseInt(id)
  if (isNaN(clienteId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  if (session.user.role !== "Master" && cliente.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  await prisma.cliente.delete({ where: { id: clienteId } })

  return NextResponse.json({ success: true })
}
