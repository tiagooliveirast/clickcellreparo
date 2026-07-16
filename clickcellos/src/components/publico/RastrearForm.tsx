"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { FiSearch } from "react-icons/fi"

interface RastrearFormProps {
  onResult: (data: any) => void
  slug: string
}

export function RastrearForm({ onResult, slug }: RastrearFormProps) {
  const [consulta, setConsulta] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consulta.trim()) {
      setError("Digite o número da OS ou WhatsApp")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/public/rastrear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta: consulta.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Ordem não encontrada")
      }

      const data = await res.json()
      onResult(data)
    } catch (err: any) {
      setError(err.message || "Erro ao buscar ordem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <Input
        label="Número da OS ou WhatsApp"
        placeholder="Ex: OS-2026-1234 ou (11) 99999-9999"
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        icon={<FiSearch size={18} />}
      />
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <Button type="submit" loading={loading} size="lg" className="w-full">
        Rastrear
      </Button>
    </form>
  )
}
