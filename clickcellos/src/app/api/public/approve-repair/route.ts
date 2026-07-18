import { NextResponse } from "next/server"
import { getOrdemServico, updateOrdemStatus } from "@/lib/public-db"

export async function POST(request: Request) {
  const body = await request.json()
  const { idOS, confirmacao } = body as { idOS: string; confirmacao: string }

  if (!idOS || !confirmacao) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  if (confirmacao !== idOS) {
    return NextResponse.json({ error: "Confirmação inválida" }, { status: 400 })
  }

  const ordem = await getOrdemServico(idOS)
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  const statusAtual = ordem.status_os ?? ordem.statusOS
  if (statusAtual !== "AguardandoCliente") {
    return NextResponse.json({ error: `Não é possível aprovar o reparo no status ${statusAtual}` }, { status: 400 })
  }

  const updated = await updateOrdemStatus(idOS, "NaBancada", statusAtual, 0)

  return NextResponse.json({
    ...updated,
    precoOrcadoCliente: updated.preco_orcado_cliente ? Number(updated.preco_orcado_cliente) : updated.precoOrcadoCliente ? Number(updated.precoOrcadoCliente) : null,
    custoPeca: updated.custo_peca ? Number(updated.custo_peca) : updated.custoPeca ? Number(updated.custoPeca) : null,
    custoMaoObraTecnico: updated.custo_mao_obra_tecnico ? Number(updated.custo_mao_obra_tecnico) : updated.custoMaoObraTecnico ? Number(updated.custoMaoObraTecnico) : null,
  })
}
