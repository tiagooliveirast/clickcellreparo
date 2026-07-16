"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiPackage, FiTruck, FiMapPin } from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS } from "@/types"

interface Ordem {
  id: number
  idOS: string
  statusOS: StatusOS
  sintomaReclamado: string
  cliente?: {
    nomeCompleto: string
    whatsapp: string
    enderecoRua?: string
    enderecoNumero?: string
    enderecoBairro?: string
    enderecoCidade?: string
  }
  aparelho?: { marca: string; modelo: string }
  unidade?: { nomeFantasia: string }
}

export default function MotoboyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"coletas" | "entregas">("coletas")
  const [assinaturaModal, setAssinaturaModal] = useState<Ordem | null>(null)
  const [urlAssinatura, setUrlAssinatura] = useState("")
  const [assinaturaLoading, setAssinaturaLoading] = useState(false)
  const [assinaturaError, setAssinaturaError] = useState("")

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

  const coletas = ordens.filter((o) => o.statusOS === "Recebido")
  const entregas = ordens.filter((o) => o.statusOS === "ProntoParaEntrega")

  const handleColetar = async (ordem: Ordem) => {
    setAssinaturaLoading(true)
    try {
      const res = await fetch(`/api/ordens-servico/${ordem.idOS}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoStatus: "Triagem", idUsuario: Number(session?.user?.id) }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao coletar")
      }
    } catch {
      alert("Erro ao conectar")
    } finally {
      setAssinaturaLoading(false)
    }
  }

  const handleEntregar = async () => {
    if (!assinaturaModal || !urlAssinatura) return
    setAssinaturaError("")
    setAssinaturaLoading(true)
    try {
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idOS: assinaturaModal.idOS,
          idMotoboy: Number(session?.user?.id),
          urlAssinatura,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setAssinaturaError(data.error || "Erro ao registrar assinatura")
        return
      }
      await fetch(`/api/ordens-servico/${assinaturaModal.idOS}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoStatus: "Finalizado", idUsuario: Number(session?.user?.id) }),
      })
      setAssinaturaModal(null)
      setUrlAssinatura("")
      fetchData()
    } catch {
      setAssinaturaError("Erro ao conectar")
    } finally {
      setAssinaturaLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Coletas e Entregas</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("coletas")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "coletas"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <FiPackage size={18} /> Coletas ({coletas.length})
        </button>
        <button
          onClick={() => setActiveTab("entregas")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "entregas"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <FiTruck size={18} /> Entregas ({entregas.length})
        </button>
      </div>

      <div className="space-y-4">
        {(activeTab === "coletas" ? coletas : entregas).length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            Nenhuma {activeTab === "coletas" ? "coleta" : "entrega"} pendente
          </div>
        ) : (
          (activeTab === "coletas" ? coletas : entregas).map((o) => (
            <Card key={o.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-gray-500">{o.idOS}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {STATUS_OS_LABELS[o.statusOS]}
                  </span>
                </div>
                <p className="mt-1 font-medium text-gray-900">{o.cliente?.nomeCompleto}</p>
                <p className="text-sm text-gray-500">
                  {o.aparelho?.marca} {o.aparelho?.modelo}
                </p>
                {o.cliente?.enderecoRua && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <FiMapPin size={12} />
                    {o.cliente.enderecoRua}, {o.cliente.enderecoNumero} - {o.cliente.enderecoBairro}, {o.cliente.enderecoCidade}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {activeTab === "coletas" && (
                  <Button size="sm" onClick={() => handleColetar(o)} loading={assinaturaLoading}>
                    Coletar
                  </Button>
                )}
                {activeTab === "entregas" && (
                  <Button size="sm" onClick={() => setAssinaturaModal(o)}>
                    Entregar
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={!!assinaturaModal}
        onClose={() => { setAssinaturaModal(null); setUrlAssinatura(""); setAssinaturaError("") }}
        title="Finalizar Entrega - Assinatura"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            OS: <strong>{assinaturaModal?.idOS}</strong> - {assinaturaModal?.cliente?.nomeCompleto}
          </p>
          <Input
            label="URL da Assinatura Digital"
            value={urlAssinatura}
            onChange={(e) => setUrlAssinatura(e.target.value)}
            placeholder="https://..."
            required
          />
          {assinaturaError && <p className="text-sm text-red-500">{assinaturaError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setAssinaturaModal(null); setUrlAssinatura(""); setAssinaturaError("") }}>
              Cancelar
            </Button>
            <Button onClick={handleEntregar} loading={assinaturaLoading} disabled={!urlAssinatura}>
              Confirmar Entrega
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
