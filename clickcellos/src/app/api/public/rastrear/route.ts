import { NextResponse } from "next/server"
import { getOrdemServico, getClienteByWhatsapp, getAparelhosByClienteIds, getOrdemByAparelhoIds } from "@/lib/public-db"

interface OrdemResult {
  idOS?: string
  id_os?: string
  statusOS?: string
  status_os?: string
  precoOrcadoCliente?: number | string | null
  preco_orcado_cliente?: number | string | null
  custoPeca?: number | string | null
  custo_peca?: number | string | null
  custoMaoObraTecnico?: number | string | null
  custo_mao_obra_tecnico?: number | string | null
  aparelho?: {
    cliente?: { nomeCompleto?: string; whatsapp?: string }
  } | null
  [key: string]: unknown
}

export async function POST(request: Request) {
  const body = await request.json()
  const { consulta } = body as { consulta: string }

  if (!consulta) {
    return NextResponse.json({ error: "Campo consulta é obrigatório" }, { status: 400 })
  }

  const isOS = consulta.startsWith("OS-")

  let ordem: OrdemResult | null

  if (isOS) {
    ordem = await getOrdemServico(consulta) as OrdemResult | null
  } else {
    const clientes = await getClienteByWhatsapp(consulta)

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
    }

    const aparelhos = await getAparelhosByClienteIds(clientes.map((c: { id: number }) => c.id))

    if (!aparelhos || aparelhos.length === 0) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
    }

    ordem = await getOrdemByAparelhoIds(aparelhos.map((a: { id: number }) => a.id)) as OrdemResult | null
  }

  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  const resultado = {
    ...ordem,
    precoOrcadoCliente: Number(ordem.preco_orcado_cliente ?? ordem.precoOrcadoCliente) || null,
    custoPeca: Number(ordem.custo_peca ?? ordem.custoPeca) || null,
    custoMaoObraTecnico: Number(ordem.custo_mao_obra_tecnico ?? ordem.custoMaoObraTecnico) || null,
    cliente: ordem.aparelho?.cliente || null,
  }

  return NextResponse.json(resultado)
}
