"use client"

import Link from "next/link"
import { FaWhatsapp } from "react-icons/fa6"
import { FiClipboard, FiSearch } from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

interface LandingPageProps {
  unidade: {
    nomeFantasia: string
    whatsappContato: string
    chavePixPadrao: string | null
    slugSubdominio: string
  } | null
  error?: string
}

export function LandingPage({ unidade, error }: LandingPageProps) {
  if (error || !unidade) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="mt-2 text-lg text-gray-500">
            {error || "Unidade não encontrada"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Verifique o link ou entre em contato com a franquia.
          </p>
        </div>
      </div>
    )
  }

  const waUrl = `https://wa.me/${unidade.whatsappContato.replace(/\D/g, "")}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-bold text-white">Click Cell</span>
          <span className="text-sm text-blue-200">{unidade.nomeFantasia}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {unidade.nomeFantasia}
          </h1>
          <p className="mt-4 text-xl text-blue-200">
            Conserto Rápido e Garantido
          </p>
          <p className="mt-2 text-lg text-blue-300">
            Retirada, Orçamento e Entrega com Custo Zero
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-green-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl hover:scale-105"
          >
            <FaWhatsapp size={28} />
            Fale Conosco pelo WhatsApp
          </a>
        </div>

        {/* Pix Section */}
        {unidade.chavePixPadrao && (
          <Card className="mx-auto mt-12 max-w-md text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Pagamento via PIX
            </h2>
            <p className="mt-2 break-all rounded-lg bg-gray-100 p-3 font-mono text-sm text-gray-700">
              {unidade.chavePixPadrao}
            </p>
          </Card>
        )}

        {/* CTA Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href={`/${unidade.slugSubdominio}/solicitar-coleta`}
            className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FiClipboard size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Solicitar Coleta Grátis
                </h3>
                <p className="text-sm text-gray-500">
                  Solicite a retirada do seu aparelho
                </p>
              </div>
            </div>
          </Link>

          <Link
            href={`/${unidade.slugSubdominio}/rastrear`}
            className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FiSearch size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Rastrear O.S.
                </h3>
                <p className="text-sm text-gray-500">
                  Acompanhe o status do seu reparo
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Links Button for small screens */}
        <div className="mt-8 flex flex-col gap-3 md:hidden">
          <Link href={`/${unidade.slugSubdominio}/solicitar-coleta`}>
            <Button className="w-full" size="lg">
              <FiClipboard size={18} />
              Solicitar Coleta Grátis
            </Button>
          </Link>
          <Link href={`/${unidade.slugSubdominio}/rastrear`}>
            <Button className="w-full" variant="secondary" size="lg">
              <FiSearch size={18} />
              Rastrear O.S.
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-6 text-center">
        <p className="text-sm text-blue-300">
          {unidade.nomeFantasia} &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
