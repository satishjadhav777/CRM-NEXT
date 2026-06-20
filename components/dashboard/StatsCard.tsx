import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  change?: number;
  changeLabel?: string;
  description?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  change,
  changeLabel,
  description,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {(change !== undefined || description) && (
              <div className="mt-2 flex items-center gap-1">
                {change !== undefined && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isPositive ? "text-green-600" : "text-red-500"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {change}%
                    </span>
                  </>
                )}
                {changeLabel && (
                  <span className="text-xs text-gray-500">{changeLabel}</span>
                )}
                {description && !changeLabel && (
                  <span className="text-xs text-gray-500">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
