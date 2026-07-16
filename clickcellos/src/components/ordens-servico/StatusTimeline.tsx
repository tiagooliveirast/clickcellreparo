"use client"

import { formatDateTime } from "@/lib/utils"
import { STATUS_OS_LABELS, type StatusOS } from "@/types"
import { FiArrowDown } from "react-icons/fi"

interface StatusTimelineProps {
  logs: any[]
}

export function StatusTimeline({ logs }: StatusTimelineProps) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum registro de status.</p>
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="space-y-0">
      {sorted.map((log, idx) => (
        <div key={log.id || idx} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            {idx < sorted.length - 1 && (
              <div className="flex-1 border-l-2 border-dashed border-gray-300" />
            )}
          </div>
          <div className="-mt-1 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {STATUS_OS_LABELS[log.statusNovo as StatusOS] || log.statusNovo}
              </span>
              {idx < sorted.length - 1 && (
                <FiArrowDown size={14} className="text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{log.usuario?.nome || "Sistema"}</span>
              <span>·</span>
              <span>{formatDateTime(log.timestamp)}</span>
            </div>
            {log.statusAnterior && (
              <p className="text-xs text-gray-400">
                Anterior: {STATUS_OS_LABELS[log.statusAnterior as StatusOS] || log.statusAnterior}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
