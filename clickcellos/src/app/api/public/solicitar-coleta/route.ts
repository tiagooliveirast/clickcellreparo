import { NextResponse } from "next/server"
import { generateOSId } from "@/lib/utils"
import { getUnidadeBySlug, findOrCreateCliente, createAparelho, createOrdemServico, checkOSExists } from "@/lib/public-db"

export async function POST(request: Request) {
  const body = await request.json()
  const { slug, nomeCompleto, whatsapp, enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoPontoRef, marca, modelo, cor, imeiSerial, sintomaReclamado } = body

  if (!slug || !nomeCompleto || !whatsapp || !enderecoRua || !enderecoNumero || !enderecoBairro || !enderecoCidade || !marca || !modelo || !sintomaReclamado) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const unidade = await getUnidadeBySlug(slug)
  if (!unidade) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })

  if (unidade.statusContrato !== "Ativo") {
    return NextResponse.json({ error: "Unidade não está ativa" }, { status: 403 })
  }

  let idOS = generateOSId()
  let tentativas = 0
  while (await checkOSExists(idOS)) {
    idOS = generateOSId()
    tentativas++
    if (tentativas > 10) return NextResponse.json({ error: "Erro ao gerar ID" }, { status: 500 })
  }

  const cliente = await findOrCreateCliente({
    idUnidade: unidade.id,
    nomeCompleto,
    whatsapp,
    enderecoRua,
    enderecoNumero,
    enderecoBairro,
    enderecoCidade,
    enderecoPontoRef,
  })

  const aparelho = await createAparelho({
    idCliente: cliente.id,
    marca,
    modelo,
    cor,
    imeiSerial,
  })

  const ordem = await createOrdemServico({
    idOS,
    idUnidade: unidade.id,
    idAparelho: aparelho.id,
    sintomaReclamado,
  })

  return NextResponse.json({ success: true, idOS: ordem.idOS }, { status: 201 })
}
