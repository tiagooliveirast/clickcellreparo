import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOSId } from "@/lib/utils"

export async function POST(request: Request) {
  const body = await request.json()
  const { slug, nomeCompleto, whatsapp, enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoPontoRef, marca, modelo, cor, imeiSerial, sintomaReclamado } = body

  if (!slug || !nomeCompleto || !whatsapp || !enderecoRua || !enderecoNumero || !enderecoBairro || !enderecoCidade || !marca || !modelo || !sintomaReclamado) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const unidade = await prisma.unidadeFranquia.findUnique({ where: { slugSubdominio: slug } })
  if (!unidade) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })

  if (unidade.statusContrato !== "Ativo") {
    return NextResponse.json({ error: "Unidade não está ativa" }, { status: 403 })
  }

  let idOS = generateOSId()
  let tentativas = 0
  while (await prisma.ordemServico.findUnique({ where: { idOS } })) {
    idOS = generateOSId()
    tentativas++
    if (tentativas > 10) return NextResponse.json({ error: "Erro ao gerar ID" }, { status: 500 })
  }

  const resultado = await prisma.$transaction(async (tx: any) => {
    let cliente = await tx.cliente.findFirst({
      where: { idUnidade: unidade.id, whatsapp },
    })

    if (!cliente) {
      cliente = await tx.cliente.create({
        data: {
          idUnidade: unidade.id,
          nomeCompleto,
          whatsapp,
          enderecoRua,
          enderecoNumero,
          enderecoBairro,
          enderecoCidade,
          enderecoPontoRef,
          origemLead: "PassagemNaLoja",
        },
      })
    }

    const aparelho = await tx.aparelho.create({
      data: {
        idCliente: cliente.id,
        marca,
        modelo,
        cor,
        imeiSerial,
      },
    })

    const ordem = await tx.ordemServico.create({
      data: {
        idOS,
        idUnidade: unidade.id,
        idAparelho: aparelho.id,
        sintomaReclamado,
        statusOS: "Recebido",
      },
    })

    return { idOS: ordem.idOS }
  })

  return NextResponse.json({ success: true, idOS: resultado.idOS }, { status: 201 })
}
