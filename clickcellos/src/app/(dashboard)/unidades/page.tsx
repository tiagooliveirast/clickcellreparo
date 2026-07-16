"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiPlus, FiSearch } from "react-icons/fi"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import { Spinner } from "@/components/ui/Spinner"
import { formatDate } from "@/lib/utils"
import type { Column } from "@/components/ui/Table"

interface Unidade {
  id: number
  nomeFantasia: string
  slugSubdominio: string
  whatsappContato: string
  statusContrato: string
  dataCadastro: string
  _count: { usuarios: number; clientes: number; ordensServico: number }
}

export default function UnidadesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    nomeFantasia: "", slugSubdominio: "", whatsappContato: "", chavePixPadrao: "",
    franqueadoNome: "", franqueadoEmail: "", franqueadoSenha: "",
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    if (session?.user?.role !== "Master") {
      router.push(`/${session?.user?.role?.toLowerCase()}`)
      return
    }
    fetchUnidades()
  }, [status, session, router])

  const fetchUnidades = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/unidades")
      if (res.ok) setUnidades(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return unidades
    const q = search.toLowerCase()
    return unidades.filter(
      (u) =>
        u.nomeFantasia.toLowerCase().includes(q) ||
        u.slugSubdominio.toLowerCase().includes(q) ||
        u.whatsappContato.includes(q)
    )
  }, [unidades, search])

  const handleCreate = async () => {
    setFormError("")
    setFormLoading(true)
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Erro ao criar unidade")
        return
      }
      setShowNew(false)
      setForm({
        nomeFantasia: "", slugSubdominio: "", whatsappContato: "", chavePixPadrao: "",
        franqueadoNome: "", franqueadoEmail: "", franqueadoSenha: "",
      })
      fetchUnidades()
    } catch {
      setFormError("Erro ao conectar")
    } finally {
      setFormLoading(false)
    }
  }

  const columns: Column<Unidade>[] = [
    { key: "nomeFantasia", header: "Nome", sortable: true },
    { key: "slugSubdominio", header: "Slug" },
    { key: "whatsappContato", header: "WhatsApp" },
    {
      key: "statusContrato", header: "Status",
      render: (u) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          u.statusContrato === "Ativo"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {u.statusContrato}
        </span>
      ),
    },
    { key: "_count", header: "O.S.", render: (u) => String(u._count.ordensServico) },
    { key: "dataCadastro", header: "Data Cadastro", render: (u) => formatDate(u.dataCadastro) },
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
        <h2 className="text-xl font-semibold text-gray-900">Franquias</h2>
        <Button onClick={() => setShowNew(true)}>
          <FiPlus size={18} /> Nova Unidade
        </Button>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Buscar por nome, slug ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<FiSearch size={18} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.id}
        emptyMessage="Nenhuma unidade encontrada"
      />

      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="Nova Unidade"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome Fantasia" value={form.nomeFantasia} onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} required />
            <Input label="Slug (subdomínio)" value={form.slugSubdominio} onChange={(e) => setForm({ ...form, slugSubdominio: e.target.value })} required />
            <Input label="WhatsApp Contato" value={form.whatsappContato} onChange={(e) => setForm({ ...form, whatsappContato: e.target.value })} required />
            <Input label="Chave PIX Padrão" value={form.chavePixPadrao} onChange={(e) => setForm({ ...form, chavePixPadrao: e.target.value })} />
          </div>
          <hr className="border-gray-200" />
          <h4 className="font-medium text-gray-900">Franqueado Responsável</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Nome" value={form.franqueadoNome} onChange={(e) => setForm({ ...form, franqueadoNome: e.target.value })} required />
            <Input label="Email" type="email" value={form.franqueadoEmail} onChange={(e) => setForm({ ...form, franqueadoEmail: e.target.value })} required />
            <Input label="Senha" type="password" value={form.franqueadoSenha} onChange={(e) => setForm({ ...form, franqueadoSenha: e.target.value })} required />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button loading={formLoading} onClick={handleCreate}>Criar Unidade</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
