"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { formatDate, getStatusProgress } from "@/lib/utils"
import type { StatusOS } from "@/types"

interface OSCardProps {
  ordem: any
  onClick?: () => void
}

export function OSCard({ ordem, onClick }: OSCardProps) {
  return (
    <Card onClick={onClick} className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">{ordem.idOS}</span>
        <Badge status={ordem.statusOS as StatusOS} />
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p className="font-medium text-gray-800">
          {ordem.aparelho?.marca} {ordem.aparelho?.modelo}
        </p>
        <p>{ordem.cliente?.nomeCompleto}</p>
      </div>
      <ProgressBar percentage={getStatusProgress(ordem.statusOS as StatusOS)} />
      <p className="text-xs text-gray-400">
        {formatDate(ordem.dataAbertura)}
      </p>
    </Card>
  )
}
