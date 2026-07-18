import { notFound } from "next/navigation"
import { FiSmartphone } from "react-icons/fi"
import Link from "next/link"
import { SolicitarColetaForm } from "@/components/publico/SolicitarColetaForm"
import { getUnidadeBySlug } from "@/lib/public-db"

interface UnidadeData {
  nomeFantasia: string
  whatsappContato: string
  statusContrato: string
}

async function getUnidade(slug: string): Promise<UnidadeData | null> {
  try {
    const unidade = await getUnidadeBySlug(slug)
    if (!unidade) return null
    return {
      nomeFantasia: unidade.nomeFantasia,
      whatsappContato: unidade.whatsappContato,
      statusContrato: unidade.statusContrato,
    }
  } catch {
    return null
  }
}

export default async function SolicitarColetaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const unidade = await getUnidade(slug)

  if (!unidade || unidade.statusContrato === "Bloqueado") {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-center gap-3 border-b border-gray-200 bg-white px-6 py-5">
        <FiSmartphone size={28} className="text-blue-600" />
        <Link href={`/${slug}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          {unidade.nomeFantasia}
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Solicitar Coleta
          </h2>
          <SolicitarColetaForm slug={slug} />
        </div>
      </main>
    </div>
  )
}
