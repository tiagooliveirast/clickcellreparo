import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const unidade = await prisma.unidadeFranquia.findUnique({
    where: { slugSubdominio: slug },
    select: {
      nomeFantasia: true,
      whatsappContato: true,
      chavePixPadrao: true,
      statusContrato: true,
      enderecoUnidade: true,
    },
  })

  if (!unidade) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })

  return NextResponse.json(unidade)
}
