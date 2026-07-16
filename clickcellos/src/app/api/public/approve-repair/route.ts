import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { idOS, confirmacao } = body as { idOS: string; confirmacao: string }

  if (!idOS || !confirmacao) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  if (confirmacao !== idOS) {
    return NextResponse.json({ error: "Confirmação inválida" }, { status: 400 })
  }

  const ordem = await prisma.ordemServico.findUnique({ where: { idOS } })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (ordem.statusOS !== "AguardandoCliente") {
    return NextResponse.json({ error: `Não é possível aprovar o reparo no status ${ordem.statusOS}` }, { status: 400 })
  }

  const masterUser = await prisma.usuario.findFirst({
    where: { role: "Master" },
    select: { id: true },
  })

  const alteradoPor = masterUser?.id ?? 0

  const [updated] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { idOS },
      data: {
        statusOS: "NaBancada",
        ultimaAtualizacaoStatus: new Date(),
      },
    }),
    prisma.statusLog.create({
      data: {
        idOS: ordem.idOS,
        statusAnterior: ordem.statusOS,
        statusNovo: "NaBancada",
        alteradoPor,
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
