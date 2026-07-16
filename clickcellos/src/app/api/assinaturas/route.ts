import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const assinaturas = await prisma.assinaturaDigital.findMany({
    where: userRole !== "Master" ? { ordem: { idUnidade } } : undefined,
    include: {
      ordem: { select: { idOS: true } },
      motoboy: { select: { nome: true } },
    },
    orderBy: { dataHora: "desc" },
  })

  return NextResponse.json(assinaturas)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { idOS, idMotoboy, urlAssinatura, gpsLatitude, gpsLongitude, ipConexao, modeloDispositivo } = body

  if (!idOS || !idMotoboy || !urlAssinatura) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const ordem = await prisma.ordemServico.findUnique({ where: { idOS } })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (session.user.role !== "Master" && ordem.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const assinatura = await prisma.assinaturaDigital.create({
    data: { idOS, idMotoboy, urlAssinatura, gpsLatitude, gpsLongitude, ipConexao, modeloDispositivo },
  })

  return NextResponse.json(assinatura, { status: 201 })
}
