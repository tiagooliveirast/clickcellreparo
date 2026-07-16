"use client"

import { StatusOS, STATUS_OS_LABELS } from "@/types"
import { getStatusColor, cn } from "@/lib/utils"

interface BadgeProps {
  status: StatusOS
  className?: string
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getStatusColor(status),
        className
      )}
    >
      {STATUS_OS_LABELS[status] || status}
    </span>
  )
}
