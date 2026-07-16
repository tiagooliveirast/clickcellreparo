"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"

interface OSFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editOrdem?: any
  unidades: any[]
  clientes: any[]
  aparelhos: any[]
  tecnicos: any[]
  userRole: string
  userUnidadeId: number
}

export function OSForm({
  isOpen,
  onClose,
  onSuccess,
  editOrdem,
  unidades,
  aparelhos,
  tecnicos,
  userRole,
  userUnidadeId,
}: OSFormProps) {
  const isMasterOrFranqueado = userRole === "Master" || userRole === "Franqueado"
  const isEditing = !!editOrdem

  const [form, setForm] = useState({
    idUnidade: userUnidadeId,
    idAparelho: "",
    sintomaReclamado: "",
    precoOrcadoCliente: "",
    custoPeca: "",
    custoMaoObraTecnico: "",
    idTecnicoResponsavel: "",
  })
  const [fotos, setFotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editOrdem) {
      setForm({
        idUnidade: editOrdem.idUnidade || userUnidadeId,
        idAparelho: editOrdem.idAparelho?.toString() || "",
        sintomaReclamado: editOrdem.sintomaReclamado || "",
        precoOrcadoCliente: editOrdem.precoOrcadoCliente?.toString() || "",
        custoPeca: editOrdem.custoPeca?.toString() || "",
        custoMaoObraTecnico: editOrdem.custoMaoObraTecnico?.toString() || "",
        idTecnicoResponsavel: editOrdem.idTecnicoResponsavel?.toString() || "",
      })
    } else {
      setForm({
        idUnidade: userUnidadeId,
        idAparelho: "",
        sintomaReclamado: "",
        precoOrcadoCliente: "",
        custoPeca: "",
        custoMaoObraTecnico: "",
        idTecnicoResponsavel: "",
      })
      setFotos([])
    }
    setError("")
  }, [editOrdem, isOpen, userUnidadeId])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files))
    }
  }

  const uploadFotos = async (): Promise<string[]> => {
    if (fotos.length === 0) return []
    const uploadedUrls: string[] = []
    for (const foto of fotos) {
      const fd = new FormData()
      fd.append("file", foto)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        uploadedUrls.push(data.url)
      }
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      let fotosUrls = editOrdem?.fotosChecklistEntrada || []
      if (fotos.length > 0) {
        fotosUrls = await uploadFotos()
      }

      const body: any = {
        idUnidade: form.idUnidade,
        idAparelho: parseInt(form.idAparelho),
        sintomaReclamado: form.sintomaReclamado,
        ...(form.idTecnicoResponsavel && {
          idTecnicoResponsavel: parseInt(form.idTecnicoResponsavel),
        }),
        ...(isMasterOrFranqueado && {
          precoOrcadoCliente: form.precoOrcadoCliente
            ? parseFloat(form.precoOrcadoCliente)
            : undefined,
          custoPeca: form.custoPeca ? parseFloat(form.custoPeca) : undefined,
          custoMaoObraTecnico: form.custoMaoObraTecnico
            ? parseFloat(form.custoMaoObraTecnico)
            : undefined,
        }),
        fotosChecklistEntrada: fotosUrls,
      }

      if (!body.idAparelho || !body.sintomaReclamado) {
        setError("Aparelho e sintoma são obrigatórios")
        setSubmitting(false)
        return
      }

      const url = isEditing
        ? `/api/ordens-servico/${editOrdem.idOS || editOrdem.id}`
        : "/api/ordens-servico"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao salvar ordem")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar")
    } finally {
      setSubmitting(false)
    }
  }

  const aparelhoOptions = aparelhos.map((a: any) => ({
    value: a.id,
    label: `${a.marca} ${a.modelo}${a.imeiSerial ? ` - ${a.imeiSerial}` : ""}`,
  }))

  const tecnicoOptions = tecnicos.map((t: any) => ({
    value: t.id,
    label: t.nome,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="idUnidade" value={form.idUnidade} />

        <Select
          label="Aparelho"
          placeholder="Selecione um aparelho"
          options={aparelhoOptions}
          value={form.idAparelho}
          onChange={(e) => handleChange("idAparelho", e.target.value)}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sintoma Reclamado
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={form.sintomaReclamado}
            onChange={(e) => handleChange("sintomaReclamado", e.target.value)}
            placeholder="Descreva o problema relatado pelo cliente"
          />
        </div>

        <Select
          label="Técnico Responsável"
          placeholder="Selecione um técnico"
          options={tecnicoOptions}
          value={form.idTecnicoResponsavel}
          onChange={(e) => handleChange("idTecnicoResponsavel", e.target.value)}
        />

        {isMasterOrFranqueado && (
          <>
            <Input
              label="Preço Orçado (R$)"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.precoOrcadoCliente}
              onChange={(e) => handleChange("precoOrcadoCliente", e.target.value)}
            />
            <Input
              label="Custo Peça (R$)"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.custoPeca}
              onChange={(e) => handleChange("custoPeca", e.target.value)}
            />
            <Input
              label="Custo Mão de Obra (R$)"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.custoMaoObraTecnico}
              onChange={(e) => handleChange("custoMaoObraTecnico", e.target.value)}
            />
          </>
        )}

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotos do Checklist de Entrada
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          {fotos.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">{fotos.length} arquivo(s) selecionado(s)</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? "Atualizar" : "Criar Ordem de Serviço"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
