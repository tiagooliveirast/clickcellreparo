import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateOSId } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const ordens = await prisma.ordemServico.findMany({
    where: userRole !== "Master" ? { idUnidade } : undefined,
    include: {
      aparelho: {
        include: {
          cliente: {
            select: { id: true, nomeCompleto: true, whatsapp: true, enderecoRua: true, enderecoNumero: true, enderecoBairro: true, enderecoCidade: true },
          },
        },
      },
      unidade: {
        select: { nomeFantasia: true, slugSubdominio: true },
      },
    } as any,
    orderBy: { dataAbertura: "desc" },
  })

  const ordensSerialized = ordens.map((o: any) => ({
    ...o,
    precoOrcadoCliente: Number(o.precoOrcadoCliente) || null,
    custoPeca: Number(o.custoPeca) || null,
    custoMaoObraTecnico: Number(o.custoMaoObraTecnico) || null,
    cliente: o.aparelho?.cliente || null,
    aparelho: o.aparelho ? { marca: o.aparelho.marca, modelo: o.aparelho.modelo, cor: o.aparelho.cor, imeiSerial: o.aparelho.imeiSerial } : null,
  }))

  return NextResponse.json(ordensSerialized)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { idUnidade, idAparelho, idTecnicoResponsavel, idMotoboyResponsavel, sintomaReclamado, precoOrcadoCliente, custoPeca, custoMaoObraTecnico, fotosChecklistEntrada } = body

  if (!idUnidade || !idAparelho || !sintomaReclamado) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const userRole = session.user.role
  const sessionIdUnidade = session.user.idUnidade

  if (userRole !== "Master" && idUnidade !== sessionIdUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  let idOS = generateOSId()
  let tentativas = 0
  while (await prisma.ordemServico.findUnique({ where: { idOS } })) {
    idOS = generateOSId()
    tentativas++
    if (tentativas > 10) return NextResponse.json({ error: "Erro ao gerar ID" }, { status: 500 })
  }

  const ordem = await prisma.ordemServico.create({
    data: {
      idOS,
      idUnidade,
      idAparelho,
      idTecnicoResponsavel,
      idMotoboyResponsavel,
      sintomaReclamado,
      precoOrcadoCliente: precoOrcadoCliente !== undefined ? precoOrcadoCliente : undefined,
      custoPeca: custoPeca !== undefined ? custoPeca : undefined,
      custoMaoObraTecnico: custoMaoObraTecnico !== undefined ? custoMaoObraTecnico : undefined,
      fotosChecklistEntrada: fotosChecklistEntrada || [],
    },
  })

  const ordemSerialized = {
    ...ordem,
    precoOrcadoCliente: ordem.precoOrcadoCliente ? Number(ordem.precoOrcadoCliente) : null,
    custoPeca: ordem.custoPeca ? Number(ordem.custoPeca) : null,
    custoMaoObraTecnico: ordem.custoMaoObraTecnico ? Number(ordem.custoMaoObraTecnico) : null,
  }

  return NextResponse.json(ordemSerialized, { status: 201 })
}
