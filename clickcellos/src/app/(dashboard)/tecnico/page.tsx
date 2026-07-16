"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Spinner } from "@/components/ui/Spinner"
import { cn } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS, STATUS_OS_ORDER } from "@/types"

interface Ordem {
  id: number
  idOS: string
  statusOS: StatusOS
  sintomaReclamado: string
  cliente?: { nomeCompleto: string; whatsapp: string }
  aparelho?: { marca: string; modelo: string; cor: string }
  unidade?: { nomeFantasia: string }
}

const STATUS_TABS: StatusOS[] = [
  "Recebido",
  "Triagem",
  "AguardandoOrcamento",
  "AguardandoCliente",
  "AguardandoPeca",
  "NaBancada",
  "EmTestes",
  "Higienizacao",
  "ProntoParaEntrega",
  "Finalizado",
]

export default function TecnicoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<StatusOS | "Todas">("Todas")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetchData()
  }, [status, session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ordens-servico")
      if (res.ok) setOrdens(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdens = activeTab === "Todas"
    ? ordens
    : ordens.filter((o) => o.statusOS === activeTab)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Bancada</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("Todas")}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "Todas"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Todas
        </button>
        {STATUS_TABS.map((s) => {
          const count = ordens.filter((o) => o.statusOS === s).length
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeTab === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {STATUS_OS_LABELS[s]} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOrdens.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            Nenhuma ordem de serviço encontrada
          </div>
        ) : (
          filteredOrdens.map((o) => (
            <Card
              key={o.id}
              onClick={() => router.push(`/ordens/${o.idOS}`)}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-gray-500">{o.idOS}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  o.statusOS === "Recebido" && "bg-gray-100 text-gray-700",
                  o.statusOS === "Triagem" && "bg-yellow-100 text-yellow-700",
                  o.statusOS === "NaBancada" && "bg-blue-100 text-blue-700",
                  o.statusOS === "ProntoParaEntrega" && "bg-green-100 text-green-700",
                  o.statusOS === "Finalizado" && "bg-emerald-100 text-emerald-800",
                )}>
                  {STATUS_OS_LABELS[o.statusOS]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {o.aparelho?.marca} {o.aparelho?.modelo}
                </p>
                <p className="text-sm text-gray-500">{o.cliente?.nomeCompleto}</p>
              </div>
              {o.sintomaReclamado && (
                <p className="line-clamp-2 text-xs text-gray-400">
                  {o.sintomaReclamado}
                </p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
