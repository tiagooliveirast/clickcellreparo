"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  FiGrid, FiClipboard, FiTrendingUp, FiDollarSign, FiPlus,
} from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { StatusOS } from "@/types"
import { STATUS_OS_LABELS } from "@/types"

interface Unidade {
  id: number
  nomeFantasia: string
  slugSubdominio: string
  statusContrato: string
  dataCadastro: string
  _count: { usuarios: number; clientes: number; ordensServico: number }
}

interface Ordem {
  id: number
  idOS: string
  statusOS: StatusOS
  dataAbertura: string
  precoOrcadoCliente: number | null
  cliente?: { nomeCompleto: string; whatsapp: string }
  aparelho?: { marca: string; modelo: string }
  unidade?: { nomeFantasia: string }
}

export default function MasterDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [ordens, setOrdens] = useState<Ordem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewUnidade, setShowNewUnidade] = useState(false)
  const [formData, setFormData] = useState({
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
    fetchData()
  }, [status, session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [unidadesRes, ordensRes] = await Promise.all([
        fetch("/api/unidades"),
        fetch("/api/ordens-servico"),
      ])
      if (unidadesRes.ok) setUnidades(await unidadesRes.json())
      if (ordensRes.ok) setOrdens(await ordensRes.json())
    } catch {
      setFormError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUnidade = async () => {
    setFormError("")
    setFormLoading(true)
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Erro ao criar unidade")
        return
      }
      setShowNewUnidade(false)
      setFormData({
        nomeFantasia: "", slugSubdominio: "", whatsappContato: "", chavePixPadrao: "",
        franqueadoNome: "", franqueadoEmail: "", franqueadoSenha: "",
      })
      fetchData()
    } catch {
      setFormError("Erro ao conectar")
    } finally {
      setFormLoading(false)
    }
  }

  const unidadesAtivas = unidades.filter((u) => u.statusContrato === "Ativo").length
  const ordensHoje = ordens.filter(
    (o) => new Date(o.dataAbertura).toDateString() === new Date().toDateString()
  ).length
  const now = new Date()
  const ordensMes = ordens.filter(
    (o) =>
      new Date(o.dataAbertura).getMonth() === now.getMonth() &&
      new Date(o.dataAbertura).getFullYear() === now.getFullYear()
  )
  const faturamentoMes = ordensMes.reduce(
    (acc, o) => acc + (o.precoOrcadoCliente || 0), 0
  )
  const recentOrdens = ordens.slice(0, 10)

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
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Master</h2>
        <Button onClick={() => setShowNewUnidade(true)}>
          <FiPlus size={18} /> Nova Unidade
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FiGrid size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Unidades Ativas</p>
              <p className="text-xl font-bold text-gray-900">{unidadesAtivas}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <FiClipboard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">O.S. Hoje</p>
              <p className="text-xl font-bold text-gray-900">{ordensHoje}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">O.S. Mês</p>
              <p className="text-xl font-bold text-gray-900">{ordensMes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Faturamento Mês</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(faturamentoMes)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Últimas O.S.</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrdens.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Nenhuma ordem de serviço encontrada</p>
            ) : (
              recentOrdens.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{o.idOS}</p>
                    <p className="text-gray-500">
                      {o.cliente?.nomeCompleto || "Sem cliente"} - {o.aparelho?.marca} {o.aparelho?.modelo}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{STATUS_OS_LABELS[o.statusOS]}</p>
                    <p>{formatDateTime(o.dataAbertura)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Unidades</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {unidades.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Nenhuma unidade cadastrada</p>
            ) : (
              unidades.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{u.nomeFantasia}</p>
                    <p className="text-gray-500">{u.slugSubdominio}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.statusContrato === "Ativo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {u.statusContrato}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Resumo de Status</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["Recebido", "NaBancada", "ProntoParaEntrega", "Finalizado"] as StatusOS[]).map((s) => {
            const count = ordens.filter((o) => o.statusOS === s).length
            return (
              <div key={s} className="rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{STATUS_OS_LABELS[s]}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal
        isOpen={showNewUnidade}
        onClose={() => setShowNewUnidade(false)}
        title="Nova Unidade"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome Fantasia" value={formData.nomeFantasia} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} required />
            <Input label="Slug (subdomínio)" value={formData.slugSubdominio} onChange={(e) => setFormData({ ...formData, slugSubdominio: e.target.value })} required />
            <Input label="WhatsApp Contato" value={formData.whatsappContato} onChange={(e) => setFormData({ ...formData, whatsappContato: e.target.value })} required />
            <Input label="Chave PIX Padrão" value={formData.chavePixPadrao} onChange={(e) => setFormData({ ...formData, chavePixPadrao: e.target.value })} />
          </div>
          <hr className="border-gray-200" />
          <h4 className="font-medium text-gray-900">Franqueado Responsável</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Nome" value={formData.franqueadoNome} onChange={(e) => setFormData({ ...formData, franqueadoNome: e.target.value })} required />
            <Input label="Email" type="email" value={formData.franqueadoEmail} onChange={(e) => setFormData({ ...formData, franqueadoEmail: e.target.value })} required />
            <Input label="Senha" type="password" value={formData.franqueadoSenha} onChange={(e) => setFormData({ ...formData, franqueadoSenha: e.target.value })} required />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNewUnidade(false)}>Cancelar</Button>
            <Button loading={formLoading} onClick={handleCreateUnidade}>Criar Unidade</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
