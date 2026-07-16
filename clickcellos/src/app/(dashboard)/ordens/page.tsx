"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiSearch, FiPlus, FiGrid, FiList } from "react-icons/fi"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table } from "@/components/ui/Table"
import { Spinner } from "@/components/ui/Spinner"
import { formatCurrency, formatDateTime, cn } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS } from "@/types"
import type { Column } from "@/components/ui/Table"

interface Unidade {
  id: number
  nomeFantasia: string
}

interface Ordem {
  id: number
  idOS: string
  statusOS: StatusOS
  dataAbertura: string
  precoOrcadoCliente: number | null
  cliente?: { nomeCompleto: string; whatsapp: string }
  aparelho?: { marca: string; modelo: string }
  unidade?: { nomeFantasia: string; slugSubdominio: string }
  tecnico?: { nome: string }
  motoboy?: { nome: string }
}

export default function OrdensPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [unidadeFilter, setUnidadeFilter] = useState("")
  const [viewMode, setViewMode] = useState<"kanban" | "table">("table")

  const isMaster = session?.user?.role === "Master"

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    loadData()
  }, [status, session, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ordensRes, unidadesRes] = await Promise.all([
        fetch("/api/ordens-servico"),
        isMaster ? fetch("/api/unidades") : Promise.resolve(null),
      ])
      if (ordensRes.ok) setOrdens(await ordensRes.json())
      if (unidadesRes?.ok) setUnidades(await unidadesRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdens = useMemo(() => {
    let result = ordens
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.idOS.toLowerCase().includes(q) ||
          o.cliente?.nomeCompleto?.toLowerCase().includes(q) ||
          o.aparelho?.marca?.toLowerCase().includes(q) ||
          o.aparelho?.modelo?.toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      result = result.filter((o) => o.statusOS === statusFilter)
    }
    if (unidadeFilter && isMaster) {
      result = result.filter((o) => o.unidade?.nomeFantasia === unidadeFilter)
    }
    return result
  }, [ordens, search, statusFilter, unidadeFilter, isMaster])

  const columns: Column<Ordem>[] = [
    { key: "idOS", header: "OS", render: (o) => <span className="font-mono text-xs font-medium">{o.idOS}</span> },
    { key: "cliente", header: "Cliente", render: (o) => o.cliente?.nomeCompleto || "-" },
    { key: "aparelho", header: "Aparelho", render: (o) => o.aparelho ? `${o.aparelho.marca} ${o.aparelho.modelo}` : "-" },
    { key: "statusOS", header: "Status", render: (o) => <Badge status={o.statusOS} /> },
    { key: "unidade", header: "Unidade", render: (o) => o.unidade?.nomeFantasia || "-" },
    { key: "precoOrcadoCliente", header: "Valor", render: (o) => formatCurrency(o.precoOrcadoCliente) },
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Ordens de Serviço</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={cn("rounded-lg p-2 transition-colors cursor-pointer", viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600")}
          >
            <FiList size={20} />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={cn("rounded-lg p-2 transition-colors cursor-pointer", viewMode === "kanban" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600")}
          >
            <FiGrid size={20} />
          </button>
          <Button onClick={() => router.push("/ordens/nova")} className="ml-2">
            <FiPlus size={18} /> Nova O.S.
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por OS, cliente, aparelho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FiSearch size={18} />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: "", label: "Todos os Status" },
              ...Object.entries(STATUS_OS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        {isMaster && (
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: "", label: "Todas Unidades" },
                ...unidades.map((u) => ({ value: u.nomeFantasia, label: u.nomeFantasia })),
              ]}
              value={unidadeFilter}
              onChange={(e) => setUnidadeFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {viewMode === "table" ? (
        <Table
          columns={columns}
          data={filteredOrdens}
          keyExtractor={(o) => o.id}
          onRowClick={(o) => router.push(`/ordens/${o.idOS}`)}
          emptyMessage="Nenhuma ordem de serviço encontrada"
        />
      ) : (
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
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-gray-500">{o.idOS}</span>
                  <Badge status={o.statusOS} />
                </div>
                <p className="font-medium text-gray-900">{o.cliente?.nomeCompleto || "-"}</p>
                <p className="text-sm text-gray-500">
                  {o.aparelho ? `${o.aparelho.marca} ${o.aparelho.modelo}` : "-"}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatCurrency(o.precoOrcadoCliente)}</span>
                  <span>{formatDateTime(o.dataAbertura)}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => router.push("/ordens/nova")}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <FiPlus size={24} />
      </button>
    </div>
  )
}
