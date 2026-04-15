"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartColorsFallback } from "@/components/cems/theme";
import { useDepartmentAnalytics } from "@/features/dashboard/api/getDepartmentAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

export function DepartmentActivityChart() {
  const { data, isLoading } = useDepartmentAnalytics("30d");

  if (isLoading) {
    return <Skeleton className="w-full h-[220px] rounded-xl" />;
  }

  const chartData = (data || [])
    .filter((d) => d.registrations > 0)
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 8)
    .map((d) => ({
      name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
      registrations: d.registrations,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        No department data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Bar
          dataKey="registrations"
          fill={chartColorsFallback[0]}
          radius={[6, 6, 0, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
