"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiSearch, FiPlus, FiEdit2 } from "react-icons/fi"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import { Spinner } from "@/components/ui/Spinner"
import { formatDate } from "@/lib/utils"
import type { OrigemLead } from "@/types"
import { ORIGEM_LEAD_LABELS } from "@/types"
import type { Column } from "@/components/ui/Table"

interface Cliente {
  id: number
  nomeCompleto: string
  whatsapp: string
  enderecoCidade: string | null
  origemLead: OrigemLead
  dataCadastro: string
  _count: { aparelhos: number }
}

const initialForm = {
  nomeCompleto: "", whatsapp: "", enderecoRua: "", enderecoNumero: "",
  enderecoBairro: "", enderecoCidade: "", origemLead: "PassagemNaLoja" as OrigemLead,
}

export default function ClientesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editCliente, setEditCliente] = useState<Cliente | null>(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetchClientes()
  }, [status, session, router])

  const fetchClientes = async () => {
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

  const filtered = useMemo(() => {
    if (!search) return clientes
    const q = search.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nomeCompleto.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        (c.enderecoCidade && c.enderecoCidade.toLowerCase().includes(q))
    )
  }, [clientes, search])

  const openEdit = (cliente: Cliente) => {
    setEditCliente(cliente)
    setForm({
      nomeCompleto: cliente.nomeCompleto,
      whatsapp: cliente.whatsapp,
      enderecoRua: "",
      enderecoNumero: "",
      enderecoBairro: "",
      enderecoCidade: cliente.enderecoCidade || "",
      origemLead: cliente.origemLead,
    })
    setModalOpen(true)
  }

  const openNew = () => {
    setEditCliente(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    setFormError("")
    setSubmitting(true)
    try {
      const url = editCliente ? `/api/clientes/${editCliente.id}` : "/api/clientes"
      const method = editCliente ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          idUnidade: editCliente ? undefined : session?.user?.idUnidade,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Erro ao salvar")
        return
      }
      setModalOpen(false)
      setEditCliente(null)
      setForm(initialForm)
      fetchClientes()
    } catch {
      setFormError("Erro ao conectar")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<Cliente>[] = [
    { key: "nomeCompleto", header: "Nome", sortable: true },
    { key: "whatsapp", header: "WhatsApp" },
    { key: "enderecoCidade", header: "Cidade", render: (c) => c.enderecoCidade || "-" },
    { key: "origemLead", header: "Origem", render: (c) => ORIGEM_LEAD_LABELS[c.origemLead] },
    { key: "_count", header: "Aparelhos", render: (c) => String(c._count.aparelhos) },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEdit(c) }}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FiEdit2 size={16} />
        </button>
      ),
    },
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
        <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
        <Button onClick={openNew}><FiPlus size={18} /> Novo Cliente</Button>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Buscar por nome, WhatsApp ou cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<FiSearch size={18} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        emptyMessage="Nenhum cliente encontrado"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCliente(null); setFormError("") }}
        title={editCliente ? "Editar Cliente" : "Novo Cliente"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome Completo"
              value={form.nomeCompleto}
              onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
              required
            />
            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              required
            />
            <Input label="Endereço (Rua)" value={form.enderecoRua} onChange={(e) => setForm({ ...form, enderecoRua: e.target.value })} />
            <Input label="Número" value={form.enderecoNumero} onChange={(e) => setForm({ ...form, enderecoNumero: e.target.value })} />
            <Input label="Bairro" value={form.enderecoBairro} onChange={(e) => setForm({ ...form, enderecoBairro: e.target.value })} />
            <Input label="Cidade" value={form.enderecoCidade} onChange={(e) => setForm({ ...form, enderecoCidade: e.target.value })} />
            <Select
              label="Origem Lead"
              options={Object.entries(ORIGEM_LEAD_LABELS).map(([value, label]) => ({ value, label }))}
              value={form.origemLead}
              onChange={(e) => setForm({ ...form, origemLead: e.target.value as OrigemLead })}
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setEditCliente(null); setFormError("") }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editCliente ? "Salvar" : "Criar Cliente"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
