"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiClipboard, FiTrendingUp, FiDollarSign, FiPercent, FiPlus } from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS } from "@/types"

interface Ordem {
  id: number
  idOS: string
  statusOS: StatusOS
  dataAbertura: string
  precoOrcadoCliente: number | null
  custoPeca: number | null
  custoMaoObraTecnico: number | null
  cliente?: { nomeCompleto: string; whatsapp: string }
  aparelho?: { marca: string; modelo: string }
}

export default function FranqueadoDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [loading, setLoading] = useState(true)

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
    } catch {
      setOrdens([])
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const ordensHoje = ordens.filter(
    (o) => new Date(o.dataAbertura).toDateString() === now.toDateString()
  )
  const ordensMes = ordens.filter(
    (o) =>
      new Date(o.dataAbertura).getMonth() === now.getMonth() &&
      new Date(o.dataAbertura).getFullYear() === now.getFullYear()
  )
  const faturamentoMes = ordensMes.reduce((acc, o) => acc + (o.precoOrcadoCliente || 0), 0)
  const custoMes = ordensMes.reduce(
    (acc, o) => acc + (o.custoPeca || 0) + (o.custoMaoObraTecnico || 0), 0
  )
  const margemMedia = faturamentoMes > 0
    ? ((faturamentoMes - custoMes) / faturamentoMes) * 100
    : 0

  const statusCount = {} as Record<string, number>
  ordens.forEach((o) => {
    statusCount[o.statusOS] = (statusCount[o.statusOS] || 0) + 1
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {session?.user?.nomeUnidade || "Dashboard"}
        </h2>
        <Button onClick={() => router.push("/ordens/nova")}>
          <FiPlus size={18} /> Nova O.S.
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <FiClipboard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">O.S. Hoje</p>
              <p className="text-xl font-bold text-gray-900">{ordensHoje.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">O.S. Mês</p>
              <p className="text-xl font-bold text-gray-900">{ordensMes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Faturamento Mês</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(faturamentoMes)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FiPercent size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Margem Média</p>
              <p className="text-xl font-bold text-gray-900">{margemMedia.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-gray-900">Status</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(STATUS_OS_LABELS).map(([key, label]) => {
              const count = statusCount[key] || 0
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Últimas O.S.</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {ordens.slice(0, 10).length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Nenhuma ordem encontrada</p>
            ) : (
              ordens.slice(0, 10).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{o.idOS}</p>
                    <p className="text-gray-500">{o.cliente?.nomeCompleto || "-"}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{STATUS_OS_LABELS[o.statusOS]}</p>
                    <p>{formatCurrency(o.precoOrcadoCliente)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
