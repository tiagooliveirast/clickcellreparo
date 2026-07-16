"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StatusTimeline } from "./StatusTimeline"
import { CQChecklist } from "./CQChecklist"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusProgress,
  canTransition,
} from "@/lib/utils"
import {
  STATUS_OS_LABELS,
  STATUS_OS_ORDER,
  METODO_PAGAMENTO_LABELS,
  type StatusOS,
  type MetodoPagamento,
} from "@/types"
import { FiImage } from "react-icons/fi"

interface OSDetailModalProps {
  ordem: any
  isOpen: boolean
  onClose: () => void
  userRole: string
  onStatusChange?: () => void
  currentUserId?: number
}

export function OSDetailModal({
  ordem,
  isOpen,
  onClose,
  userRole,
  onStatusChange,
  currentUserId,
}: OSDetailModalProps) {
  const [transitioning, setTransitioning] = useState<string | null>(null)

  if (!ordem) return null

  const role = userRole as string
  const currentIndex = STATUS_OS_ORDER.indexOf(ordem.statusOS)
  const nextStatus = currentIndex < STATUS_OS_ORDER.length - 1 ? STATUS_OS_ORDER[currentIndex + 1] : null
  const canAdvance = nextStatus && canTransition(ordem.statusOS, nextStatus)

  const showFinanceiro = role === "Master" || role === "Franqueado"
  const showCQEditable = role === "Tecnico" && ordem.statusOS === "EmTestes"
  const showFinanceiroEdit = role === "Master" || role === "Franqueado"

  const handleTransition = async (novoStatus: string) => {
    setTransitioning(novoStatus)
    try {
      const res = await fetch(`/api/ordens-servico/${ordem.idOS}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoStatus, ...(currentUserId ? { idUsuario: currentUserId } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao alterar status")
      } else {
        onStatusChange?.()
      }
    } catch {
      alert("Erro de conexão")
    } finally {
      setTransitioning(null)
    }
  }

  const handleChecklistSave = async (data: any) => {
    try {
      const res = await fetch(`/api/ordens-servico/${ordem.idOS}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao salvar checklist")
      } else {
        onStatusChange?.()
      }
    } catch {
      alert("Erro de conexão")
    }
  }

  const fotos = ordem.fotosChecklistEntrada || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`OS ${ordem.idOS}`} size="xl">
      <div className="space-y-8">
        {/* OS Info */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Informações da OS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">ID:</span>
              <p className="font-medium text-gray-900">{ordem.idOS}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="mt-1">
                <Badge status={ordem.statusOS as StatusOS} />
              </div>
            </div>
            <div>
              <span className="text-gray-500">Abertura:</span>
              <p className="font-medium text-gray-900">
                {formatDateTime(ordem.dataAbertura)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Fechamento:</span>
              <p className="font-medium text-gray-900">
                {ordem.dataFechamento ? formatDateTime(ordem.dataFechamento) : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Cliente */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cliente
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nome:</span>
              <p className="font-medium text-gray-900">{ordem.cliente?.nomeCompleto || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">WhatsApp:</span>
              <p className="font-medium text-gray-900">{ordem.cliente?.whatsapp || "-"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Endereço:</span>
              <p className="font-medium text-gray-900">
                {ordem.cliente?.enderecoRua
                  ? `${ordem.cliente.enderecoRua}, ${ordem.cliente.enderecoNumero || "S/N"}${ordem.cliente.enderecoBairro ? ` - ${ordem.cliente.enderecoBairro}` : ""}${ordem.cliente.enderecoCidade ? ` - ${ordem.cliente.enderecoCidade}` : ""}`
                  : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Aparelho */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Aparelho
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Marca:</span>
              <p className="font-medium text-gray-900">{ordem.aparelho?.marca || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">Modelo:</span>
              <p className="font-medium text-gray-900">{ordem.aparelho?.modelo || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">Cor:</span>
              <p className="font-medium text-gray-900">{ordem.aparelho?.cor || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">IMEI/Serial:</span>
              <p className="font-medium text-gray-900">{ordem.aparelho?.imeiSerial || "-"}</p>
            </div>
          </div>
        </section>

        {/* Fotos */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Fotos do Checklist de Entrada
          </h3>
          {fotos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fotos.map((foto: string, idx: number) => (
                <a
                  key={idx}
                  href={foto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <img
                    src={foto}
                    alt={`Foto ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiImage size={16} />
              <span>Nenhuma foto</span>
            </div>
          )}
        </section>

        {/* Status Timeline */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Linha do Tempo
          </h3>
          <StatusTimeline logs={ordem.logs} />
        </section>

        {/* CQ Checklist */}
        <section>
          <CQChecklist
            ordem={ordem}
            editable={showCQEditable}
            onSave={showCQEditable ? handleChecklistSave : undefined}
          />
        </section>

        {/* Financeiro */}
        {showFinanceiro && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Preço Orçado:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(ordem.precoOrcadoCliente)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Custo Peça:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(ordem.custoPeca)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Custo Mão de Obra:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(ordem.custoMaoObraTecnico)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Lucro:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(
                    (ordem.precoOrcadoCliente || 0) -
                      (ordem.custoPeca || 0) -
                      (ordem.custoMaoObraTecnico || 0)
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Margem:</span>
                <p className="font-medium text-gray-900">
                  {ordem.precoOrcadoCliente
                    ? `${Math.round(
                        (((ordem.precoOrcadoCliente || 0) -
                          (ordem.custoPeca || 0) -
                          (ordem.custoMaoObraTecnico || 0)) /
                          ordem.precoOrcadoCliente) *
                          100
                      )}%`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Pagamento:</span>
                <p className="font-medium text-gray-900">
                  {ordem.metodoPagamentoRegistro
                    ? METODO_PAGAMENTO_LABELS[ordem.metodoPagamentoRegistro as MetodoPagamento]
                    : "-"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Ações */}
        <section className="border-t border-gray-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ações
          </h3>
          <div className="flex flex-wrap gap-2">
            {nextStatus && canAdvance && (
              <Button
                onClick={() => handleTransition(nextStatus)}
                loading={transitioning === nextStatus}
              >
                Avançar para {STATUS_OS_LABELS[nextStatus]}
              </Button>
            )}
            {ordem.statusOS === "AguardandoOrcamento" && showFinanceiroEdit && (
              <Button
                variant="secondary"
                onClick={() => handleTransition("AguardandoCliente")}
                loading={transitioning === "AguardandoCliente"}
              >
                Enviar Orçamento
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  )
}
