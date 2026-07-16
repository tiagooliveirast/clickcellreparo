"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiPlus, FiToggleLeft, FiToggleRight } from "react-icons/fi"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import { Spinner } from "@/components/ui/Spinner"
import type { Role } from "@/types"
import type { Column } from "@/components/ui/Table"

interface Usuario {
  id: number
  nome: string
  email: string
  role: Role
  telefone: string | null
  ativo: boolean
  unidade?: { nomeFantasia: string }
}

export default function EquipePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "Tecnico" as string, telefone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const isFranqueado = session?.user?.role === "Franqueado"
  const isMaster = session?.user?.role === "Master"

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    if (!isFranqueado && !isMaster) { router.push(`/${session?.user?.role?.toLowerCase()}`); return }
    fetchUsuarios()
  }, [status, session, router, isFranqueado, isMaster])

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/usuarios")
      if (res.ok) setUsuarios(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = isFranqueado
    ? [{ value: "Tecnico", label: "Técnico" }, { value: "Motoboy", label: "Motoboy" }]
    : [{ value: "Master", label: "Master" }, { value: "Franqueado", label: "Franqueado" }, { value: "Tecnico", label: "Técnico" }, { value: "Motoboy", label: "Motoboy" }]

  const handleCreate = async () => {
    setFormError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Erro ao criar usuário")
        return
      }
      setModalOpen(false)
      setForm({ nome: "", email: "", senha: "", role: "Tecnico", telefone: "" })
      fetchUsuarios()
    } catch {
      setFormError("Erro ao conectar")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAtivo = async (usuario: Usuario) => {
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !usuario.ativo }),
      })
      if (res.ok) fetchUsuarios()
    } catch {
      console.error("Erro ao alternar status")
    }
  }

  const columns: Column<Usuario>[] = [
    { key: "nome", header: "Nome", sortable: true },
    { key: "email", header: "Email" },
    {
      key: "role", header: "Cargo",
      render: (u) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {u.role}
        </span>
      ),
    },
    { key: "telefone", header: "Telefone", render: (u) => u.telefone || "-" },
    {
      key: "unidade", header: "Unidade", render: (u) => u.unidade?.nomeFantasia || "-",
    },
    {
      key: "ativo",
      header: "Ativo",
      render: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleAtivo(u) }}
          className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
            u.ativo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          {u.ativo ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
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
        <h2 className="text-xl font-semibold text-gray-900">Equipe</h2>
        <Button onClick={() => setModalOpen(true)}><FiPlus size={18} /> Adicionar Membro</Button>
      </div>

      <Table
        columns={columns}
        data={usuarios}
        keyExtractor={(u) => u.id}
        emptyMessage="Nenhum membro encontrado"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFormError("") }}
        title="Adicionar Membro"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
            <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Select
              label="Cargo"
              options={roleOptions}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setFormError("") }}>Cancelar</Button>
            <Button onClick={handleCreate} loading={submitting}>Criar Membro</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
