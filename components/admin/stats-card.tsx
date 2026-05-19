import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: number; positive?: boolean }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && <p className="text-xs text-gray-400">{description}</p>}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-600" : "text-red-600",
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-green-50 rounded-lg">
              <Icon className="h-5 w-5 text-green-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
