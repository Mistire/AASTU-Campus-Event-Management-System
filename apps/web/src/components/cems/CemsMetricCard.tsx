import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface CemsMetricCardProps {
  /** Label above the value (e.g. "Total Users") */
  title: string;
  /** The main numeric value */
  value: string | number;
  /** Lucide icon component */
  icon: React.ElementType;
  /** Optional secondary text (e.g. "+12 TODAY") */
  subValue?: string;
  /** Trend direction — controls color of subValue badge */
  trend?: TrendDirection;
  className?: string;
}

const trendStyles: Record<TrendDirection, string> = {
  up: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  down: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  neutral: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

/**
 * CEMS Metric Card — compact stat card for dashboards.
 *
 * Horizontal layout: Icon left, value + label right.
 * Much more space-efficient than the previous 140px tall version.
 */
export function CemsMetricCard({
  title,
  value,
  icon: Icon,
  subValue,
  trend = "neutral",
  className,
}: CemsMetricCardProps) {
  return (
    <Card
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg shadow-sm shadow-gray-200/60 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800",
        "group hover:shadow-md hover:shadow-gray-200/80 dark:hover:shadow-brand/5 hover:-translate-y-0.5 transition-all duration-300",
        "overflow-hidden",
        className,
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/10 transition-colors">
          <Icon size={20} />
        </div>

        {/* Value + Label */}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            {value}
          </div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 truncate">
            {title}
          </p>
        </div>

        {/* Optional trend badge */}
        {subValue && (
          <div
            className={cn(
              "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0",
              trendStyles[trend],
            )}
          >
            {subValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
