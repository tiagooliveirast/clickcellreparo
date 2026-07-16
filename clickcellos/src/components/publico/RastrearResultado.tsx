"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { StatusTimeline } from "@/components/ordens-servico/StatusTimeline"
import {
  formatDate,
  getStatusColor,
  getStatusProgress,
} from "@/lib/utils"
import {
  STATUS_OS_LABELS,
  STATUS_OS_ORDER,
  type StatusOS,
} from "@/types"
import { FaWhatsapp } from "react-icons/fa6"
import { FiImage, FiCheckCircle } from "react-icons/fi"

interface RastrearResultadoProps {
  ordem: any
  slug: string
}

export function RastrearResultado({ ordem, slug }: RastrearResultadoProps) {
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [approveError, setApproveError] = useState("")

  const fotos = ordem.fotosChecklistEntrada || []

  const handleApproveRepair = async () => {
    setApproving(true)
    setApproveError("")
    try {
      const res = await fetch("/api/public/approve-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idOS: ordem.idOS, confirmacao: ordem.idOS }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao aprovar reparo")
      }
      setApproved(true)
    } catch (err: any) {
      setApproveError(err.message)
    } finally {
      setApproving(false)
    }
  }

  const waNumber = ordem.unidade?.whatsappContato?.replace(/\D/g, "") || ""
  const waUrl = `https://wa.me/${waNumber}?text=Olá! Gostaria de falar sobre minha OS ${ordem.idOS}`

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* OS Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{ordem.idOS}</h2>
          <Badge status={ordem.statusOS as StatusOS} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Cliente:</span>{" "}
            {ordem.cliente?.nomeCompleto || "-"}
          </p>
          <p>
            <span className="font-medium text-gray-800">Aparelho:</span>{" "}
            {ordem.aparelho?.marca} {ordem.aparelho?.modelo}
            {ordem.aparelho?.cor ? ` (${ordem.aparelho.cor})` : ""}
          </p>
          <p>
            <span className="font-medium text-gray-800">Abertura:</span>{" "}
            {formatDate(ordem.dataAbertura)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Progresso do Reparo
        </h3>
        <ProgressBar
          percentage={getStatusProgress(ordem.statusOS as StatusOS)}
          className="h-3"
        />
        <div className="mt-4 flex flex-wrap gap-1">
          {STATUS_OS_ORDER.map((s, idx) => {
            const currentIdx = STATUS_OS_ORDER.indexOf(ordem.statusOS)
            const done = idx <= currentIdx
            return (
              <span
                key={s}
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  done
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {STATUS_OS_LABELS[s]}
              </span>
            )
          })}
        </div>
      </div>

      {/* Fotos */}
      {fotos.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Fotos do Aparelho
          </h3>
          <div className="flex flex-wrap gap-2">
            {fotos.map((foto: string, idx: number) => (
              <a
                key={idx}
                href={foto}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              >
                <img
                  src={foto}
                  alt={`Foto ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Laudo Técnico */}
      {ordem.laudoTecnico && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Laudo Técnico
          </h3>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {ordem.laudoTecnico}
          </p>
        </div>
      )}

      {/* Status Timeline */}
      {ordem.logs && ordem.logs.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Histórico de Status
          </h3>
          <StatusTimeline logs={ordem.logs} />
        </div>
      )}

      {/* Approve Repair */}
      {ordem.statusOS === "AguardandoCliente" && !approved && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center shadow-sm">
          <FiCheckCircle size={48} className="mx-auto text-green-500" />
          <h3 className="mt-4 text-lg font-bold text-green-800">
            Seu orçamento está pronto!
          </h3>
          <p className="mt-2 text-sm text-green-700">
            Clique no botão abaixo para aprovar o reparo e darmos continuidade.
          </p>
          {ordem.precoOrcadoCliente && (
            <p className="mt-2 text-2xl font-bold text-green-700">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(ordem.precoOrcadoCliente)}
            </p>
          )}
          <Button
            onClick={handleApproveRepair}
            loading={approving}
            size="lg"
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            Aprovar Reparo
          </Button>
          {approveError && (
            <p className="mt-2 text-sm text-red-600">{approveError}</p>
          )}
        </div>
      )}

      {approved && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center shadow-sm">
          <FiCheckCircle size={48} className="mx-auto text-green-500" />
          <h3 className="mt-4 text-lg font-bold text-green-800">
            Reparo Aprovado!
          </h3>
          <p className="mt-2 text-sm text-green-700">
            Seu reparo foi aprovado e já está em andamento.
          </p>
        </div>
      )}

      {/* WhatsApp Contact */}
      {waNumber && (
        <div className="flex justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-white font-bold shadow-lg transition-all hover:bg-green-600"
          >
            <FaWhatsapp size={24} />
            Falar com a loja
          </a>
        </div>
      )}
    </div>
  )
}
