import { notFound } from "next/navigation"
import { FiSmartphone, FiMapPin, FiMessageCircle } from "react-icons/fi"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

interface UnidadeData {
  nomeFantasia: string
  whatsappContato: string
  chavePixPadrao: string | null
  statusContrato: string
  enderecoUnidade: string | null
}

async function getUnidade(slug: string): Promise<UnidadeData | null> {
  try {
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
    return unidade
  } catch {
    return null
  }
}

export default async function PublicLandingPage({
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
        <h1 className="text-xl font-bold text-gray-900">{unidade.nomeFantasia}</h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-200">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <FiSmartphone size={36} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {unidade.nomeFantasia}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Assistência Técnica Especializada
            </p>
          </div>

          {unidade.enderecoUnidade && (
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <FiMapPin size={20} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-sm text-gray-700">{unidade.enderecoUnidade}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/${unidade.whatsappContato.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 text-white font-medium shadow-sm hover:bg-green-700 transition-colors"
            >
              <FiMessageCircle size={22} />
              Fale Conosco no WhatsApp
            </a>
          </div>

          <div className="space-y-3">
            <Link
              href={`/${slug}/solicitar-coleta`}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-white font-medium shadow-sm hover:bg-blue-700 transition-colors"
            >
              Solicitar Coleta
            </Link>
            <Link
              href={`/${slug}/rastrear`}
              className="flex w-full items-center justify-center rounded-xl border border-blue-600 bg-white px-6 py-4 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Rastrear O.S.
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Click Cell OS - {unidade.nomeFantasia}
      </footer>
    </div>
  )
}
