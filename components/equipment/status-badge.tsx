import { Badge } from "@/components/ui/badge"
import type { EquipmentStatus } from "@/lib/store/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: EquipmentStatus
  className?: string
}

const statusConfig: Record<
  EquipmentStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25",
  },
  damaged: {
    label: "Damaged",
    className: "bg-red-500/15 text-red-500 hover:bg-red-500/25",
  },
  lost: {
    label: "Lost",
    className: "bg-gray-500/15 text-gray-400 hover:bg-gray-500/25",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
