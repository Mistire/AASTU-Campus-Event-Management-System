"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { chartColorsFallback } from "@/components/cems/theme";
import { useCategoryAnalytics } from "@/features/dashboard/api/getCategoryAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryDistributionChart() {
  const { data, isLoading } = useCategoryAnalytics("30d");

  if (isLoading) {
    return <Skeleton className="w-full h-[220px] rounded-xl" />;
  }

  const chartData = (data || [])
    .filter((d) => d.registrations > 0)
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 6)
    .map((d) => ({
      name: d.name,
      value: d.registrations,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        No category data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          animationDuration={1200}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColorsFallback[index % chartColorsFallback.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 10, fontWeight: 600 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
