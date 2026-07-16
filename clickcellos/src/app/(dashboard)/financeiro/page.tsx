"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiDollarSign, FiTrendingUp, FiPercent, FiDownload, FiCalendar } from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Spinner } from "@/components/ui/Spinner"
import { Table } from "@/components/ui/Table"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { METODO_PAGAMENTO_LABELS } from "@/types"
import type { Column } from "@/components/ui/Table"

interface Ordem {
  id: number
  idOS: string
  dataAbertura: string
  dataFechamento: string | null
  precoOrcadoCliente: number | null
  custoPeca: number | null
  custoMaoObraTecnico: number | null
  metodoPagamentoRegistro: string
  cliente?: { nomeCompleto: string }
  unidade?: { nomeFantasia: string }
  statusOS: string
}

type Periodo = "hoje" | "semana" | "mes" | "custom"

export default function FinanceiroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>("mes")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

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

  const filteredOrdens = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let start: Date
    let end: Date = now

    switch (periodo) {
      case "hoje":
        start = startOfDay
        break
      case "semana":
        start = startOfWeek
        break
      case "mes":
        start = startOfMonth
        break
      case "custom":
        start = customStart ? new Date(customStart) : startOfMonth
        end = customEnd ? new Date(customEnd + "T23:59:59") : now
        break
      default:
        start = startOfMonth
    }

    return ordens.filter((o) => {
      const d = new Date(o.dataAbertura)
      return d >= start && d <= end
    })
  }, [ordens, periodo, customStart, customEnd])

  const receitaTotal = filteredOrdens.reduce((acc, o) => acc + (o.precoOrcadoCliente || 0), 0)
  const custoTotal = filteredOrdens.reduce(
    (acc, o) => acc + (o.custoPeca || 0) + (o.custoMaoObraTecnico || 0), 0
  )
  const lucroLiquido = receitaTotal - custoTotal
  const margemMedia = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0

  const pagamentoCount: Record<string, number> = {}
  const pagamentoValor: Record<string, number> = {}
  filteredOrdens.forEach((o) => {
    const metodo = o.metodoPagamentoRegistro || "AindaNaoPago"
    pagamentoCount[metodo] = (pagamentoCount[metodo] || 0) + 1
    pagamentoValor[metodo] = (pagamentoValor[metodo] || 0) + (o.precoOrcadoCliente || 0)
  })

  const exportData = () => {
    const rows = filteredOrdens.map((o) => [
      o.idOS,
      o.cliente?.nomeCompleto || "-",
      formatCurrency(o.precoOrcadoCliente),
      o.metodoPagamentoRegistro,
      formatDateTime(o.dataAbertura),
    ])
    const csv = [["OS", "Cliente", "Valor", "Método", "Data"], ...rows]
      .map((r) => r.join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financeiro-${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: Column<Ordem>[] = [
    { key: "idOS", header: "OS", render: (o) => <span className="font-mono text-xs">{o.idOS}</span> },
    { key: "cliente", header: "Cliente", render: (o) => o.cliente?.nomeCompleto || "-" },
    { key: "precoOrcadoCliente", header: "Valor", render: (o) => formatCurrency(o.precoOrcadoCliente) },
    { key: "metodoPagamentoRegistro", header: "Método", render: (o) => METODO_PAGAMENTO_LABELS[o.metodoPagamentoRegistro as keyof typeof METODO_PAGAMENTO_LABELS] || o.metodoPagamentoRegistro },
    { key: "dataAbertura", header: "Data", render: (o) => formatDateTime(o.dataAbertura) },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Financeiro</h2>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: "hoje", label: "Hoje" },
              { value: "semana", label: "Esta Semana" },
              { value: "mes", label: "Este Mês" },
              { value: "custom", label: "Personalizado" },
            ]}
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
          />
          {periodo === "custom" && (
            <div className="flex items-center gap-2">
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className="text-gray-400">até</span>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          )}
          <Button variant="secondary" onClick={exportData}>
            <FiDownload size={18} /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Receita Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(receitaTotal)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lucro Líquido</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(lucroLiquido)}</p>
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

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Formas de Pagamento</h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(METODO_PAGAMENTO_LABELS).map(([key, label]) => {
            const count = pagamentoCount[key] || 0
            const valor = pagamentoValor[key] || 0
            const maxValor = Math.max(...Object.values(pagamentoValor), 1)
            const barWidth = maxValor > 0 ? (valor / maxValor) * 100 : 0
            return (
              <div key={key} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(valor)}</p>
                <p className="text-xs text-gray-400">{count} pedido(s)</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-0">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Pagamentos Recentes</h3>
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            data={filteredOrdens.slice(0, 20)}
            keyExtractor={(o) => o.id}
            emptyMessage="Nenhum pagamento encontrado no período"
          />
        </div>
      </Card>
    </div>
  )
}
