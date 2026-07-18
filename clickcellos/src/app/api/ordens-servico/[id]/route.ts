import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const idNum = parseInt(id)

  const ordem = await prisma.ordemServico.findFirst({
    where: isNaN(idNum) ? { idOS: id } : { OR: [{ idOS: id }, { id: idNum }] },
    include: {
      aparelho: {
        include: {
          cliente: {
            select: { id: true, nomeCompleto: true, whatsapp: true, enderecoRua: true, enderecoNumero: true, enderecoBairro: true, enderecoCidade: true },
          },
        },
      },
      unidade: {
        select: { nomeFantasia: true, slugSubdominio: true, whatsappContato: true, chavePixPadrao: true },
      },
      logs: {
        include: {
          usuario: { select: { nome: true } },
        },
      },
      assinaturas: {
        include: {
          motoboy: { select: { nome: true } },
        },
      },
      tecnico: {
        select: { nome: true },
      },
      motoboy: {
        select: { nome: true },
      },
    },
  })

  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (session.user.role !== "Master" && ordem.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const ordemSerialized = {
    ...ordem,
    precoOrcadoCliente: Number(ordem.precoOrcadoCliente) || null,
    custoPeca: Number(ordem.custoPeca) || null,
    custoMaoObraTecnico: Number(ordem.custoMaoObraTecnico) || null,
    cliente: ordem.aparelho?.cliente || null,
    aparelho: ordem.aparelho ? { marca: ordem.aparelho.marca, modelo: ordem.aparelho.modelo, cor: ordem.aparelho.cor, imeiSerial: ordem.aparelho.imeiSerial } : null,
  }

  return NextResponse.json(ordemSerialized)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const idNum = parseInt(id)

  const ordem = await prisma.ordemServico.findFirst({
    where: isNaN(idNum) ? { idOS: id } : { OR: [{ idOS: id }, { id: idNum }] },
  })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (session.user.role !== "Master" && ordem.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { idAparelho, idTecnicoResponsavel, idMotoboyResponsavel, sintomaReclamado, precoOrcadoCliente, custoPeca, custoMaoObraTecnico, metodoPagamentoRegistro, laudoTecnico, dataPrevisaoEntrega, fotosChecklistEntrada } = body

  if (idAparelho !== undefined) {
    const novoAparelho = await prisma.aparelho.findUnique({
      where: { id: idAparelho },
      include: { cliente: { select: { idUnidade: true } } },
    })
    if (!novoAparelho) return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })
    if (session.user.role !== "Master" && novoAparelho.cliente.idUnidade !== session.user.idUnidade) {
      return NextResponse.json({ error: "Aparelho pertence a outra unidade" }, { status: 403 })
    }
  }

  const updated = await prisma.ordemServico.update({
    where: { id: ordem.id },
    data: {
      ...(idAparelho !== undefined && { idAparelho }),
      ...(idTecnicoResponsavel !== undefined && { idTecnicoResponsavel }),
      ...(idMotoboyResponsavel !== undefined && { idMotoboyResponsavel }),
      ...(sintomaReclamado !== undefined && { sintomaReclamado }),
      ...(precoOrcadoCliente !== undefined && { precoOrcadoCliente }),
      ...(custoPeca !== undefined && { custoPeca }),
      ...(custoMaoObraTecnico !== undefined && { custoMaoObraTecnico }),
      ...(metodoPagamentoRegistro !== undefined && { metodoPagamentoRegistro }),
      ...(laudoTecnico !== undefined && { laudoTecnico }),
      ...(dataPrevisaoEntrega !== undefined && { dataPrevisaoEntrega: dataPrevisaoEntrega ? new Date(dataPrevisaoEntrega) : null }),
      ...(fotosChecklistEntrada !== undefined && { fotosChecklistEntrada }),
    },
  })

  return NextResponse.json({
    ...updated,
    precoOrcadoCliente: updated.precoOrcadoCliente ? Number(updated.precoOrcadoCliente) : null,
    custoPeca: updated.custoPeca ? Number(updated.custoPeca) : null,
    custoMaoObraTecnico: updated.custoMaoObraTecnico ? Number(updated.custoMaoObraTecnico) : null,
  })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role !== "Master") return NextResponse.json({ error: "Apenas Master pode excluir ordens" }, { status: 403 })

  const { id } = await params
  const idNum = parseInt(id)

  const ordem = await prisma.ordemServico.findFirst({
    where: isNaN(idNum) ? { idOS: id } : { OR: [{ idOS: id }, { id: idNum }] },
  })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  try {
    await prisma.ordemServico.delete({ where: { id: ordem.id } })
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr?.code === "P2003") {
      return NextResponse.json({ error: "Ordem possui registros vinculados (logs, assinaturas). Remova os vínculos antes de excluir." }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro ao excluir ordem" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
