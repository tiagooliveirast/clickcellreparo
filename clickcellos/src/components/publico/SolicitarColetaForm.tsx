"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { FiCheckCircle } from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa6"

interface SolicitarColetaFormProps {
  slug: string
}

const MARCA_OPTIONS = [
  { value: "Apple", label: "Apple" },
  { value: "Samsung", label: "Samsung" },
  { value: "Xiaomi", label: "Xiaomi" },
  { value: "Motorola", label: "Motorola" },
  { value: "outros", label: "Outros" },
]

export function SolicitarColetaForm({ slug }: SolicitarColetaFormProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ idOS: string; whatsapp: string } | null>(null)

  const [form, setForm] = useState({
    nomeCompleto: "",
    whatsapp: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    pontoRef: "",
    marca: "",
    modelo: "",
    cor: "",
    imeiSerial: "",
    sintomaReclamado: "",
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    if (!form.nomeCompleto || !form.whatsapp || !form.rua || !form.numero || !form.cidade || !form.marca || !form.modelo || !form.sintomaReclamado) {
      setError("Preencha todos os campos obrigatórios")
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/public/solicitar-coleta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nomeCompleto: form.nomeCompleto,
          whatsapp: form.whatsapp,
          enderecoRua: form.rua,
          enderecoNumero: form.numero,
          enderecoBairro: form.bairro,
          enderecoCidade: form.cidade,
          enderecoPontoRef: form.pontoRef,
          marca: form.marca,
          modelo: form.modelo,
          cor: form.cor,
          imeiSerial: form.imeiSerial,
          sintomaReclamado: form.sintomaReclamado,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao solicitar coleta")
      }

      const data = await res.json()
      setResult({ idOS: data.idOS, whatsapp: form.whatsapp })
      setStep("success")
    } catch (err: any) {
      setError(err.message || "Erro ao enviar solicitação")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "success" && result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="flex justify-center">
          <FiCheckCircle size={64} className="text-green-500" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Solicitação Enviada!
        </h2>
        <p className="mt-2 text-gray-600">
          Seu pedido de coleta foi registrado com sucesso.
        </p>
        <p className="mt-4 text-3xl font-bold text-blue-600">{result.idOS}</p>
        <p className="mt-2 text-sm text-gray-500">
          Guarde este número para acompanhar o reparo.
        </p>
        <a
          href={`https://wa.me/${result.whatsapp.replace(/\D/g, "")}?text=Olá! Solicitei uma coleta pelo site. Meu código é ${result.idOS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-white font-bold transition-colors hover:bg-green-600"
        >
          <FaWhatsapp size={20} />
          Acompanhar pelo WhatsApp
        </a>
        <div className="mt-4">
          <a
            href={`/${slug}/rastrear`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Rastrear OS
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      {/* Seus Dados */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Seus Dados</h2>
        <div className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Seu nome"
            value={form.nomeCompleto}
            onChange={(e) => updateField("nomeCompleto", e.target.value)}
            required
          />
          <Input
            label="WhatsApp *"
            placeholder="(11) 99999-9999"
            value={form.whatsapp}
            onChange={(e) => updateField("whatsapp", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Endereço */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Endereço</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Rua *"
            placeholder="Rua, Av..."
            value={form.rua}
            onChange={(e) => updateField("rua", e.target.value)}
            required
            className="col-span-2"
          />
          <Input
            label="Número *"
            placeholder="123"
            value={form.numero}
            onChange={(e) => updateField("numero", e.target.value)}
            required
          />
          <Input
            label="Bairro"
            placeholder="Bairro"
            value={form.bairro}
            onChange={(e) => updateField("bairro", e.target.value)}
          />
          <Input
            label="Cidade *"
            placeholder="Sua cidade"
            value={form.cidade}
            onChange={(e) => updateField("cidade", e.target.value)}
            required
          />
          <Input
            label="Ponto de Referência"
            placeholder="Próximo a..."
            value={form.pontoRef}
            onChange={(e) => updateField("pontoRef", e.target.value)}
          />
        </div>
      </div>

      {/* Aparelho */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Aparelho</h2>
        <div className="space-y-4">
          <Select
            label="Marca *"
            placeholder="Selecione a marca"
            options={MARCA_OPTIONS}
            value={form.marca}
            onChange={(e) => updateField("marca", e.target.value)}
          />
          <Input
            label="Modelo *"
            placeholder="Ex: iPhone 14, Galaxy S24"
            value={form.modelo}
            onChange={(e) => updateField("modelo", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cor"
              placeholder="Cor do aparelho"
              value={form.cor}
              onChange={(e) => updateField("cor", e.target.value)}
            />
            <Input
              label="IMEI / Serial"
              placeholder="Número de série"
              value={form.imeiSerial}
              onChange={(e) => updateField("imeiSerial", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Defeito */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Defeito</h2>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sintoma / Defeito Relatado *
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Descreva o problema que o aparelho está apresentando..."
            value={form.sintomaReclamado}
            onChange={(e) => updateField("sintomaReclamado", e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" loading={submitting} size="lg" className="w-full">
        Solicitar Coleta Grátis
      </Button>
    </form>
  )
}
