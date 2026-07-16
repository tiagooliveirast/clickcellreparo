import { StatusOS, STATUS_OS_ORDER } from "@/types"

export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (num == null || isNaN(num)) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function getStatusColor(status: StatusOS): string {
  const colors: Record<string, string> = {
    Recebido: "bg-gray-100 text-gray-700 border-gray-300",
    Triagem: "bg-yellow-50 text-yellow-700 border-yellow-300",
    AguardandoOrcamento: "bg-orange-50 text-orange-700 border-orange-300",
    AguardandoCliente: "bg-red-50 text-red-700 border-red-300",
    AguardandoPeca: "bg-purple-50 text-purple-700 border-purple-300",
    NaBancada: "bg-blue-50 text-blue-700 border-blue-300",
    EmTestes: "bg-cyan-50 text-cyan-700 border-cyan-300",
    Higienizacao: "bg-teal-50 text-teal-700 border-teal-300",
    ProntoParaEntrega: "bg-green-50 text-green-700 border-green-300",
    Finalizado: "bg-emerald-100 text-emerald-800 border-emerald-400",
  }
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-300"
}

export function getStatusProgress(status: StatusOS): number {
  const index = STATUS_OS_ORDER.indexOf(status)
  return index >= 0 ? Math.round(((index + 1) / STATUS_OS_ORDER.length) * 100) : 0
}

export function canTransition(from: StatusOS, to: StatusOS): boolean {
  const fromIndex = STATUS_OS_ORDER.indexOf(from)
  const toIndex = STATUS_OS_ORDER.indexOf(to)
  return toIndex === fromIndex + 1
}

export function generateOSId(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `OS-${year}-${rand}`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
