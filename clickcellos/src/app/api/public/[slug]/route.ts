import { NextResponse } from "next/server"
import { getUnidadeBySlug } from "@/lib/public-db"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const unidade = await getUnidadeBySlug(slug)

  if (!unidade) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })

  return NextResponse.json(unidade)
}
