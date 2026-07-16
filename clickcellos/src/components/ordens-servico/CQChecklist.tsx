"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Spinner } from "@/components/ui/Spinner"

interface CQChecklistProps {
  ordem: any
  editable: boolean
  onSave?: (data: any) => void
}

const ITEMS = [
  { key: "faceIDBiometria", label: "FaceID / Biometria" },
  { key: "touchscreen", label: "Touchscreen" },
  { key: "conexaoWiFi", label: "Conexão Wi-Fi" },
  { key: "microfone", label: "Microfone" },
  { key: "altoFalantes", label: "Alto-Falantes" },
  { key: "conectorCarga", label: "Conector de Carga" },
]

export function CQChecklist({ ordem, editable, onSave }: CQChecklistProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const initial: Record<string, boolean> = {}
    for (const item of ITEMS) {
      initial[item.key] = ordem[item.key] ?? false
    }
    setChecklist(initial)
  }, [ordem])

  const toggle = (key: string) => {
    if (!editable) return
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const checkedCount = ITEMS.filter((item) => checklist[item.key]).length
  const progress = Math.round((checkedCount / ITEMS.length) * 100)

  const handleSave = () => {
    if (!editable || !onSave) return
    setSaving(true)
    onSave(checklist)
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Checklist de Qualidade</span>
          <span className="text-gray-500">{checkedCount}/{ITEMS.length}</span>
        </div>
        <ProgressBar percentage={progress} color={progress === 100 ? "bg-green-500" : undefined} />
      </div>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <label
            key={item.key}
            className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
              editable ? "cursor-pointer hover:bg-gray-50" : ""
            } ${checklist[item.key] ? "border-green-300 bg-green-50" : "border-gray-200"}`}
          >
            <input
              type="checkbox"
              checked={checklist[item.key] || false}
              onChange={() => toggle(item.key)}
              disabled={!editable}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className={checklist[item.key] ? "text-green-800 font-medium" : "text-gray-700"}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
      {editable && onSave && (
        <Button onClick={handleSave} loading={saving} className="w-full">
          Salvar Checklist
        </Button>
      )}
    </div>
  )
}
