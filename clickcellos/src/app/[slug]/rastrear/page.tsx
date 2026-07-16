"use client"

import { useState } from "react"
import { FiSmartphone, FiSearch, FiPackage } from "react-icons/fi"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Spinner } from "@/components/ui/Spinner"
import { Badge } from "@/components/ui/Badge"
import { formatDateTime } from "@/lib/utils"
import { STATUS_OS_LABELS } from "@/types"
import type { StatusOS } from "@/types"

interface StatusLog {
  statusAnterior: StatusOS
  statusNovo: StatusOS
  timestamp: string
}

interface Resultado {
  idOS: string
  statusOS: StatusOS
  dataAbertura: string
  dataPrevisaoEntrega: string | null
  sintomaReclamado: string
  logs: StatusLog[]
  cliente?: { nomeCompleto: string }
  aparelho?: { marca: string; modelo: string }
}

export default function RastrearPage() {
  const params = useParams()
  const slug = params.slug as string
  const [query, setQuery] = useState("")
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setResultado(null)
    try {
      const res = await fetch("/api/public/rastrear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idOS: query.trim(), slug }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Ordem não encontrada")
        return
      }
      setResultado(await res.json())
    } catch {
      setError("Erro ao conectar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-center gap-3 border-b border-gray-200 bg-white px-6 py-5">
        <FiSmartphone size={28} className="text-blue-600" />
        <Link href={`/${slug}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          Click Cell
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <FiPackage size={30} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Rastrear O.S.</h2>
            <p className="mt-1 text-sm text-gray-500">
              Informe o código da sua Ordem de Serviço
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: OS-2026-1234"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              icon={<FiSearch size={18} />}
            />
            <Button onClick={handleSearch} loading={loading}>
              Buscar
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{resultado.idOS}</h3>
                  <Badge status={resultado.statusOS} />
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-gray-500">Cliente:</span> {resultado.cliente?.nomeCompleto}</p>
                  <p><span className="text-gray-500">Aparelho:</span> {resultado.aparelho?.marca} {resultado.aparelho?.modelo}</p>
                  <p><span className="text-gray-500">Problema:</span> {resultado.sintomaReclamado}</p>
                  <p><span className="text-gray-500">Abertura:</span> {formatDateTime(resultado.dataAbertura)}</p>
                  {resultado.dataPrevisaoEntrega && (
                    <p><span className="text-gray-500">Previsão:</span> {formatDateTime(resultado.dataPrevisaoEntrega)}</p>
                  )}
                </div>
              </Card>

              <Card>
                <h4 className="mb-3 font-semibold text-gray-900">Andamento</h4>
                <div className="space-y-3">
                  {resultado.logs && resultado.logs.length > 0 ? (
                    resultado.logs.map((log, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-gray-900">
                            {STATUS_OS_LABELS[log.statusAnterior]} → {STATUS_OS_LABELS[log.statusNovo]}
                          </p>
                          <p className="text-xs text-gray-400">{formatDateTime(log.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Nenhuma atualização disponível</p>
                  )}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <p className="text-gray-900 font-medium">{STATUS_OS_LABELS[resultado.statusOS]} <span className="text-gray-400 font-normal">(atual)</span></p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
