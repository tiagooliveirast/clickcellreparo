"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiCheckSquare } from "react-icons/fi"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { formatCurrency, formatDateTime, getStatusProgress, canTransition } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS, STATUS_OS_ORDER, METODO_PAGAMENTO_LABELS } from "@/types"

interface OrdemDetalhada {
  id: number
  idOS: string
  statusOS: StatusOS
  sintomaReclamado: string
  dataAbertura: string
  dataFechamento: string | null
  dataPrevisaoEntrega: string | null
  precoOrcadoCliente: number | null
  custoPeca: number | null
  custoMaoObraTecnico: number | null
  metodoPagamentoRegistro: string
  laudoTecnico: string | null
  faceIDBiometria: boolean
  touchscreen: boolean
  conexaoWiFi: boolean
  microfone: boolean
  altoFalantes: boolean
  conectorCarga: boolean
  fotosChecklistEntrada: string[]
  cliente?: {
    nomeCompleto: string
    whatsapp: string
    enderecoRua?: string
    enderecoNumero?: string
    enderecoBairro?: string
    enderecoCidade?: string
  }
  aparelho?: { marca: string; modelo: string; cor: string | null; imeiSerial: string | null }
  unidade?: { nomeFantasia: string; whatsappContato: string; chavePixPadrao: string | null }
  tecnico?: { nome: string } | null
  motoboy?: { nome: string } | null
  logs?: {
    id: number
    statusAnterior: StatusOS
    statusNovo: StatusOS
    timestamp: string
    usuario: { nome: string }
  }[]
  assinaturas?: {
    id: number
    urlAssinatura: string
    dataHora: string
    motoboy: { nome: string }
  }[]
}

export default function OSDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordem, setOrdem] = useState<OrdemDetalhada | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusLoading, setStatusLoading] = useState(false)
  const [checklistLoading, setChecklistLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    loadOrdem()
  }, [status, session, router, id])

  const loadOrdem = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ordens-servico/${id}`)
      if (!res.ok) { setError("Ordem não encontrada"); return }
      setOrdem(await res.json())
    } catch {
      setError("Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusTransition = async (novoStatus: StatusOS) => {
    if (!ordem) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/ordens-servico/${ordem.idOS}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novoStatus,
          idUsuario: Number(session?.user?.id),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Transição inválida")
        return
      }
      loadOrdem()
    } catch {
      alert("Erro ao conectar")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleChecklistToggle = async (field: string, value: boolean) => {
    if (!ordem) return
    setChecklistLoading(true)
    try {
      const res = await fetch(`/api/ordens-servico/${ordem.idOS}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) loadOrdem()
    } catch {
      console.error("Erro ao atualizar checklist")
    } finally {
      setChecklistLoading(false)
    }
  }

  const nextStatus = STATUS_OS_ORDER[STATUS_OS_ORDER.indexOf(ordem?.statusOS || "Recebido") + 1]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !ordem) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">{error || "Ordem não encontrada"}</p>
      </div>
    )
  }

  const checklistItems = [
    { key: "faceIDBiometria", label: "Face ID / Biometria", value: ordem.faceIDBiometria },
    { key: "touchscreen", label: "Touchscreen", value: ordem.touchscreen },
    { key: "conexaoWiFi", label: "Conexão Wi-Fi", value: ordem.conexaoWiFi },
    { key: "microfone", label: "Microfone", value: ordem.microfone },
    { key: "altoFalantes", label: "Alto Falantes", value: ordem.altoFalantes },
    { key: "conectorCarga", label: "Conector de Carga", value: ordem.conectorCarga },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <FiArrowLeft size={18} /> Voltar
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{ordem.idOS}</h2>
            <Badge status={ordem.statusOS} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {ordem.unidade?.nomeFantasia} - Aberta em {formatDateTime(ordem.dataAbertura)}
          </p>
        </div>
        {nextStatus && canTransition(ordem.statusOS, nextStatus) && (
          <Button
            onClick={() => handleStatusTransition(nextStatus)}
            loading={statusLoading}
          >
            Avançar para {STATUS_OS_LABELS[nextStatus]}
          </Button>
        )}
      </div>

      <ProgressBar percentage={getStatusProgress(ordem.statusOS)} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Cliente</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Nome:</span> {ordem.cliente?.nomeCompleto}</p>
            <p><span className="text-gray-500">WhatsApp:</span> {ordem.cliente?.whatsapp}</p>
            {ordem.cliente?.enderecoRua && (
              <p><span className="text-gray-500">Endereço:</span> {ordem.cliente.enderecoRua}, {ordem.cliente.enderecoNumero} - {ordem.cliente.enderecoBairro}, {ordem.cliente.enderecoCidade}</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Aparelho</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Marca/Modelo:</span> {ordem.aparelho?.marca} {ordem.aparelho?.modelo}</p>
            {ordem.aparelho?.cor && <p><span className="text-gray-500">Cor:</span> {ordem.aparelho.cor}</p>}
            {ordem.aparelho?.imeiSerial && <p><span className="text-gray-500">IMEI/Serial:</span> {ordem.aparelho.imeiSerial}</p>}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-gray-900">Sintoma Reclamado</h3>
        <p className="text-sm text-gray-700">{ordem.sintomaReclamado}</p>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold text-gray-900">Checklist de Qualidade</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {checklistItems.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => handleChecklistToggle(item.key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={item.value ? "font-medium text-gray-900" : "text-gray-500"}>
                {item.label}
              </span>
              {checklistLoading && <Spinner size="sm" />}
            </label>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Financeiro</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Valor Orçado</span>
              <span className="font-medium">{formatCurrency(ordem.precoOrcadoCliente)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Custo Peça</span>
              <span className="font-medium">{formatCurrency(ordem.custoPeca)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mão de Obra</span>
              <span className="font-medium">{formatCurrency(ordem.custoMaoObraTecnico)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-500">Método Pagamento</span>
              <span className="font-medium">{METODO_PAGAMENTO_LABELS[ordem.metodoPagamentoRegistro as keyof typeof METODO_PAGAMENTO_LABELS] || ordem.metodoPagamentoRegistro}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Responsáveis</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Técnico:</span> {ordem.tecnico?.nome || "-"}</p>
            <p><span className="text-gray-500">Motoboy:</span> {ordem.motoboy?.nome || "-"}</p>
            {ordem.dataPrevisaoEntrega && (
              <p><span className="text-gray-500">Previsão de Entrega:</span> {formatDateTime(ordem.dataPrevisaoEntrega)}</p>
            )}
            {ordem.dataFechamento && (
              <p><span className="text-gray-500">Fechamento:</span> {formatDateTime(ordem.dataFechamento)}</p>
            )}
          </div>
        </Card>
      </div>

      {ordem.laudoTecnico && (
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Laudo Técnico</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{ordem.laudoTecnico}</p>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-semibold text-gray-900">Timeline de Status</h3>
        <div className="space-y-3">
          {ordem.logs && ordem.logs.length > 0 ? (
            ordem.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div>
                  <p className="text-gray-900">
                    {STATUS_OS_LABELS[log.statusAnterior]} → {STATUS_OS_LABELS[log.statusNovo]}
                  </p>
                  <p className="text-xs text-gray-400">
                    {log.usuario.nome} - {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">Nenhum log disponível</p>
          )}
        </div>
      </Card>

      {ordem.assinaturas && ordem.assinaturas.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Assinaturas</h3>
          {ordem.assinaturas.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <p className="text-gray-500">Assinado por {a.motoboy.nome}</p>
              <p className="text-gray-400 text-xs">{formatDateTime(a.dataHora)}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
