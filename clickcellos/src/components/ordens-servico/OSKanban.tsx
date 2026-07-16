"use client"

import { STATUS_OS_ORDER, STATUS_OS_LABELS, type StatusOS } from "@/types"
import { OSCard } from "./OSCard"
import { cn } from "@/lib/utils"

interface OSKanbanProps {
  ordens: any[]
  onSelect: (id: number) => void
}

export function OSKanban({ ordens, onSelect }: OSKanbanProps) {
  const grouped: Record<string, any[]> = {}
  for (const status of STATUS_OS_ORDER) {
    grouped[status] = []
  }
  for (const ordem of ordens) {
    if (grouped[ordem.statusOS]) {
      grouped[ordem.statusOS].push(ordem)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_OS_ORDER.map((status) => {
        const items = grouped[status] || []
        return (
          <div
            key={status}
            className="flex-shrink-0 w-72"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-gray-700">
                {STATUS_OS_LABELS[status]}
              </h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                {items.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {items.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">Vazio</p>
                </div>
              ) : (
                items.map((ordem) => (
                  <OSCard
                    key={ordem.id}
                    ordem={ordem}
                    onClick={() => onSelect(ordem.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
