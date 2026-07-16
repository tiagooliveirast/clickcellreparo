import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canTransition } from "@/lib/utils"
import type { StatusOS } from "@/types"

const TRANSICOES_VALIDAS: Record<string, { valida: (ordem: any) => boolean; mensagem: string }> = {
  Triagem: {
    valida: (ordem) => ordem.fotosChecklistEntrada?.length >= 2,
    mensagem: "São necessárias pelo menos 2 fotos no checklist de entrada para iniciar a Triagem",
  },
  EmTestes: {
    valida: () => true,
    mensagem: "",
  },
  Higienizacao: {
    valida: (ordem) =>
      ordem.faceIDBiometria === true &&
      ordem.touchscreen === true &&
      ordem.conexaoWiFi === true &&
      ordem.microfone === true &&
      ordem.altoFalantes === true &&
      ordem.conectorCarga === true,
    mensagem: "Todos os itens do checklist de qualidade devem estar aprovados antes de higienizar",
  },
  ProntoParaEntrega: {
    valida: () => true,
    mensagem: "",
  },
  Finalizado: {
    valida: (ordem) => ordem.assinaturas?.length > 0,
    mensagem: "É necessária uma assinatura digital para finalizar a ordem",
  },
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { novoStatus, idUsuario } = body as { novoStatus: StatusOS; idUsuario: number }

  if (!novoStatus || !idUsuario) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const ordem = await prisma.ordemServico.findFirst({
    where: { OR: [{ idOS: id }, { id: parseInt(id) || undefined }] },
    include: { assinaturas: true },
  })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (session.user.role !== "Master" && ordem.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (!canTransition(ordem.statusOS, novoStatus)) {
    return NextResponse.json({
      error: `Transição inválida de ${ordem.statusOS} para ${novoStatus}`,
    }, { status: 400 })
  }

  const regra = TRANSICOES_VALIDAS[novoStatus]
  if (regra && !regra.valida(ordem)) {
    return NextResponse.json({ error: regra.mensagem }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: idUsuario } })
  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const [updated] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { id: ordem.id },
      data: {
        statusOS: novoStatus,
        ultimaAtualizacaoStatus: new Date(),
        ...(novoStatus === "Finalizado" ? { dataFechamento: new Date() } : {}),
      },
    }),
    prisma.statusLog.create({
      data: {
        idOS: ordem.idOS,
        statusAnterior: ordem.statusOS,
        statusNovo: novoStatus,
        alteradoPor: idUsuario,
      },
    }),
  ])

  return NextResponse.json({
    ...updated,
    precoOrcadoCliente: updated.precoOrcadoCliente ? Number(updated.precoOrcadoCliente) : null,
    custoPeca: updated.custoPeca ? Number(updated.custoPeca) : null,
    custoMaoObraTecnico: updated.custoMaoObraTecnico ? Number(updated.custoMaoObraTecnico) : null,
  })
}
