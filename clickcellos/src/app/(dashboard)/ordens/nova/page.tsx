"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card } from "@/components/ui/Card"
import { Spinner } from "@/components/ui/Spinner"
import type { OrigemLead } from "@/types"
import { ORIGEM_LEAD_LABELS } from "@/types"

interface Cliente {
  id: number
  nomeCompleto: string
  whatsapp: string
}

interface Aparelho {
  id: number
  idCliente: number
  marca: string
  modelo: string
  cor: string | null
  imeiSerial: string | null
}

export default function NovaOSPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<"cliente" | "aparelho" | "os">("cliente")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [aparelhos, setAparelhos] = useState<Aparelho[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [selectedClienteId, setSelectedClienteId] = useState("")
  const [selectedAparelhoId, setSelectedAparelhoId] = useState("")
  const [novoCliente, setNovoCliente] = useState({
    nomeCompleto: "", whatsapp: "", enderecoRua: "", enderecoNumero: "",
    enderecoBairro: "", enderecoCidade: "", origemLead: "PassagemNaLoja" as OrigemLead,
  })
  const [novoAparelho, setNovoAparelho] = useState({
    marca: "", modelo: "", cor: "", imeiSerial: "",
  })
  const [sintoma, setSintoma] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    loadClientes()
  }, [status, session, router])

  const loadClientes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/clientes")
      if (res.ok) setClientes(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadAparelhos = async (clienteId: number) => {
    try {
      const res = await fetch("/api/aparelhos")
      if (res.ok) {
        const all: Aparelho[] = await res.json()
        setAparelhos(all.filter((a) => a.idCliente === clienteId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectCliente = (id: string) => {
    setSelectedClienteId(id)
    if (id) {
      loadAparelhos(Number(id))
      setStep("aparelho")
    }
  }

  const handleCreateCliente = async () => {
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoCliente,
          idUnidade: session?.user?.idUnidade,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao criar cliente")
        return
      }
      const cliente = await res.json()
      setSelectedClienteId(String(cliente.id))
      loadClientes()
      loadAparelhos(cliente.id)
      setStep("aparelho")
    } catch {
      setError("Erro ao conectar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAparelho = async () => {
    if (!selectedClienteId) return
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/aparelhos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCliente: Number(selectedClienteId),
          ...novoAparelho,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao criar aparelho")
        return
      }
      const aparelho = await res.json()
      setSelectedAparelhoId(String(aparelho.id))
      loadAparelhos(Number(selectedClienteId))
      setStep("os")
    } catch {
      setError("Erro ao conectar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOS = async () => {
    if (!selectedClienteId || !selectedAparelhoId || !sintoma) {
      setError("Preencha todos os campos obrigatórios")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/ordens-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCliente: Number(selectedClienteId),
          idAparelho: Number(selectedAparelhoId),
          sintomaReclamado: sintoma,
          idUnidade: session?.user?.idUnidade,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao criar O.S.")
        return
      }
      router.push("/ordens")
    } catch {
      setError("Erro ao conectar")
    } finally {
      setSubmitting(false)
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
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Nova Ordem de Serviço</h2>

      <div className="flex gap-2">
        {(["cliente", "aparelho", "os"] as const).map((s, i) => (
          <button
            key={s}
            onClick={() => {
              if (s === "cliente" || (s === "aparelho" && selectedClienteId) || (s === "os" && selectedAparelhoId))
                setStep(s)
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
              step === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {i + 1}. {s === "cliente" ? "Cliente" : s === "aparelho" ? "Aparelho" : "O.S."}
          </button>
        ))}
      </div>

      {step === "cliente" && (
        <Card className="space-y-4">
          <h3 className="font-semibold text-gray-900">Selecionar Cliente</h3>
          <Select
            options={[
              { value: "", label: "Selecione um cliente..." },
              ...clientes.map((c) => ({ value: String(c.id), label: `${c.nomeCompleto} (${c.whatsapp})` })),
            ]}
            value={selectedClienteId}
            onChange={(e) => handleSelectCliente(e.target.value)}
          />
          <hr className="border-gray-200" />
          <h4 className="text-sm font-medium text-gray-700">Ou cadastrar novo cliente</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome Completo" value={novoCliente.nomeCompleto} onChange={(e) => setNovoCliente({ ...novoCliente, nomeCompleto: e.target.value })} required />
            <Input label="WhatsApp" value={novoCliente.whatsapp} onChange={(e) => setNovoCliente({ ...novoCliente, whatsapp: e.target.value })} required />
            <Input label="Endereço (Rua)" value={novoCliente.enderecoRua} onChange={(e) => setNovoCliente({ ...novoCliente, enderecoRua: e.target.value })} />
            <Input label="Número" value={novoCliente.enderecoNumero} onChange={(e) => setNovoCliente({ ...novoCliente, enderecoNumero: e.target.value })} />
            <Input label="Bairro" value={novoCliente.enderecoBairro} onChange={(e) => setNovoCliente({ ...novoCliente, enderecoBairro: e.target.value })} />
            <Input label="Cidade" value={novoCliente.enderecoCidade} onChange={(e) => setNovoCliente({ ...novoCliente, enderecoCidade: e.target.value })} />
            <Select
              label="Origem Lead"
              options={Object.entries(ORIGEM_LEAD_LABELS).map(([value, label]) => ({ value, label }))}
              value={novoCliente.origemLead}
              onChange={(e) => setNovoCliente({ ...novoCliente, origemLead: e.target.value as OrigemLead })}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleCreateCliente} loading={submitting} className="w-full">
            Criar Cliente e Continuar
          </Button>
        </Card>
      )}

      {step === "aparelho" && (
        <Card className="space-y-4">
          <h3 className="font-semibold text-gray-900">Selecionar Aparelho</h3>
          {aparelhos.length > 0 && (
            <Select
              options={[
                { value: "", label: "Selecione um aparelho..." },
                ...aparelhos.map((a) => ({
                  value: String(a.id),
                  label: `${a.marca} ${a.modelo}${a.cor ? ` (${a.cor})` : ""}${a.imeiSerial ? ` - ${a.imeiSerial}` : ""}`,
                })),
              ]}
              value={selectedAparelhoId}
              onChange={(e) => {
                setSelectedAparelhoId(e.target.value)
                if (e.target.value) setStep("os")
              }}
            />
          )}
          <hr className="border-gray-200" />
          <h4 className="text-sm font-medium text-gray-700">Ou cadastrar novo aparelho</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Marca" value={novoAparelho.marca} onChange={(e) => setNovoAparelho({ ...novoAparelho, marca: e.target.value })} required />
            <Input label="Modelo" value={novoAparelho.modelo} onChange={(e) => setNovoAparelho({ ...novoAparelho, modelo: e.target.value })} required />
            <Input label="Cor" value={novoAparelho.cor} onChange={(e) => setNovoAparelho({ ...novoAparelho, cor: e.target.value })} />
            <Input label="IMEI / Serial" value={novoAparelho.imeiSerial} onChange={(e) => setNovoAparelho({ ...novoAparelho, imeiSerial: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleCreateAparelho} loading={submitting} className="w-full">
            Criar Aparelho e Continuar
          </Button>
        </Card>
      )}

      {step === "os" && (
        <Card className="space-y-4">
          <h3 className="font-semibold text-gray-900">Dados da O.S.</h3>
          <p className="text-sm text-gray-500">
            Cliente: {clientes.find((c) => String(c.id) === selectedClienteId)?.nomeCompleto}
          </p>
          <Input
            label="Sintoma Reclamado"
            value={sintoma}
            onChange={(e) => setSintoma(e.target.value)}
            placeholder="Descreva o problema relatado pelo cliente..."
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push("/ordens")}>Cancelar</Button>
            <Button onClick={handleCreateOS} loading={submitting}>Criar O.S.</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
