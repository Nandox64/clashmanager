import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {icon && (
          <div className="text-clash-muted">{icon}</div>
        )}
      </CardHeader>
      <div className="space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold font-mono text-clash-text truncate min-w-0">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up" && "text-green-400",
                trend === "down" && "text-red-400",
                trend === "neutral" && "text-clash-muted"
              )}
            >
              {trend === "up" && <TrendingUp size={14} />}
              {trend === "down" && <TrendingDown size={14} />}
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-clash-muted">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
