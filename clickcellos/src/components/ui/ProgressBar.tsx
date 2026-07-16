import { cn } from "@/lib/utils"

interface ProgressBarProps {
  percentage: number
  className?: string
  color?: string
}

export function ProgressBar({
  percentage,
  className,
  color,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage))

  return (
    <div className={cn("w-full rounded-full bg-gray-200 h-2", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          color || "bg-blue-600"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
