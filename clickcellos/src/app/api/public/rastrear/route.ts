import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { consulta } = body as { consulta: string }

  if (!consulta) {
    return NextResponse.json({ error: "Campo consulta é obrigatório" }, { status: 400 })
  }

  const isOS = consulta.startsWith("OS-")

  let ordem: any

  if (isOS) {
    ordem = await prisma.ordemServico.findFirst({
      where: { idOS: consulta },
      include: {
        aparelho: {
          include: {
            cliente: {
              select: { nomeCompleto: true, whatsapp: true },
            },
          },
        },
        unidade: {
          select: { nomeFantasia: true, slugSubdominio: true, whatsappContato: true },
        },
      } as any,
    })
  } else {
    const clientes = await prisma.cliente.findMany({
      where: { whatsapp: { equals: consulta } },
      select: { id: true },
    })

    if (clientes.length === 0) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
    }

    const aparelhos = await prisma.aparelho.findMany({
      where: { idCliente: { in: clientes.map((c: any) => c.id) } },
      select: { id: true },
    })

    ordem = await prisma.ordemServico.findFirst({
      where: { idAparelho: { in: aparelhos.map((a: any) => a.id) } },
      include: {
        aparelho: {
          include: {
            cliente: {
              select: { nomeCompleto: true, whatsapp: true },
            },
          },
        },
        unidade: {
          select: { nomeFantasia: true, slugSubdominio: true, whatsappContato: true },
        },
      } as any,
      orderBy: { dataAbertura: "desc" },
    })
  }

  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  const resultado = {
    ...ordem,
    precoOrcadoCliente: Number(ordem.precoOrcadoCliente) || null,
    custoPeca: Number(ordem.custoPeca) || null,
    custoMaoObraTecnico: Number(ordem.custoMaoObraTecnico) || null,
    cliente: ordem.aparelho?.cliente || null,
  }

  return NextResponse.json(resultado)
}
