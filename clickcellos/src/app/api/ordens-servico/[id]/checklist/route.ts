import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const ordem = await prisma.ordemServico.findFirst({
    where: { OR: [{ idOS: id }, { id: parseInt(id) || undefined }] },
  })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })

  if (session.user.role !== "Master" && ordem.idUnidade !== session.user.idUnidade) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { faceIDBiometria, touchscreen, conexaoWiFi, microfone, altoFalantes, conectorCarga } = body

  const updated = await prisma.ordemServico.update({
    where: { id: ordem.id },
    data: {
      ...(faceIDBiometria !== undefined && { faceIDBiometria }),
      ...(touchscreen !== undefined && { touchscreen }),
      ...(conexaoWiFi !== undefined && { conexaoWiFi }),
      ...(microfone !== undefined && { microfone }),
      ...(altoFalantes !== undefined && { altoFalantes }),
      ...(conectorCarga !== undefined && { conectorCarga }),
    },
  })

  return NextResponse.json(updated)
}
